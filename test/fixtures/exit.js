var onSignalExit = require('../../')

onSignalExit(function () {
  console.log('exited with process.exit()')
})

process.exit(32)
