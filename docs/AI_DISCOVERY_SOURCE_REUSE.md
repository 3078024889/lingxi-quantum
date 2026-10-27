# AI discovery source reuse review — 2026-10-27

This is an **offline metadata gate**, not a crawler, a code importer, a legal opinion, or production authorization.

## Research patterns

- https://github.com/DivJangid/AI-tools — source dates, machine-readable catalog, explicit license warnings; dataset licensing must be reviewed before copying.
- https://github.com/chadcorp/awesome-oss-ai — category taxonomy and dated repository observations; stars are attention, not performance.
- https://github.com/marixxtela/visual-regression-accessibility-testing — multi-viewport visual regression, keyboard and accessibility gates; review each dependency license before integration.

## Import contract

Run `node --test tests/ai-license-review.test.mjs`. `reviewReuseCandidate` accepts only an exact canonical GitHub repository URL and records the license evidence source and check date. A small SPDX allowlist is a **triage shortcut only**; every candidate still requires a human to inspect the full repository license, dependencies, assets, attribution, trademarks, model weights, and current upstream state. Unverified, archived, custom, copyleft, and unknown-license candidates cannot pass automatic triage. No external code is copied by this change.

Do not use scraped popularity as a quality score or paid sponsorship as an editorial rank. Do not import another directory's dataset without its data license and attribution review.

The preliminary SPDX screen returns `passesPreliminaryScreen`, while `canAutoImport` is always false until a separate, authenticated human approval system exists. No metadata alone grants import rights.
