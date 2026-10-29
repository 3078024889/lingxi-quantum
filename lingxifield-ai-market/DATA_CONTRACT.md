# LINGXIFIELD V2.2 data contract

The main product list is a **catalog, not a verified ranking**. `data/evidence.json` starts empty deliberately. Do not ship invented website traffic, downloads, GEO citations or funding totals.

Evidence record keys: `id`, `platformId`, `metric`, `value` (numeric or null), `unit`, `periodStart`, `periodEnd`, `region`, `provider`, `sourceUrl` (HTTPS), `collectedAt` (ISO timestamp), `evidenceKind` (`official`, `third_party`, `independent_test`), `status` (`verified`, `pending`, `disputed`), `methodology`.

For each observed metric retain date range, region, provider, how measured, original citation, and verified status. Never combine app downloads with website visits or call visits active users.

Endpoints: `GET /api/v1/platforms` and `GET /api/v1/evidence?platform=chatgpt&metric=monthly_visits`.

Security/privacy: only public non-personal data in this JSON; no secrets, no user reviews without provenance and appropriate permissions. Review source terms before collecting or redistributing third-party data. Keep raw vendor billing and company pricing distinct. OpenAPI and paid vendor API credentials are **not** included.

This is a browser preview/architecture-ready package. Payment selector does not charge. Nine-language control does not mean the entire site is translated. robots remains noindex until production readiness and source verification.
