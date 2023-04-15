export type ExecErr = Error & {
  code: number | null
  signal: NodeJS.Signals | null
}
export const isExecErr = (er: any): er is ExecErr =>
  !!er &&
  er instanceof Error &&
  ((er as ExecErr).code === null ||
    typeof (er as ExecErr).code === 'number') &&
  ((er as ExecErr).signal === null ||
    typeof (er as ExecErr).signal === 'string')
