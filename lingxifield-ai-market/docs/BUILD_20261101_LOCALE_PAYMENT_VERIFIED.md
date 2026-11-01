# LINGXIFIELD · 2026-11-01 latest preview engineering handoff

## Build identity
- Repo: 3078024889/lingxi-quantum, PR #65 (draft), branch `fix/ai-market-locale-navigation-20261101`.
- Latest code preview: `lingxifield-ai-market-review-muljon5xh-celestial9.vercel.app`, READY at commit `671fa0716335f41b92f4389aa9f443827269839d`.
- Subsequent commit `2a55208ea7aa421bb7895c51f39cab1e6d90949c` only checks in the already-applied private database SQL source; no runtime code changed.
- 53 prebuild tests passed, Next.js compiled, 324 static pages generated.
- PREVIEW only. No production domain assignment. Visual Chromium/E2E not complete. ESLint package not installed; missing linter is not a passing lint audit.

## Nine-language HTML (live Vercel fetch)
All short locale home paths `/zh`, `/en`, `/ja`, `/ko`, `/fr`, `/de`, `/es`, `/pt`, `/ar` returned HTTP 200. Root `html lang` matched each locale, using `zh-CN` for Chinese. `/ar` root rendered `dir=rtl`.
`/en/platform/chatgpt` and `/ar/platform/claude` returned 200, matching locale HTML root values.
Implementation uses two root layouts and a small route group for default pages. It avoids converting 324 static pages into request-time dynamic pages.

## Translated publisher facts
- 32 products remain source-linked with corporate/entity type separation.
- Added nine-language localized headings and semantic translations for officially evidenced company HQ, historic funding, group listing and project origins.
- Live HTML source: English ChatGPT, French Replit and Arabic Claude company details returned zero Chinese characters in extracted visible text. Japanese naturally includes Han characters and cannot be checked by Chinese-character count.
- Publisher source URLs remain unchanged for each translated fact.

## SEO and GEO
- `/api/v1/seo-geo` remains HTTP 200 with `verifiedObservations:0`, `indexedCatalog:false`.
- Previews correctly return `noindex,nofollow`.
- Own-site Search Console collector and independent AI-citation import already exist, but need authenticated ownership, actual observations and source capture/review. No synthetic rank, click, visit, funding or download numbers are approved.
- This preview is NOT proof of public indexing.

## Payment system
- Public checkout remains DISABLED; three merchant providers continue `checkoutAvailable:false`.
- Added immutable quoted prices (49 / 149 / 299, CNY/USD separate no conversion) and pure verification/duplicate/refund invariants with tests; all private operations require cryptographically verified upstream provider proof.
- Added private Supabase `ai_market_private.record_verified_payment` atomic RPC for provider-verified events; service-role only, security INVOKER, no public access or privileges to `anon`/`authenticated`.
- Database transaction smoke test, rolled back: first capture 'captured', duplicate event 'duplicate', wrong amount rejected, one event stored in transaction; final orders/events/refunds all **0**. No money was moved or provider called.
- Existing `public.orders` unchanged.
- Still required before activation: merchant approval, provider callback certificate/signature integration, vendor identity, refund processing, reconciliation, authorization review and real sandbox provider E2E. A SQL RPC alone does not make payments live.

## Hosting
- Netlify Free configuration committed in `netlify.toml` with commercially permitted free limits as candidate. No Netlify account connection or deployment was made.
- No paid service, no USD subscription and no changes to existing Aliyun 2GB environment.

## Release blockers
- Set up verified dedicated market host and confirmed Search Console ownership; check robots, real sitemap, canonical, hreflang and all nine translated pages on public production.
- Production merchant account and real signed webhook validation must pass in each currency.
- Add ESLint with a locked dependency version; run `npm run gate`, browser E2E at 375/768/1440 and RTL with screenshots.
- Performance/load and restore drills for free cloud deployment.
- Merge PR only after peer review, baseline comparisons and restore strategy.
