const { onExit } = require('../../dist/cjs/index.js')

const codeOrSignal = process.argv[2] || 'null'
const [code, signal] = !isNaN(+codeOrSignal)
  ? [+codeOrSignal, null]
  : codeOrSignal.startsWith('SIG')
  ? [null, codeOrSignal]
  : [null, null]

const capture = process.argv[3] || 'none'
const captureExit = capture === 'captureExit' || capture === 'capture'
const captureAfterExit =
  capture === 'captureAfterExit' || capture === 'capture'

onExit((code, signal) => {
  console.log('exit handler', code, signal)
  if (signal && captureExit) {
    setTimeout(() => console.log('exit captured signal'))
    return true
  }
})

onExit(
  (code, signal) => {
    console.log('afterExit handler', code, signal)
    if (signal && captureAfterExit) {
      setTimeout(() => console.log('afterExit captured signal'))
      return true
    }
  },
  { alwaysLast: true }
)

if (typeof code === 'number') {
  process.exit(code)
} else if (typeof signal === 'string') {
  process.kill(process.pid, signal)
  setTimeout(() => {}, 200)
}
