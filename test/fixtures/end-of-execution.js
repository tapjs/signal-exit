const { onExit } = require('../../')

onExit((code, signal) => {
  console.log('reached end of execution, ' + code + ', ' + signal)
})
