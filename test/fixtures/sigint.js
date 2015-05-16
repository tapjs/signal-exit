var onSignalExit = require('../../')

onSignalExit(function () {
  console.log('exited with sigint')
})

process.kill(process.pid, 'SIGINT')
