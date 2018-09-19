declare namespace signalExit {
  export interface SignalExitOptions {
    /**
     * Run this handler after any other signal or exit handlers.
     * This causes `process.emit` to be monkeypatched.
     *
     * Default: `false`
     */
    alwaysLast?: boolean;
  }

  /**
   * Removes the corresponding listener.
   */
  export type RemoveListener = () => void;

  /**
   * The exit listener is passed two arguments.
   *
   * It is guaranteed that exactly one of them is `null` and the other not.
   *
   * - `code`: Exit code of the process. Present for example when Node exits
   *   normally (end of program) or after `process.exit(code)`.
   * - `signal`: Signal causing the process to exit. Present for example
   *   when using `process.kill(process.pid, signal)`.
   */
  export type SignalExitListener = (code: number | null, signal: NodeJS.Signals | null) => any;

  export interface SignalExit {
    /**
     * Adds a listener fired when the current process exits, no matter how.
     *
     * Note that the function *only* fires for signals if the signal would
     * cause the proces to exit. That is, there are no other listeners, and
     * it is a fatal signal.
     *
     * @param listener See [[SignalExitListener]].
     * @param options See [[SignalExitOptions]].
     * @return Function to remove the listener.
     */
    (listener: SignalExitListener, options?: Readonly<SignalExitOptions>): RemoveListener;

    /**
     * Returns the platform-dependent list of exit signals.
     */
    signals(): NodeJS.Signals[];
  }
}

declare const signalExit: signalExit.SignalExit;

export = signalExit;
