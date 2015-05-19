var onSignalExit = require('../../')

onSignalExit(function (code, signal) {
  console.log('exited with sigterm, ' + code + ', ' + signal)
}, {maxListeners: 2})

process.kill(process.pid, 'SIGTERM')
