# LINGXIFIELD V2.6 — Data integrity and comparable ranking

## Scope
- Retains existing V2.5 frontend, nine locale routes, nominal CNY/USD commercial pricing, platform details and search.
- Includes V2.5.1 strict catalog JSON validation fix.
- New `/api/v1/coverage`: transparent counts for imported catalog entries, company profiles, verified metrics, user experience records. No synthetic observations.
- New `/api/v1/comparable-rankings?metric=monthly_visits&region=global`: select a comparable single-source, same-method, same-unit, same-window cohort. Returns excluded count and source metadata. Avoid comparing across unrelated measurement methodologies.
- New `/api/v1/timeline?platformId=...&metric=...`: verified-only historical data retrieval.
- 28 automated Node contract tests, including nine new analytics tests.

## Data accuracy
`data/catalog.json`, `data/evidence.json`, and `data/user-experiences.json` remain empty, pending licensed or authorized source ingestion. Four company records are starter records, not proof of fully verified capital history. A passing test does not establish real-world data availability. No payment processing is connected.

## Capacity
Static Next pages + lightweight API. Large-scale search/crawling, external database, backfill and payment integrations need separate services and benchmarks; 2GB RAM is a target, not a proven benchmark.

## Acceptance
Run `npm.cmd install`, `npm.cmd run test:contracts`, `npm.cmd run build`, then test `/api/v1/coverage` and `/api/v1/comparable-rankings` locally. Check UI language switch, CNY/USD selection, comparison, and mobile manually.

## Deployment policy
No GitHub push, no main merge, no Vercel or Alibaba Cloud deployment from this package. Keep current production unchanged.
