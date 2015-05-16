var assert = require('assert')

module.exports = function (cb) {
  assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler')

  var emittedExit = false

  Object.keys(signals).forEach(function (sig) {
    var listener = function () {
      process.removeListener(sig, listener)
      cb(process.exitCode || signals[sig], sig)

      process.kill(process.pid, sig)
    }

    try {
      process.on(sig, listener)
    } catch (er) {}
  })

  process.on('exit', function (code) {
    if (emittedExit) return
    emittedExit = true
    return cb(code, undefined)
  })
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

var nonFatalSignals = [
  'SIGWINCH', // resize window.
  'SIGUSR1', // debugger.
  'SIGCHLD',
  'SIGSTOP',
  'SIGCONT',
  'SIGIO',
  'SIGURG',
  'SIGABRT',
  'SIGURG' // out of band data.
]
