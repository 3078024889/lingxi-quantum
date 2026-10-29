# LINGXIFIELD V2.8 — catalog import safety and discovery

## Built
- `/api/v1/catalog/discover?q=video` returns evidence-neutral matching suggestions.
- `/api/v1/catalog/readiness` returns actual available inventory and explicitly says it is not verified market coverage.
- `npm run preview:catalog -- path/to/candidates.json` validates before any import; rejects conflicts, stale updates, duplicate IDs, and flags reuse of one homepage domain (manual review needed for legitimate multi-product vendors).
- 13 new pure-logic tests; quality gate includes data validation, tests, TypeScript, production build.

## Not yet implemented
- Live discovery/crawling, company finance sourcing, real SEO/GEO measurements, complete nine-language localization and payments.
- This is a **development source bundle**; do not present demo data as verified rankings.

## Safe release
- Installer backs up and copies only explicitly listed changed files.
- Existing data/catalog.json and evidence files are NEVER overwritten by the installer.
- No automatic GitHub push or production deploy.
