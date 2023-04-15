const { onExit } = require('../../')
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
