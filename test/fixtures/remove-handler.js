const { onExit } = require('../../')

const cleanup = onExit(function () {
  console.log('one')
  cleanup()
})

onExit(function () {
  console.log('two')
})
