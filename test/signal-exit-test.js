/* global describe, it */

var exec = require('child_process').exec,
  expect = require('chai').expect,
  assert = require('assert')

require('chai').should()
require('tap').mochaGlobals()

process.env.NYC_TEST = 'yep'

describe('signal-exit', function () {
  it('receives an exit event when a process exits normally', function (done) {
    exec(process.execPath + ' ./test/fixtures/end-of-execution.js', function (err, stdout, stderr) {
      expect(err).to.equal(null)
      stdout.should.match(/reached end of execution, 0, undefined/)
      done()
    })
  })

  it('receives an exit event when a process is terminated with sigint', function (done) {
    exec(process.execPath + ' ./test/fixtures/sigint.js', function (err, stdout, stderr) {
      assert(err)
      stdout.should.match(/exited with sigint, 130, SIGINT/)
      done()
    })
  })

  it('receives an exit event when a process is terminated with sigterm', function (done) {
    exec(process.execPath + ' ./test/fixtures/sigterm.js', function (err, stdout, stderr) {
      assert(err)
      stdout.should.match(/exited with sigterm, 143, SIGTERM/)
      done()
    })
  })

  it('receives an exit event when process.exit() is called', function (done) {
    exec(process.execPath + ' ./test/fixtures/exit.js', function (err, stdout, stderr) {
      err.code.should.equal(32)
      stdout.should.match(/exited with process\.exit\(\), 32, undefined/)
      done()
    })
  })

  it('does not exit if user handles signal', function (done) {
    exec(process.execPath + ' ./test/fixtures/signal-listener.js', function (err, stdout, stderr) {
      assert(err)
      assert.equal(stdout, 'exited calledListener=4, code=129, signal="SIGHUP"\n')
      done()
    })
  })

  it('ensures that if alwaysLast=true, the handler is run last', function (done) {
    exec(process.execPath + ' ./test/fixtures/signal-last.js', function (err, stdout, stderr) {
      assert(err)
      stdout.should.match(/first counter=1/)
      stdout.should.match(/last counter=2/)
      done()
    })
  })
})
