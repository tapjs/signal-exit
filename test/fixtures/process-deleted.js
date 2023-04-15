const { onExit } = require('../../')
global.process = null

var unwrap = onExit((code, signal) => {
  console.log('onExit(%j,%j)', code, signal)
})

if (typeof unwrap !== 'function') {
  throw new Error('missing unwrap function')
}
