var onSignalExit = require('../../')

onSignalExit(function (code, signal) {
  console.log('exited with sigint, ' + code + ', ' + signal)
})

process.kill(process.pid, 'SIGINT')
