# Global AI Market — integrated delivery gates

Status: work in progress. No claim of complete production readiness.

## Gate A — source data
- Capture model source URL, observedAt, count and raw unit for every price.
- Fail on empty responses, malformed IDs, negative prices, duplicate IDs and stale timestamps.
- Keep upstream snapshots in internal review artifacts; do not publish or redistribute before licensing review.
- Record missing traffic, downloads, MAU, ratings and pricing as unknown; never fabricate them.

## Gate B — historical comparisons
- Compare only the same model ID, provider and price dimension, ordered by observation time.
- A zero baseline has no meaningful percentage change; report absolute values.
- Verify reproducible calculations with real runtime tests.
- Persist time series durably before offering public historical charts.

## Gate C — product experience
- Global search, category and country filters, comparable ranking dimensions and sorting.
- Vendor and model details: version, context, costs, capabilities, supported regions, source and verification time.
- Comparison, changes, accessibility and beginner explanations.
- Reviews require authentication, moderation, abuse reporting and anti-spam controls.
- Vendor onboarding requires ownership verification, approval, audit history and separation from paid rankings.

## Gate D — internationalization and discovery
- Nine supported languages, accessible responsive UI, canonical/hreflang, sitemap and structured data.
- Real task-level cost and download/share workflows verified on desktop and mobile.

## Gate E — release
- CI production gate green, browser smoke tests, migration safety and rollback documented.
- Preserve /tools, SASI, payments, existing user data and unrelated Codex work.
- Preview verification and explicit merge authorization; do not merge on partial success.
