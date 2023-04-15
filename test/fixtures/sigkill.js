// SIGKILL can't be caught, and in fact, even trying to add the
// listener will throw an error.
// We handle that nicely.
//
// This is just here to get another few more lines of test
// coverage.  That's also why it lies about being on a linux
// platform so that we pull in those other event types.

Object.defineProperty(process, 'platform', {
  value: 'linux',
  writable: false,
  enumerable: true,
  configurable: true,
})

const { signals } = require('../../dist/cjs/signals.js')
signals.push('SIGKILL')
const { load } = require('../../')
load()
