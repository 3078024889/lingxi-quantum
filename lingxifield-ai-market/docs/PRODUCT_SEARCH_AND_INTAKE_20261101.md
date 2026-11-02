# LINGXIFIELD 32-product consumer UI, search and batch onboarding — 2026-11-01

## UI contract
- Public UI answers: what it does, free quota, real price, resolution/model/API vs subscription, country availability, payment methods, commercial license, publisher link, direct use, relevant comparison.
- Do not show engineering phrases such as data ingestion status, evidence counts, review queues, callback/certification state, schema names, or testing status on customer-facing pages. Such information belongs in backend API and docs.
- Preserve 32 existing product identities, the accepted financial-market table layout, full horizontal scroll and mobile/RTL behavior. Never swap order numbers for popularity/SEO rank claims.
- Paid promotions must remain clearly labeled and separate from independent results. Do not activate payment while the merchant API is closed.
- The SEO/GEO tab retains visible destination: Search, AI citations, user task queries, time trends. Actual metrics are rendered only after independently reviewed observations; currently no SEO/GEO rankings are published.

## Search
- `lib/market-user-task-queries.mjs` adds a minimum of 3 editable, human-language questions for EACH of 32 existing products (96+ editorial keywords). These are common task formulations, NOT observed keyword demand or published search volumes.
- Search supports explicit product names, two-product comparisons and 12 functional intent groups; the existing category, payment, country and pagination constraints remain effective.
- Chinese product detail pages offer links under “大家还会搜索”; clicked questions open a real filtered `/zh/ai?q=...` result. Foreign-language homes keep 9-language navigation and query support; Chinese questions are not inserted into other-language product pages.
- User expectation: generic tasks suggest multiple possible tools; named products preserve brand specificity. Suitability is not a benchmark ranking.
- Retain source dates and original evidence URLs in backend.

## Review-only company intake
- Future candidate batches are exactly 10 products in `data/company-intake/batch-*.json`.
- Batch B001: Cursor, Canva Magic Studio, Gamma, Pika, Ideogram, Krea, Leonardo AI, Notion AI, Figma Make, Descript.
- The batch file contains publisher/source links and relevant task categories only, not confirmed founding, financing, coverage, pricing or licensing facts.
- `visibleToPublic:false`, `reviewed:false`, `publishApproved:false` for all candidates. Test gates reject duplicates of the 32 catalog and duplicate IDs within a batch.
- All ten must be individually expanded to the same official source-backed profile required for the existing catalog (price, free tier, model/version, region, payment, usage, commercial terms, company founding/source, if disclosed).
- Publishing is NOT implemented for candidates; do not import them into search/rankings until reviewed, tested, and separately approved.

## Current release
- Changes isolated to PR #65; protected Vercel review only. Do not update production domains or main until full build and browser acceptances pass.
- Netlify Free is a config candidate, not a real commercial deployment.
- Real payment accounts remain unapproved and public checkout disabled; independently verified SEO/GEO observations remain zero.
- Website UI copy is user-facing; underlying data and validation remain auditable in files and APIs.
