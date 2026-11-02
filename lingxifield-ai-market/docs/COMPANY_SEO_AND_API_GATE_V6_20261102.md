# LINGXIFIELD Global SIAI company registry and SEO release policy

Public publisher directory: `/{lang}/companies` in nine languages. Indexable only after the existing verified-domain `AI_MARKET_INDEX_READY`, `AI_MARKET_DOMAIN_VERIFIED`, canonical origin, and per-language allowlist pass. Preview deployments never publish canonical/indexed directory pages.

Company cards, product links and source-backed model/API offers are normalized and deduplicated from the **published 32 only**. The exact counts may be inspected via `/api/v1/companies` and `/api/v1/data-readiness`, with `incorporatedCompanies`, `openProjects`, `softwareLibraries` separated. **No implied global company-count claim**.

The release smoke now checks nine homepages, 288 product detail pages, nine company directory pages, and three read-only registry endpoints = **309 HTTP checks**. The registry API verifies OpenAI consolidates ChatGPT and Python SDK, and every rate row has an HTTPS source. This is a production build SSR test, not live vendor login or browser pay test.
