const { onExit } = require('../..')
onExit(function (code, signal) {
  console.error('onExit(%j,%j)', code, signal)
})
setTimeout(function () {
  console.log('hello')
})
process.kill(process.pid, 'SIGPIPE')
