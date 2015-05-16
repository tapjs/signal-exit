# signal-exit

When you want to fire an event no matter how a process exits:

* reaching the end of execution.
* explicitly having `process.exit(code)` called.
* having `process.kill(pid, sig)` called.

Use `signal-exit`.

```js
var onExit = require('signal-exit')

onExit(function (code, signal) {
  console.log('process exited!')
})
```
