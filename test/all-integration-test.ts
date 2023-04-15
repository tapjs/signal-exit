import assert from 'assert'
import { exec } from 'child_process'
import t from 'tap'
import { signals } from '../dist/cjs/index.js'

const isWindows = process.platform === 'win32'
const shell = isWindows ? null : { shell: '/bin/bash' }
const node = isWindows ? '"' + process.execPath + '"' : process.execPath

import { isExecErr } from './fixtures/exec-err'

// These are signals that are aliases for other signals, so
// the result will sometimes be one of the others.  For these,
// we just verify that we GOT a signal, not what it is.
const weirdSignal = (sig: any) =>
  sig === 'SIGIOT' ||
  sig === 'SIGIO' ||
  sig === 'SIGSYS' ||
  sig === 'SIGIOT' ||
  sig === 'SIGABRT' ||
  sig === 'SIGPOLL' ||
  sig === 'SIGUNUSED' ||
  sig === 'SIGHUP' // aliased on Windows

const exiterJS = require.resolve('./fixtures/exiter.js')
// Exhaustively test every signal, and a few numbers.
// signal-exit does not currently support process.kill()
// on win32.
const sigs: (string | number)[] = isWindows ? [] : [...signals]
sigs.push('', 0, 1, 2, 3, 54)
for (const sig of sigs) {
  // sighup is weird and unstoppable on windows
  if (sig === 'SIGHUP') continue
  t.test('exits properly: ' + sig, t => {
    const cmd = node + ' ' + exiterJS + ' ' + sig
    exec(cmd, shell, (err, stdout) => {
      if (sig) {
        if (!isExecErr(err)) {
          throw new Error('did not get exec err: ' + String(err))
        }
        if (!isNaN(+sig)) {
          if (!isWindows) t.equal(err.code, sig)
        } else if (!weirdSignal(sig)) {
          if (!isWindows) t.equal(err.signal, sig)
        } else if (sig) {
          if (!isWindows) t.ok(err.signal)
        }
      } else {
        if (err) throw err
      }
      const data = JSON.parse(stdout.toString())

      if (weirdSignal(sig)) {
        data.wanted[1] = true
        data.found[1] = !!data.found[1]
      }
      assert.deepEqual(data.found, data.wanted)
      t.end()
    })
  })
}

const parentJS = require.resolve('./fixtures/parent.js')
for (const sig of signals) {
  if (sig === 'SIGHUP') continue
  t.test('exits properly: (external sig) ' + sig, t => {
    const cmd = node + ' ' + parentJS + ' ' + sig
    exec(cmd, shell, (err, stdout) => {
      if (err) throw err
      const data = JSON.parse(stdout.toString())

      if (weirdSignal(sig)) {
        data.wanted[1] = true
        data.found[1] = !!data.found[1]
        data.external[1] = !!data.external[1]
      }
      t.same(data.found, data.wanted)
      t.same(data.external, data.wanted)
      t.end()
    })
  })
}
