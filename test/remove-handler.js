const { execFile } = require('node:child_process')
const { resolve } = require('node:path')
const { promisify } = require('node:util')
const t = require('tap')

const pExecFile = promisify(execFile)

const fixture = resolve(__dirname, 'fixtures/remove-handler.js')

t.test('Cleanup function can be called inside the exit handler', async t => {
  const {stderr, stdout} = await pExecFile(process.execPath, [fixture])
  t.equal(stderr, '')
  t.equal(stdout, 'one\ntwo\n')
})
