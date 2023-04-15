const t = require('tap')
const spawn = require('child_process').spawn
const node = process.execPath
function run(script, cb) {
  var proc = spawn(node, [require.resolve(script)])
  var stdout = []
  var stderr = []
  proc.stdout.on('data', function (c) {
    stdout.push(c)
  })
  proc.stderr.on('data', function (c) {
    stderr.push(c)
  })
  proc.on('close', function (code, signal) {
    var err = null
    if (code || signal) {
      err = new Error('command failed')
      err.exitCode = code
      err.signal = signal
    }
    cb(
      err,
      Buffer.concat(stdout).toString(),
      Buffer.concat(stderr).toString()
    )
  })
}

t.test('process missing from the start', function (t) {
  run('./fixtures/process-gone.js', function (err, stdout, stderr) {
    t.equal(err, null)
    t.equal(stdout, '')
    t.equal(stderr, '')
    t.end()
  })
})

t.test('process goes missing before onExit() call', function (t) {
  run('./fixtures/process-deleted.js', function (err, stdout, stderr) {
    t.equal(err, null)
    t.equal(stdout, 'onExit(0,null)\n')
    t.equal(stderr, '')
    t.end()
  })
})

t.test(
  'process goes missing after onExit() call, before exit',
  function (t) {
    run(
      './fixtures/process-deleted-after-load.js',
      function (err, stdout, stderr) {
        t.strictSame(
          [err, String(stdout), String(stderr)],
          [null, 'registered onExit handler called\n', '']
        )
        t.end()
      }
    )
  }
)
