var onSignalExit = require('../../')

onSignalExit(function (code, signal) {
  console.log('exited with sigint, ' + code + ', ' + signal)
}, {maxListeners: 2})

process.kill(process.pid, 'SIGINT')
