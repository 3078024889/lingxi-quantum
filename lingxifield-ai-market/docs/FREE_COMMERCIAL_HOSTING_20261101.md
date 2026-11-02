# Zero-USD LINGXIFIELD AI market hosting plan (2026-11-01)

## Candidate A: Netlify Free — preferred full Next.js hosting trial
- Official: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- Free quota: 300 credits/month, hard ceiling, no automatic paid top-up (https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/).
- Netlify staff confirmed commercial websites may run on Free as long as users do NOT resell Netlify hosting: https://answers.netlify.com/t/can-we-use-netlify-free-plan-for-commercial-purposes/41545 (historical policy, recheck before launch).
- The repo is a monorepo. Select project directory `lingxifield-ai-market`, base directory `lingxifield-ai-market` for the isolated site, build `npm run build`, output `.next`. Use the Next.js OpenNext adapter detected by Netlify.
- Always deploy a PREVIEW first. Run nine locales, real payments-disabled health, vendor submissions, SEO index gate, redirects, mobile viewport, browser network and D1.
- Do not link production domain until application runtime, business terms, personal data, source quality and resource quotas pass.
- Do not buy USD credit, enter billing details or enable paid upgrades. Free limits can temporarily suspend a site.

## Candidate B: Cloudflare Pages / Workers
- Free static Pages can host a static directory; our present dynamic Next.js handlers and request headers make `next export` inappropriate without a separate compatibility adapter.
- Free Workers: 100,000 requests per day and 10ms CPU/request; 128MiB RAM (https://developers.cloudflare.com/workers/platform/limits/).
- Cloudflare currently recommends `vinext` for compatible new Next apps and OpenNext for maintained compatible existing apps (https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/). This project uses Next.js 15; test compatibility on a separate branch before changing runtime.

## Existing Vercel preview
- Keep protected review site unchanged. Vercel Hobby is for non-commercial personal projects, so no paid publisher checkout should be moved there (https://vercel.com/docs/plans/hobby).
- Never expose Supabase service keys, PayPal client secret, Alipay or WeChat keys to public pages or source control.

## Before commercial launch (strict gate)
1. All nine locale homepage links and detailed pages pass mobile+RTL Chromium tests; fix root `<html lang>` for non-ZH pages.
2. Official product and company facts exist with dated per-field source URLs. Never substitute missing financing for zero.
3. GSC: verify ownership of production canonical property, authorize read-only service account and run existing `ai-market-gsc-observations.yml`. Current observed rows = 0; do NOT enable SEO/GEO ranking based on guesses.
4. Merchant accounts: server-verifiable signed callback, atomic idempotent orders, refunds and immutable journal tests must PASS. Remain checkout disabled otherwise.
5. Confirm business terms and free quota manually in chosen cloud account, then record preview URL, screenshots, build logs and rollback deployment ID.

This file plans an alternate hosting path. It is NOT proof a Netlify deployment exists.
