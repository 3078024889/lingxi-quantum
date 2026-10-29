# LINGXIFIELD Total Package B — Market Indicators, Rankings and History

**Status**: CORE SOURCE COMMITTED, NOT STAGING-ACCEPTED. No database migration, Vercel release, or public ranking publication.

## Delivered
1. Strict observations: value, entity identity, metric and unit, region, day, period, methodology, sample, provider, source URL and verification class.
2. Scope-exact ranked comparison. Conflicting values for the same entity and scope are excluded instead of guessed.
3. Historical points with identical comparison scope, 7/30/90-day deltas only when both observations exist; zero baseline does not create a bogus percentage.
4. Pareto frontier helper for measurable price/quality trade-offs.
5. Staging PostgreSQL tables for evidence-referenced measurements and non-public ranking snapshots; RLS and restricted access.
6. Regression suites and GitHub Actions wiring.

## How to run
```powershell
Set-Location "D:\30780\lingxi-ai-market-preview-v4"
node --test lib/ai-market/market-engine.test.mjs lib/ai-market/market-snapshots.test.mjs
corepack.cmd pnpm exec tsc --noEmit
corepack.cmd pnpm build
```
First synchronize the preview worktree to the reviewed branch without overwriting local changes. Use a disposable Supabase staging project for migrations.

## Data truth
Hugging Face repo downloads/likes are **repository metrics**, not company visits or product active users. Traffic measurements must use licensed, identified measurement providers; benchmark throughput and latency must declare test harness and environment. SEO search visibility and GEO citation share no interchangeable scoring unit. Paid advertisements must be visually labeled and excluded from organic rankings.
Data points cannot appear publicly unless the complete upstream evidence and rights are confirmed by a reviewer.

## Acceptance gap before B is complete
- Use staging database and connect market-engine to live evidence-backed queries.
- Validate SQL constraints, atomic ingestion, data provenance, audit trails, conflicting records, deterministic ranking updates and permissions.
- Implement API endpoints for paginated rank and history, with caching, pagination, currency units and sensible 2GB deployment architecture.
- Build dynamic mobile-friendly chart/details UI for verified data, and display “not available” instead of synthetic numbers.
- Test 7/30/90-day reporting against actual collected historical observations.
- Run complete CI, browser, mobile, load and rollback tests.

## Informed design
- Hugging Face Hub official API: https://huggingface.co/docs/hub/api
- Artificial Analysis measurement model: https://artificialanalysis.ai/about
- Metrics must not be copied from external commercial sites without an appropriate license.
