import t from 'tap'
const process = global.process
//@ts-ignore
globalThis.process = {}
t.teardown(() => {
  globalThis.process = process
})
import { onExit, load, unload } from '../dist/cjs/index.js'
onExit(() => {
  throw new Error('this should never happen')
})
load()
unload()
t.pass('this is fine')
