const { onExit } = require('../../')

onExit(() => {
  console.log('registered onExit handler called')
})

global.process = null
