var onSignalExit = require('../../')

onSignalExit(function (code, signal) {
  console.log('exited with sigterm, ' + code + ', ' + signal)
})

process.kill(process.pid, 'SIGTERM')
