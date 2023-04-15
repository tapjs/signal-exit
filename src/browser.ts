/**
 * This is a browser shim that provides the same functional interface
 * as the main node export, but it does nothing.
 * @module
 */
import type { Handler } from './index.js'
export const onExit: (
  cb: Handler,
  opts: { alwaysLast?: boolean }
) => () => void = () => () => {}
export const load = () => {}
export const unload = () => {}
