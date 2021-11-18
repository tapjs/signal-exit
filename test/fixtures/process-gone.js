// have to do this in a hacky way, because removing process right at
// the start breaks babel, so it fails when coverage is being applied.
var onSignalExit = require('../../')
global.process = null
delete require.cache[require.resolve('../../')]
onSignalExit = require('../../')

onSignalExit(function (code, signal) {
  throw new Error('this should not ever be called')
})
