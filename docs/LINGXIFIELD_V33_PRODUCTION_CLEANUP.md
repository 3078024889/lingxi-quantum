# LINGXIFIELD V33 Production Cleanup

Purpose: close the post-V32 production document gateway work without touching protected business areas.

## Changes
- Registers the real DOCX/XLSX/PPTX production smoke test.
- Retires obsolete V21–V29 audit-only scripts superseded by current canonical gates.
- Preserves the V27 residual checks by folding them into `retired-code-cleanup.mjs`.
- Removes six invalid legacy gitlinks under `imports/skills-devour-2026-09-18` from the Git index. Any local nested repositories are moved outside the repo into a timestamped backup before index removal.
- Adds a V33 closure audit.
- Does not change food/calorie logic, payment execution, withdrawals, production data, or core/origin modules.

## Canonical validation
Run `RUN_FULL_VALIDATION.ps1` after installation. The final online Office smoke requires internet access to lingxifield.com and lingxifield.cn.
