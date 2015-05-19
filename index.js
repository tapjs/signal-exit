var assert = require('assert')

module.exports = function (cb, opts) {
  assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler')

  var emittedExit = false,
    listenerMap = {},
    listeners = []

  opts = opts || {}
  opts.minimumListeners = opts.maxListeners || 1

  Object.keys(signals).forEach(function (sig) {
    var listener = function () {
      // If there are no other listeners, do the default action.
      if (process.listeners(sig).length <= opts.maxListeners) {
        process.removeListener(sig, listener)
        cb(process.exitCode || signals[sig], sig)
        process.kill(process.pid, sig)
      }
    }

    listenerMap[sig] = listener
    listeners.push(listener)

    try {
      process.on(sig, listener)
    } catch (er) {}
  })

  var listener = function (code) {
    if (emittedExit) return
    emittedExit = true
    return cb(code, undefined)
  }

  listenerMap['exit'] = listener
  listeners.push(listener)
  process.on('exit', listener)

  if (opts.alwaysLast) monkeyPatchAddListener(listenerMap, listeners)
}

// in some cases we always want to ensure that the
// onExit handler registered with signal-exit is
// the last event handler to fire, e.g, for code coverage.
function monkeyPatchAddListener (listenerMap, listeners) {
  var events = Object.keys(listenerMap),
    listener

  process.on = process.addListener = (function (on) {
    return function (ev, fn) {
      for (var i = 0, event; (event = events[i]) !== undefined; i++) {
        listener = listenerMap[event]

        if (ev === event && listeners.indexOf(fn) === -1) {
          process.removeListener(ev, listener)
          var ret = on.call(process, ev, fn)
          on.call(process, ev, listener)
          return ret
        }
      }

      return on.apply(this, arguments)
    }
  })(process.on)
}

var signals = {
  'SIGALRM': 142,
  'SIGBUS': 138,
  'SIGCLD': undefined,
  'SIGEMT': undefined,
  'SIGFPE': 136,
  'SIGHUP': 129,
  'SIGILL': 132,
  'SIGINFO': undefined,
  'SIGINT': 130, // CTRL^C
  'SIGIOT': 134,
  'SIGKILL': 137, // can't be caught, but let's keep it here.
  'SIGLOST': undefined,
  'SIGPIPE': 141,
  'SIGPOLL': undefined,
  'SIGPROF': 155,
  'SIGPWR': undefined,
  'SIGQUIT': 131,
  'SIGSEGV': 139,
  'SIGSTKFLT': undefined,
  'SIGSYS': 140,
  'SIGTERM': 143, // polite exit code, can be caught.
  'SIGTRAP': 133,
  'SIGTSTP': 146,
  'SIGTTIN': 149,
  'SIGTTOU': 150,
  'SIGUNUSED': undefined,
  'SIGUSR2': 159,
  'SIGVTALRM': 154,
  'SIGXCPU': 152,
  'SIGXFSZ': 153
}

/* var nonFatalSignals = [
  'SIGWINCH', // resize window.
  'SIGUSR1', // debugger.
  'SIGCHLD',
  'SIGSTOP',
  'SIGCONT',
  'SIGIO',
  'SIGURG',
  'SIGABRT',
  'SIGURG' // out of band data.
] */
