# LINGXIFIELD · Five-round external and repository audit
Date: 2026-11-01 (Asia/Singapore)
Scope: Vercel preview `lingxifield-ai-market-review-8uzur86pa-celestial9.vercel.app`, deployment `dpl_53CLGRnHhgVvkwd9GQdSbUyM1ENv`, baseline `6a72487c29ad91d327c7152f8eda5e8cc1a61d14`.

This is an evidence-driven review, NOT a claim that a full production E2E audit, visual pixel review or payment integration has passed. Preview has SSO. Do not promote it to production on these results alone.

## Round 1 — First-time buyer workflow / UI
- Home, `/apps`, and `/models` return HTTP 200 through authenticated Vercel fetch.
- Search and product listings return structured items. `/api/v1/search?q=视频&limit=3` returned 12 matching items in this review.
- Product opening from localized marketplace called `router.push('/platform/'+id)` and did not retain chosen locale. FIXED in this branch: `/[lang]/platform/[id]`.
- Short language entry URLs `/en`, `/ja`, `/ar` returned 404 although `/[lang]/ai` worked. FIXED in this branch: short locale paths permanently redirect to matching `/[lang]/ai` with an explicit supported-locales allowlist.
- Visually inspect actual desktop (1440px) and narrow mobile (375px) browser before concluding the layout is good. Avoid speculative redesign without screenshots.
- Start from user task -> suitable tools -> free allowance -> real task cost -> restrictions -> direct official links. Keep advanced benchmark panels in dedicated tabs and vendor plans away from primary results.

## Round 2 — Vendor workflow & monetization
- `/vendor/claim` resolves and contains a form. Successful persistence requires a configured Supabase `ai_market_submit_vendor_submission` RPC. NOT YET LIVE-VERIFIED.
- `/api/v1/commercial-plans` returns free listing plus 49 USD sponsored, 149 USD category, 299 USD one-off brand; choose CNY or USD with equal nominal numbers. The endpoint reports `paymentEnabled:false` and `checkoutUrl:null`. This is a price proposal, not an operational checkout.
- Separate sponsored positions from organic scores and rankings. Free 3-product vendor claim policy needs identity proof and working persistence.

## Round 3 — Data quality and competitive evidence
- `/api/v1/health` returned `evidenceRecords:0`, `verifiedRecords:0`, `noLiveData:true` and `seoGeo.verifiedObservations:0` for 32 products.
- Repository datasets `data/evidence.json=[]`, `data/seo-geo-observations.json=[]`, `data/verified-market-metrics.json={}`.
- `/api/v1/seo-geo` confirmed zero independent SEO or GEO observations. Do not show fabricated search ranking, AI mentions, market visits or trend lines.
- `/api/v1/platforms/chatgpt` and search results still contain text `待核验` for such fields as funding, SEO and GEO. For visitor-facing products, show evidence-backed facts, and omit unavailable non-essential fields rather than decorate the page with empty values.
- `/api/v1/coverage` reports 22 catalog entries whereas health reports 32 products. These can be different populations, but public labels must clearly distinguish imported catalog from curated profiles.

## Round 4 — SEO, languages, structured data
- `/robots.txt` intentionally disallows all preview crawling, `/sitemap.xml` is empty, `noindex,nofollow` present. This is correct for preview; it is NOT proof of public indexing.
- `/en/platform/chatgpt`, `/ja/ai`, `/ar/ai` return HTTP 200, but root `<html lang="zh-CN">` is hard-coded in `app/layout.tsx` even on English and Arabic pages. UNRESOLVED: must adjust layout architecture without sacrificing static generation; do not claim locale-SEO completion.
- Enable official production domain, canonical, `hreflang`, XML sitemap only after Google Search Console verification, source quality and live crawl checks. Add validated SoftwareApplication / FAQ structured data only for grounded fields.

## Round 5 — Security, payment, reliability, deployment
- `lib/market-billing-readiness.mjs` intentionally sets `checkoutImplemented=false`; do not enable with env switches alone.
- Payment adapters are not authenticated order ledger, webhook replay protection, refund reconciliation or end-to-end merchant acceptance. PayPal account approval is pending; no payment handling was exercised in this audit.
- `/api/v1/health` returns 200, but this does not verify mobile screenshots, keyboard navigation, 2GB RAM, production rollback, database backups, tenant auth or actual buyer payment.
- Separate static/ISR web delivery from crawlers, database and media processing. Production commercial Vercel requires an eligible commercial plan, or use suitable hosting after resource testing.
- Preserve existing `.com` and `.cn` production and local `D:\30780\lingxi-quantum\lingxifield-ai-market`; this PR only modifies a review branch.

## Verification gates after this PR
1. GitHub CI: contracts, TypeScript, data validators, production Next build.
2. Vercel branch PREVIEW READY, 9 `/[lang]` paths redirect correctly.
3. From all 9 `/[lang]/ai` routes, click product detail; URL must remain `/[lang]/platform/[id]`.
4. Browser RTL, 375/768/1440 widths, mobile drawer, sticky table cells, accessibility, real official links, accurate page names.
5. Production indexing, merchant credentials, GSC/GEO evidence and true commerce remain BLOCKED until separately verified.
