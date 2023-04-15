const { onExit } = require('../')
const spawn = require('child_process').spawn
const t = require('tap')
const node = process.execPath
const f = __filename

if (process.argv[2] === 'child') {
  for (var i = 0; i < 15; i++) {
    onExit(function () {
      console.log('ok')
    })
  }
} else {
  t.test('parent', function (t) {
    var child = spawn(node, [f, 'child'])
    var err = ''
    var out = ''
    var expectOut = new Array(16).join('ok\n')
    child.stderr.on('data', function (c) {
      err += c
    })
    child.stdout.on('data', function (c) {
      out += c
    })
    child.on('close', function (code, signal) {
      t.equal(code, 0)
      t.equal(signal, null)
      t.equal(err, '')
      t.equal(out, expectOut)
      t.end()
    })
  })
}
