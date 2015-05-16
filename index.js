var assert = require('assert')

module.exports = function (cb) {
  assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler')

  var emittedExit = false

  signals.forEach(function (sig) {
    var listener = function () {
      if (emittedExit) return

      process.removeListener(sig, listener)
      emittedExit = true
      cb()

      process.kill(process.pid, sig)
    }

    try {
      process.on(sig, listener)
    } catch (er) {}
  })

  process.on('exit', function () {
    if (emittedExit) return
    emittedExit = true
    return cb()
  })
}

var signals = [
  'SIGABRT',
  'SIGALRM',
  'SIGBUS',
  'SIGCHLD',
  'SIGCLD',
  'SIGCONT',
  'SIGEMT',
  'SIGFPE',
  'SIGHUP',
  'SIGILL',
  'SIGINFO',
  'SIGINT',
  'SIGIO',
  'SIGIOT',
  'SIGKILL',
  'SIGLOST',
  'SIGPIPE',
  'SIGPOLL',
  'SIGPROF',
  'SIGPWR',
  'SIGQUIT',
  'SIGSEGV',
  'SIGSTKFLT',
  'SIGSTOP',
  'SIGSYS',
  'SIGTERM',
  'SIGTRAP',
  'SIGTSTP',
  'SIGTTIN',
  'SIGTTOU',
  'SIGUNUSED',
  'SIGURG',
  'SIGUSR1',
  'SIGUSR2',
  'SIGVTALRM',
  'SIGWINCH',
  'SIGXCPU',
  'SIGXFSZ'
]
