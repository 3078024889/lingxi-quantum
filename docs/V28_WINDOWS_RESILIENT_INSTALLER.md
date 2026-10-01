# LINGXIFIELD V28 — Windows File-Mapping Resistant Installer

## Root cause addressed
Windows can return:
`The requested operation cannot be performed on a file with a user-mapped section open`
when a destination file is memory-mapped by a prior Node / Next / Playwright process.

The old installer used:
`Copy-Item $src $dst -Force`
which had no retry, no file diagnostic and no process cleanup.

## V28 installer behavior
1. Stops only Node processes whose command line explicitly contains the repository root.
2. Deletes generated `.next`, `test-results` and `playwright-report` residues.
3. Prints every destination as `COPY_FILE=...`.
4. Copies bytes to a temporary file and atomically replaces/moves into place.
5. Retries up to 12 times with backoff.
6. On retry 3, re-scans and stops only repo-scoped Node processes and forces GC.
7. If still locked, prints `LOCKED_FILE=<exact path>` before failing.

It does NOT kill unrelated Node processes.

## Old code cleanup
Superseded old runtime / audit / nested-platform residues continue to be physically removed or rejected.
Core/origin modules, food-calorie internals, payment execution, withdrawals and production data remain protected.
