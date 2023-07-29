# Changelog

## 4.1

- Add the ability to capture signal exits by returning `true`
  from the `onExit` listener.

## 4.0

- Rewritten in TypeScript
- Default export replaced with named exports
- More securely hardened against multiple load and global process
  object mutation
- Removed `SIGUNUSED` from the list of Linux signals, as it no
  longer exists.
- `SIGABRT`, `SIGALRM` removed from list of Windows signals, as
  the are not supported.

## 3.0.3 (2020-03-26)

- patch SIGHUP to SIGINT when on Windows (cfd1046)
- ci: use Travis for Windows builds (007add7)

## 3.0.1 (2016-09-08)

- do not listen on SIGBUS, SIGFPE, SIGSEGV and SIGILL (#40) (5b105fb)

## 3.0.0 (2016-06-13)

- get our test suite running on Windows (#23) (6f3eda8)
- hooking SIGPROF was interfering with profilers see #21 (#24) (1248a4c)
- signal-exit no longer wires into SIGPROF
