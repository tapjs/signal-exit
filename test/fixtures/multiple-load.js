// simulate cases where the module could be loaded from multiple places
let onExit = require('../../').onExit
const newOnExit = () => (onExit = require('../../').onExit)
var counter = 0

onExit(
  function (code, signal) {
    counter++
    console.log(
      'last counter=%j, code=%j, signal=%j',
      counter,
      code,
      signal
    )
  },
  { alwaysLast: true }
)

onExit(function (code, signal) {
  counter++
  console.log(
    'first counter=%j, code=%j, signal=%j',
    counter,
    code,
    signal
  )
})

delete require('module')._cache[require.resolve('../../')]
newOnExit()

onExit(
  function (code, signal) {
    counter++
    console.log(
      'last counter=%j, code=%j, signal=%j',
      counter,
      code,
      signal
    )
  },
  { alwaysLast: true }
)

onExit(function (code, signal) {
  counter++
  console.log(
    'first counter=%j, code=%j, signal=%j',
    counter,
    code,
    signal
  )
})

// Lastly, some that should NOT be shown
delete require('module')._cache[require.resolve('../../')]
newOnExit()

let unwrap = onExit(
  function (code, signal) {
    counter++
    console.log(
      'last counter=%j, code=%j, signal=%j',
      counter,
      code,
      signal
    )
  },
  { alwaysLast: true }
)
unwrap()

unwrap = onExit(function (code, signal) {
  counter++
  console.log(
    'first counter=%j, code=%j, signal=%j',
    counter,
    code,
    signal
  )
})

unwrap()

process.kill(process.pid, 'SIGTERM')
setTimeout(function () {}, 1000)
