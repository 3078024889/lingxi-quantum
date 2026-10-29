# H integration 04 — evidence-checked metric rankings

Status: SOURCE COMMITTED, NOT DATABASE- OR BROWSER-ACCEPTED.

New read-only endpoint GET /api/ai-market/metrics with explicit metric/day/region/period/methodology/sample query parameters. It reads staging observations and evidence through a server-only client; records without checked evidence owned by the same entity and exact source URL are excluded; metric definitions prevent mixing incompatible rankings. Unavailable DB -> 503, missing scope -> 400; no synthetic values.

The query is capped at 500 observations and marks a partial source scan if capped. There is no claim that this constitutes a global exhaustive ranking. The metric source, methodological scope and evidence should be shown to users. No payment or review writes.

Known gaps: trusted validation of collected evidence contents, SQL migrations, pagination, rank UI/chart, authorized data collection, independently audited metrics, CNY/USD offers, browser and performance testing.
