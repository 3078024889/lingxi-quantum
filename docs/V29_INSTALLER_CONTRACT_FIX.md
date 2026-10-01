# LINGXIFIELD V29 — Installer Contract Audit Correction

V28's resilient copying worked. The failure was a false-negative in its self-audit.

Actual installer behavior:
- `.next`, `test-results`, and `playwright-report` are iterated through `$generated`
- each path is derived as `$p`
- each path is removed before installation

The V28 audit incorrectly required the literal string:
`Remove-Item $nextDir -Recurse -Force`
even though `$nextDir` never existed.

V29 changes audits to validate the real behavior contract rather than a guessed variable name.

It also upgrades deletion:
- adds `Remove-PathResilient`
- generated directories are deleted with retries
- retired `public/vendor/transformers` and `public/onnxruntime` are physically deleted with retries
- retired runtime is no longer copied into a new backup first
- nested retired platform directory is also deleted through the resilient delete path

Protected areas remain unchanged:
- core/origin modules
- food calorie internals
- payment execution
- withdrawals
- production data
