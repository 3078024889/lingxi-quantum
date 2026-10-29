# H integration pass 01 — verified task search

A genuine Next.js read API now joins staging identity, reviewed capability and evidence records before recommending a tool. No test-only records are deployed. Only reviewed product entities with official HTTPS links and checked evidence are eligible.

GET /api/ai-market/verified-search?q=视频字幕

Trust requirements:
- entity is product, verified with actor and timestamp;
- capability has reviewer, timestamp and reference;
- evidence is marked checked and HTTPS sourced;
- when Supabase missing or migration not applied, respond 503 instead of invented example results;
- source results have hard row limits: max 200 products/1000 capabilities and explicitly mark partialCatalog.
- unverified pricing, free quotas and regional availability remain null.
- Data service role is used server-only and is never included in API responses.
- Limit and cache policy need scale and privacy review before production use.

Known blockers: current source fetch is limited and not ranked by SQL relevance; API should be paginated and backed by verified SQL views and indexes, rather than loading all verified capability rows. Database has not been migrated. Frontend UI not yet connected; ranking and payments still isolated. CI and browser execution not yet confirmed.

Run: node --test lib/ai-market/integration-read.test.mjs
