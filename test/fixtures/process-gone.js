// have to do this in a hacky way, because removing process right at
// the start breaks babel, so it fails when coverage is being applied.
require('../../')
global.process = null
delete require.cache[require.resolve('../../')]
const { onExit } = require('../../')

var unwrap = onExit(function (code, signal) {
  throw new Error('this should not ever be called')
})

if (typeof unwrap !== 'function') {
  throw new Error('missing unwrap function')
}
