# LINGXIFIELD V2.4 · Codex handoff

## Source of truth
V2.4 is a standalone development package, built on the V2.3 UI. It is **not** an update of the production site. Copy into `D:\30780\lingxi-quantum\lingxifield-ai-market` only after backing up that directory. Do not delete `D:\30780\lingxi-quantum` (the existing multi-tool site).

## What is implemented
- Evidence ingestion from locally supplied JSON arrays, atomic write and immutable identifier conflicts. The same record is idempotent.
- Verified-only metrics API (`/api/v1/market`), snapshot ranking (`/api/v1/market/rankings`), historical series (`/api/v1/market/history`) and health endpoint.
- 9-language codes, existing CNY/USD nominal-price UI, original homepage/detail UI retained.
- No invented metrics. Initial evidence remains empty until licensed or publicly sourced records are explicitly imported.

## Validation
`npm.cmd install && npm.cmd run validate:data && npm.cmd run test:contracts && npm.cmd run test:engine && npm.cmd run build`

## Important deployment blockers
1. No verified live data feed or scheduled crawler has been configured; zero-evidence rankings are expected.
2. Payment UI is informational; no payment gateway or webhook is connected.
3. Nine-language selection is not equivalent to nine-language fully translated SEO routes.
4. `robots.ts` deliberately prevents indexing in this isolated demo; do not deploy with this rule to production without reviewing the real domain routing and robots policy.
5. Production load/2GB Alibaba instance has not been benchmarked. Database and scraping must be separated and properly licensed/rate-limited.
6. Audit dependencies; no forced upgrade. Never merge or deploy automatically.

## Ingestion example
`npm.cmd run import:evidence -- .\data\incoming-verified.json --dry-run`
Create an array conforming to `lib/evidence.ts`; keep original `sourceUrl`, provider, methodology, region and dates. Real import without `--dry-run` preserves old observations.

## Smoke routes
`/api/v1/health`
`/api/v1/market?metric=monthly_visits&region=global&limit=25`
`/api/v1/market/rankings?metric=monthly_visits&region=global`
`/api/v1/market/history?platformId=chatgpt&metric=monthly_visits`
