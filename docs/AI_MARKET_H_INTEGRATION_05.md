# H integration 05 — source-backed market page and historical chart

Development branch only. This is an integration milestone, not a production acceptance.

## Real integration
- GET /api/ai-market/metrics with explicit compatible measurement scope.
- GET /api/ai-market/metrics/history with entity ID and bounded date interval; only reviewed evidence from that same entity is returned.
- Visible /ai-market ranking table and clickable 30-day SVG history chart, mounted under the existing task search.
- Never invent ranking rows, sample counts, percent changes or historical values.
- Invalid inputs get 400, unavailable staging database gets 503.
- Query caps at 500 observations; the interface explicitly discloses possibly incomplete rankings/history.

## Methodology retained from public research
Artificial Analysis separates model, endpoint, provider, price, latency and speed by explicit methodology: https://artificialanalysis.ai/methodology
Hugging Face offers official API access subject to service-specific rate limits: https://huggingface.co/docs/hub/api
We reference methodology only. We do NOT scrape or reproduce proprietary benchmark scores without authorization.

## Outstanding blockers
- Existing migrations have not been applied to staging and real observation rows have not been verified in the database.
- No production payment, claiming, vendor dashboard or full nine-language UI integration.
- No CI, TypeScript build, browser or mobile performance success is asserted without logs.
- UI form currently exposes methodological scope explicitly; once verified catalog scopes exist, replace manual entry with a short human-friendly selector.
- Paginate all verified records; current 500-row partial rankings are not global rankings.
- Authentication, caching, 2 GB RAM and database indexes require staging load tests.
