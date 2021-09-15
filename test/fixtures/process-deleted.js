var onSignalExit = require('../../')
global.process = null

onSignalExit(function (code, signal) {
  throw new Error('this should not ever be called')
})
