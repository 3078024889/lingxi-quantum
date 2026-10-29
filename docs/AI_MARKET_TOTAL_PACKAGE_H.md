# LINGXIFIELD total package H — integration and production gate

Current status: **BLOCKED / SOURCE AUDIT ONLY**. The release gate is deliberately fail-closed.

The earlier A-G packages contain source foundations, tests, and staging schemas, but this is not a fully integrated product. The following remain mandatory: actual official-source feeds; staging schema consistency and migration tests; verified tool catalog and real pricing; working public search/ranking/profile API and UI; measurable GEO observations; authenticated claim/payment sandbox; nine-language browser QA; 2GB resource test; rollback; browser end-to-end regression.

No automatic production deployment, no changes to main, no existing SASI / PDF / image / video tool deletions.

Gate commands:
`node --test scripts/ai-market/production-gate-h.test.mjs`
`node scripts/ai-market/production-gate-h.mjs scripts/ai-market/production-gate-h.example.json`
The second command is expected to exit nonzero, proving production release remains blocked.

Important: A standalone V2 market demo and the newer A-G modules are not yet merged into a complete site experience. Merely declaring tests pass cannot unlock release. Payment sandbox and database migration evidence are prerequisites, not documentation checkboxes.

All evidence must be acquired from real tools or staging actions and reviewed by humans with authority to publish. No locally invented pass manifests.
