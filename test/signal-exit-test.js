/* global describe, it */

var exec = require('child_process').exec,
  expect = require('chai').expect

require('chai').should()
require('tap').mochaGlobals()

describe('signal-exit', function () {
  it('receives an exit event when a process exits normally', function (done) {
    exec(process.execPath + ' ./test/fixtures/end-of-execution.js', function (err, stdout, stderr) {
      expect(err).to.equal(null)
      stdout.should.match(/reached end of execution/)
      done()
    })
  })

  it('receives an exit event when a process is terminated with sigint', function (done) {
    exec(process.execPath + ' ./test/fixtures/sigint.js', function (err, stdout, stderr) {
      err.signal.should.equal('SIGINT')
      stdout.should.match(/exited with sigint/)
      done()
    })
  })

  it('receives an exit event when a process is terminated with sigterm', function (done) {
    exec(process.execPath + ' ./test/fixtures/sigterm.js', function (err, stdout, stderr) {
      err.signal.should.equal('SIGTERM')
      stdout.should.match(/exited with sigterm/)
      done()
    })
  })

  it('receives an exit event when process.exit() is called', function (done) {
    exec(process.execPath + ' ./test/fixtures/exit.js', function (err, stdout, stderr) {
      err.code.should.equal(32)
      stdout.should.match(/exited with process\.exit()/)
      done()
    })
  })
})
