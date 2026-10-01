# LINGXIFIELD V27 — Audit Syntax Gate + Old Code Cleanup

V26 did not reach `next build` because the new cumulative audit itself had a JavaScript syntax error.

V27 adds a pre-audit syntax gate:
- every `scripts/audit/*.mjs` is checked with `node --check`
- if any audit script has invalid JavaScript, installation stops before the audit phase
- the corrected V26 cumulative audit is included

V27 also expands physical deletion / rejection of superseded residues:
- old versioned platform-stability audits and tests
- retired hand-mixed Transformers runtime
- retired `/public/onnxruntime`
- accidental nested `lib/tools/platform/platform`

These are only superseded residues. V27 does not delete:
- core/"本源" modules
- food-calorie internals
- payment/withdrawal execution
- support lifecycle
- production user data
