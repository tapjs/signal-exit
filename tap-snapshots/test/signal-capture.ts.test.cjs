/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/signal-capture.ts TAP exit 0 > must match snapshot 1`] = `
exit handler 0 null
afterExit handler 0 null

`

exports[`test/signal-capture.ts TAP exit 1 > must match snapshot 1`] = `
exit handler 1 null
afterExit handler 1 null

`

exports[`test/signal-capture.ts TAP graceful exit > must match snapshot 1`] = `
exit handler 0 null
afterExit handler 0 null

`

exports[`test/signal-capture.ts TAP signal, capture afterExit > must match snapshot 1`] = `
exit handler null SIGHUP
afterExit handler null SIGHUP
afterExit captured signal

`

exports[`test/signal-capture.ts TAP signal, capture both > must match snapshot 1`] = `
exit handler null SIGHUP
afterExit handler null SIGHUP
exit captured signal
afterExit captured signal

`

exports[`test/signal-capture.ts TAP signal, capture exit > must match snapshot 1`] = `
exit handler null SIGHUP
afterExit handler null SIGHUP
exit captured signal

`

exports[`test/signal-capture.ts TAP signal, no capture > must match snapshot 1`] = `
exit handler null SIGHUP
afterExit handler null SIGHUP

`
