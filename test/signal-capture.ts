import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import { resolve } from 'node:path'
import t from 'tap'

const f = resolve(__dirname, 'fixtures/signal-capture.js')

const skip = process.platform === 'win32' ? 'skip on windows' : false

type Result = {
  stdout: string
  stderr: string
  code: null | number
  signal: null | NodeJS.Signals
}

type PromiseWithProc<T> = Promise<T> & {
  proc: ChildProcessWithoutNullStreams
}
const run = (
  exit: number | NodeJS.Signals | 'null' = 'null',
  capture: 'capture' | 'captureExit' | 'captureAfterExit' | 'none' = 'none'
): PromiseWithProc<Result> => {
  const args: string[] = [f, String(exit), capture]
  const proc = spawn(process.execPath, args)
  const { stdout, stderr } = proc
  const out: Buffer[] = []
  const err: Buffer[] = []
  stdout.on('data', c => out.push(c))
  stderr.on('data', c => err.push(c))
  return Object.assign(
    new Promise<Result>(r => {
      proc.on('close', (code, signal) => {
        r({
          code,
          signal,
          stdout: Buffer.concat(out).toString(),
          stderr: Buffer.concat(err).toString(),
        })
      })
    }),
    { proc }
  )
}

t.test('graceful exit', async t => {
  const r = await run()
  t.match(r, { code: 0, signal: null })
  t.equal(r.stderr, '')
  t.matchSnapshot(r.stdout)
})

t.test('exit 0', async t => {
  const r = await run(0)
  t.match(r, { code: 0, signal: null })
  t.equal(r.stderr, '')
  t.matchSnapshot(r.stdout)
})

t.test('exit 1', async t => {
  const r = await run(1)
  t.match(r, { code: 1, signal: null })
  t.equal(r.stderr, '')
  t.matchSnapshot(r.stdout)
})

t.test('signal, no capture', { skip }, async t => {
  const r = await run('SIGHUP')
  t.match(r, { code: null, signal: 'SIGHUP' })
  t.equal(r.stderr, '')
  t.matchSnapshot(r.stdout)
})

t.test('signal, capture exit', { skip }, async t => {
  const r = await run('SIGHUP', 'captureExit')
  t.match(r, { code: 0, signal: null })
  t.equal(r.stderr, '')
  t.matchSnapshot(r.stdout)
})

t.test('signal, capture afterExit', { skip }, async t => {
  const r = await run('SIGHUP', 'captureAfterExit')
  t.match(r, { code: 0, signal: null })
  t.equal(r.stderr, '')
  t.matchSnapshot(r.stdout)
})

t.test('signal, capture both', { skip }, async t => {
  const r = await run('SIGHUP', 'capture')
  t.match(r, { code: 0, signal: null })
  t.equal(r.stderr, '')
  t.matchSnapshot(r.stdout)
})
