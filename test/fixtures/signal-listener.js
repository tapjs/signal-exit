const { onExit } = require('../../')

setTimeout(function () {})

var calledListener = 0
onExit(function (code, signal) {
  console.log(
    'exited calledListener=%j, code=%j, signal=%j',
    calledListener,
    code,
    signal
  )
})

process.on('SIGTERM', listener)
process.kill(process.pid, 'SIGTERM')

function listener() {
  calledListener++
  if (calledListener > 3) {
    process.removeListener('SIGTERM', listener)
  }

  setTimeout(function () {
    process.kill(process.pid, 'SIGTERM')
  })
}
