# LINGXIFIELD AI Market — deployment and performance architecture

Date: 2026-11-01 (Asia/Singapore)
Scope: isolated Next.js 15.5 application at `lingxifield-ai-market/`.
This is a deployment design and tested configuration record, not a claim that the custom domain or production indexing has been activated.

## Decision

Do not move the public Next.js application onto the existing 2 GB Alibaba Cloud VM.
Use the connected Vercel project as the primary Next.js runtime while the application remains isolated from the legacy root website. Use the managed global CDN for generated pages and static assets. Keep database-backed Node.js functions close to the existing Supabase database in Tokyo.

The application currently generates 325 static pages in CI. Static HTML and assets are delivered through Vercel's CDN; the Node.js functions use `hnd1` (Tokyo), colocated with the Supabase project region `ap-northeast-1`. The source-controlled `vercel.json` makes this choice reproducible.

## Target topology

```text
Global visitors / search crawlers
             |
      DNS + TLS + WAF
       (Cloudflare optional)
             |
      Vercel global CDN
       /             \
 SSG / ISR pages    Node.js functions (hnd1 / Tokyo)
       |                     |
 static assets          Supabase (Tokyo)
                             |
                  private AI-market order ledger
                  (checkout stays disabled)
```

- Keep `lingxifield.com` and `lingxifield.cn` legacy production bindings unchanged.
- Reserve a dedicated market hostname such as `ai.lingxifield.com` and its Chinese-domain counterpart only after DNS, TLS, custom-domain ownership and end-to-end checks are verified.
- The SEO release gate remains closed until the dedicated market hostname is configured and explicitly approved.
- The 2 GB Alibaba VM may later be used for low-memory scheduled ingestion or backup jobs only after measured memory, retry, credential and recovery tests. It is not the Next.js build machine or the primary web origin.

## Why this is faster and safer

### 1. Static-first delivery

The nine localized home pages and reviewed product detail pages are generated at build time and revalidated. This avoids a server/database round trip on the common discovery path. The CI build generated 325/325 static pages on the current tested commit. Vercel documents that static content is served from its CDN and that ISR can update pages without rebuilding the entire application.

### 2. Put compute beside data

The Supabase project is in AWS Tokyo (`ap-northeast-1`). The previous Vercel deployment used `iad1` (Washington, D.C.), adding an avoidable cross-ocean hop for dynamic database calls. The project now declares `hnd1` (Tokyo) for Node.js functions. Static content remains globally distributed; only dynamic function execution is pinned near the database.

### 3. Use Cloudflare selectively, not as a second application runtime

If Cloudflare is enabled for DNS/WAF, use it for TLS/DDoS protection, bot controls and static asset caching. Cache only immutable hashed assets and explicitly public responses. Bypass cache for:
- `/api/*`, `/vendor/*`, authentication, user-specific pages and all payment routes/webhooks;
- responses with session cookies or private/no-store headers;
- any endpoint whose output depends on country, user identity, currency, authorization or fresh payment state.

Vercel already provides a global CDN. A second CDN is not automatically faster: avoid double-caching HTML until cache keys, cookies, query strings, invalidation and origin headers are tested.

### 4. Keep payment cryptography on Node.js

The payment adapters use Node.js crypto APIs. Do not migrate payment routes to Edge runtime or a Worker without a dedicated compatibility and cryptographic test suite. Merchant credentials stay server-side. Checkout remains closed until provider approval, signed webhook verification, atomic idempotent settlement, refunds, identity verification and fulfilment all pass.

## Hosting options compared

| Platform | Strength worth adopting | Constraint for this project | Decision |
|---|---|---|---|
| Vercel | Native Next.js App Router, ISR, global CDN, Git previews and per-function regions | Commercial production requires a plan appropriate to commercial use; preview SSO and production branch must be configured correctly | Primary runtime already connected |
| Netlify | Maintained OpenNext adapter; provisions SSR, ISR, route handlers, middleware, image CDN and cache integration | Requires a separate account/site and branch/base-directory configuration; credit limits and site visibility must be checked | Valid fallback; no production migration until isolated preview is accepted |
| Cloudflare Workers + OpenNext | Global edge runtime; documented App Router, SSR, ISR, Route Handler, RSC and streaming support | Runtime compatibility, Node.js APIs, crypto, cache and database bindings need isolated testing | Candidate for a separate compatibility branch |
| Cloudflare vinext | Cloudflare's current recommended path for new Next.js-on-Workers apps | Beta; the existing project is Next.js 15.5, so compatibility must be proven before migration | Do not replace the current runtime yet |
| Alibaba Cloud 2 GB VM | Full control and predictable fixed origin | Memory headroom, patching, TLS, process supervision, backups, global delivery and scaling become our responsibility | Not the public application host |

## Performance and reliability gates

Targets to measure after a public custom-domain preview is available (these are acceptance targets, not measured results):

- Core Web Vitals: p75 LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1.
- Static home/detail routes: cache HIT on repeat visits from at least Asia, Europe and North America.
- Dynamic API: p95 latency recorded separately from CDN cache latency; verify function region and Supabase round-trip.
- Browser matrix: 375 px, 768 px, 1024 px and 1440 px; all nine languages; Arabic RTL; keyboard navigation.
- Failure behavior: payment APIs fail closed; vendor and feedback submissions are rate-limited; database outage does not convert unverified facts into invented values.
- Operations: deployment logs, runtime errors, uptime, database backup/restore drill, rollback ID and monthly platform cost.

## SEO / GEO release safety

- Preview robots remains `Disallow: /`; the canonical/indexing gate stays disabled.
- Production indexing requires the dedicated HTTPS hostname, verified ownership, approved locales, valid canonicals/hreflang, a non-empty reviewed sitemap and successful public crawler probe.
- Explicitly allow `OAI-SearchBot` for ChatGPT search visibility while keeping private API/vendor paths disallowed. This does not automatically decide the separate `GPTBot` training policy.
- `llms.txt` is a supplementary machine-readable directory description, not a ranking guarantee or a replacement for crawlable HTML, canonical URLs, sitemap, structured data or actual citations.
- Google Search Console measures our own site's search performance, not competitor rank. Independent SERP and GEO citation comparisons require repeatable query, locale, country, engine/model, timestamp, raw capture and review evidence.

## Deployment blockers that remain external

1. PR #65 is still a draft and targets the isolated AI-market feature branch, not the repository's legacy `main` branch.
2. The separate Vercel review project currently has `main` as its production branch; that branch does not contain the isolated app directory. Do not promote or change the legacy main site to work around this.
3. The latest successful Vercel preview is not the same as a production deployment. The current project is SSO-protected and has no dedicated market custom domain.
4. Search Console credentials/property permission and domain DNS/TLS ownership have not been supplied or verified.
5. Real merchant account approval and payment fulfilment are not active. Keep checkout disabled.

## Sources

- Cloudflare Next.js and OpenNext: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/ and https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
- Netlify Next.js runtime: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- Vercel function regions and CDN: https://vercel.com/docs/functions/configuring-functions/region
- Google localized URLs and hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google SoftwareApplication structured data: https://developers.google.com/search/docs/appearance/structured-data/software-app
- OpenAI crawler policy: https://developers.openai.com/api/docs/bots
- Cloudflare cache rules: https://developers.cloudflare.com/cache/how-to/cache-rules/

## Cost and commercial-plan guardrails (checked 2026-11-01)

- Vercel Hobby is limited to personal, non-commercial use. The current published Pro starting price is USD 20/month and includes USD 20 in usage credit; metered usage, tax and add-ons can change the invoice. The Vercel team plan for this project was not returned by the connected account API, so it must be checked in the dashboard before commercial production. Do not infer that an SSO-protected project is on a particular plan.
- Netlify Free is USD 0 with 300 monthly credits and a hard limit. A production deploy consumes 15 credits; compute consumes 10 credits per GB-hour; bandwidth consumes 20 credits per GB; web requests consume 2 credits per 10,000. A project pauses when the shared team allowance is exhausted. It is useful for a low-traffic public preview, not a production availability commitment.
- Netlify Personal is currently USD 9/month for 1,000 credits; Pro starts at USD 20/month for 3,000 credits. Plan limits, tax and pricing may change.
- No paid plan, automatic recharge, domain purchase, or billing method has been enabled as part of this work. Any upgrade requires the account owner's explicit choice.

Sources:
- Vercel pricing and commercial-use FAQ: https://vercel.com/pricing and https://vercel.com/docs/plans/hobby
- Netlify pricing and credit calculation: https://www.netlify.com/pricing/ and https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
