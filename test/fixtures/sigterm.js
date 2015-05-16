var onSignalExit = require('../../')

onSignalExit(function () {
  console.log('exited with sigterm')
})

process.kill(process.pid, 'SIGTERM')
