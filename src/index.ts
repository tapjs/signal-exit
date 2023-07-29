// Note: since nyc uses this module to output coverage, any lines
// that are in the direct sync flow of nyc's outputCoverage are
// ignored, since we can never get coverage for them.
// grab a reference to node's real process object right away
import { signals } from './signals.js'
export { signals }

// just a loosened process type so we can do some evil things
type ProcessRE = NodeJS.Process & {
  reallyExit: (code?: number | undefined | null) => any
  emit: (ev: string, ...a: any[]) => any
}

const processOk = (process: any): process is ProcessRE =>
  !!process &&
  typeof process === 'object' &&
  typeof process.removeListener === 'function' &&
  typeof process.emit === 'function' &&
  typeof process.reallyExit === 'function' &&
  typeof process.listeners === 'function' &&
  typeof process.kill === 'function' &&
  typeof process.pid === 'number' &&
  typeof process.on === 'function'

const kExitEmitter = Symbol.for('signal-exit emitter')
const global: typeof globalThis & { [kExitEmitter]?: Emitter } = globalThis
const ObjectDefineProperty = Object.defineProperty.bind(Object)

/**
 * A function that takes an exit code and signal as arguments
 *
 * In the case of signal exits *only*, a return value of true
 * will indicate that the signal is being handled, and we should
 * not synthetically exit with the signal we received. Regardless
 * of the handler return value, the handler is unloaded when an
 * otherwise fatal signal is received, so you get exactly 1 shot
 * at it, unless you add another onExit handler at that point.
 *
 * In the case of numeric code exits, we may already have committed
 * to exiting the process, for example via a fatal exception or
 * unhandled promise rejection, so it is impossible to stop safely.
 */
export type Handler = (
  code: number | null | undefined,
  signal: NodeJS.Signals | null
) => true | void
type ExitEvent = 'afterExit' | 'exit'
type Emitted = { [k in ExitEvent]: boolean }
type Listeners = { [k in ExitEvent]: Handler[] }

// teeny special purpose ee
class Emitter {
  emitted: Emitted = {
    afterExit: false,
    exit: false,
  }

  listeners: Listeners = {
    afterExit: [],
    exit: [],
  }

  count: number = 0
  id: number = Math.random()

  constructor() {
    if (global[kExitEmitter]) {
      return global[kExitEmitter]
    }
    ObjectDefineProperty(global, kExitEmitter, {
      value: this,
      writable: false,
      enumerable: false,
      configurable: false,
    })
  }

  on(ev: ExitEvent, fn: Handler) {
    this.listeners[ev].push(fn)
  }

  removeListener(ev: ExitEvent, fn: Handler) {
    const list = this.listeners[ev]
    const i = list.indexOf(fn)
    /* c8 ignore start */
    if (i === -1) {
      return
    }
    /* c8 ignore stop */
    if (i === 0 && list.length === 1) {
      list.length = 0
    } else {
      list.splice(i, 1)
    }
  }

  emit(
    ev: ExitEvent,
    code: number | null | undefined,
    signal: NodeJS.Signals | null
  ): boolean {
    if (this.emitted[ev]) {
      return false
    }
    this.emitted[ev] = true
    let ret: boolean = false
    for (const fn of this.listeners[ev]) {
      ret = fn(code, signal) === true || ret
    }
    if (ev === 'exit') {
      ret = this.emit('afterExit', code, signal) || ret
    }
    return ret
  }
}

abstract class SignalExitBase {
  abstract onExit(cb: Handler, opts?: { alwaysLast?: boolean }): () => void
  abstract load(): void
  abstract unload(): void
}

const signalExitWrap = <T extends SignalExitBase>(handler: T) => {
  return {
    onExit(cb: Handler, opts?: { alwaysLast?: boolean }) {
      return handler.onExit(cb, opts)
    },
    load() {
      return handler.load()
    },
    unload() {
      return handler.unload()
    },
  }
}

class SignalExitFallback extends SignalExitBase {
  onExit() {
    return () => {}
  }
  load() {}
  unload() {}
}

class SignalExit extends SignalExitBase {
  // "SIGHUP" throws an `ENOSYS` error on Windows,
  // so use a supported signal instead
  /* c8 ignore start */
  #hupSig = process.platform === 'win32' ? 'SIGINT' : 'SIGHUP'
  /* c8 ignore stop */
  #emitter = new Emitter()
  #process: ProcessRE
  #originalProcessEmit: ProcessRE['emit']
  #originalProcessReallyExit: ProcessRE['reallyExit']

  #sigListeners: { [k in NodeJS.Signals]?: () => void } = {}
  #loaded: boolean = false

  constructor(process: ProcessRE) {
    super()
    this.#process = process
    // { <signal>: <listener fn>, ... }
    this.#sigListeners = {}
    for (const sig of signals) {
      this.#sigListeners[sig] = () => {
        // If there are no other listeners, an exit is coming!
        // Simplest way: remove us and then re-send the signal.
        // We know that this will kill the process, so we can
        // safely emit now.
        const listeners = this.#process.listeners(sig)
        let { count } = this.#emitter
        // This is a workaround for the fact that signal-exit v3 and signal
        // exit v4 are not aware of each other, and each will attempt to let
        // the other handle it, so neither of them do. To correct this, we
        // detect if we're the only handler *except* for previous versions
        // of signal-exit, and increment by the count of listeners it has
        // created.
        /* c8 ignore start */
        const p = process as unknown as {
          __signal_exit_emitter__?: { count: number }
        }
        if (
          typeof p.__signal_exit_emitter__ === 'object' &&
          typeof p.__signal_exit_emitter__.count === 'number'
        ) {
          count += p.__signal_exit_emitter__.count
        }
        /* c8 ignore stop */
        if (listeners.length === count) {
          this.unload()
          const ret = this.#emitter.emit('exit', null, sig)
          /* c8 ignore start */
          const s = sig === 'SIGHUP' ? this.#hupSig : sig
          if (!ret) process.kill(process.pid, s)
          /* c8 ignore stop */
        }
      }
    }

    this.#originalProcessReallyExit = process.reallyExit
    this.#originalProcessEmit = process.emit
  }

  onExit(cb: Handler, opts?: { alwaysLast?: boolean }) {
    /* c8 ignore start */
    if (!processOk(this.#process)) {
      return () => {}
    }
    /* c8 ignore stop */

    if (this.#loaded === false) {
      this.load()
    }

    const ev = opts?.alwaysLast ? 'afterExit' : 'exit'
    this.#emitter.on(ev, cb)
    return () => {
      this.#emitter.removeListener(ev, cb)
      if (
        this.#emitter.listeners['exit'].length === 0 &&
        this.#emitter.listeners['afterExit'].length === 0
      ) {
        this.unload()
      }
    }
  }

  load() {
    if (this.#loaded) {
      return
    }
    this.#loaded = true

    // This is the number of onSignalExit's that are in play.
    // It's important so that we can count the correct number of
    // listeners on signals, and don't wait for the other one to
    // handle it instead of us.
    this.#emitter.count += 1

    for (const sig of signals) {
      try {
        const fn = this.#sigListeners[sig]
        if (fn) this.#process.on(sig, fn)
      } catch (_) {}
    }

    this.#process.emit = (ev: string, ...a: any[]) => {
      return this.#processEmit(ev, ...a)
    }
    this.#process.reallyExit = (code?: number | null | undefined) => {
      return this.#processReallyExit(code)
    }
  }

  unload() {
    if (!this.#loaded) {
      return
    }
    this.#loaded = false

    signals.forEach(sig => {
      const listener = this.#sigListeners[sig]
      /* c8 ignore start */
      if (!listener) {
        throw new Error('Listener not defined for signal: ' + sig)
      }
      /* c8 ignore stop */
      try {
        this.#process.removeListener(sig, listener)
        /* c8 ignore start */
      } catch (_) {}
      /* c8 ignore stop */
    })
    this.#process.emit = this.#originalProcessEmit
    this.#process.reallyExit = this.#originalProcessReallyExit
    this.#emitter.count -= 1
  }

  #processReallyExit(code?: number | null | undefined) {
    /* c8 ignore start */
    if (!processOk(this.#process)) {
      return 0
    }
    this.#process.exitCode = code || 0
    /* c8 ignore stop */

    this.#emitter.emit('exit', this.#process.exitCode, null)
    return this.#originalProcessReallyExit.call(
      this.#process,
      this.#process.exitCode
    )
  }

  #processEmit(ev: string, ...args: any[]): any {
    const og = this.#originalProcessEmit
    if (ev === 'exit' && processOk(this.#process)) {
      if (typeof args[0] === 'number') {
        this.#process.exitCode = args[0]
        /* c8 ignore start */
      }
      /* c8 ignore start */
      const ret = og.call(this.#process, ev, ...args)
      /* c8 ignore start */
      this.#emitter.emit('exit', this.#process.exitCode, null)
      /* c8 ignore stop */
      return ret
    } else {
      return og.call(this.#process, ev, ...args)
    }
  }
}

const process = globalThis.process
// wrap so that we call the method on the actual handler, without
// exporting it directly.
export const {
  /**
   * Called when the process is exiting, whether via signal, explicit
   * exit, or running out of stuff to do.
   *
   * If the global process object is not suitable for instrumentation,
   * then this will be a no-op.
   *
   * Returns a function that may be used to unload signal-exit.
   */
  onExit,

  /**
   * Load the listeners.  Likely you never need to call this, unless
   * doing a rather deep integration with signal-exit functionality.
   * Mostly exposed for the benefit of testing.
   *
   * @internal
   */
  load,

  /**
   * Unload the listeners.  Likely you never need to call this, unless
   * doing a rather deep integration with signal-exit functionality.
   * Mostly exposed for the benefit of testing.
   *
   * @internal
   */
  unload,
} = signalExitWrap(
  processOk(process) ? new SignalExit(process) : new SignalExitFallback()
)
