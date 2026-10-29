# Deployment gates — dual-domain / 2GB Alibaba Cloud

- `lingxifield.com` and `lingxifield.cn` should point to a single data source, NOT copy diverging databases.
- Configure HTTPS for both domains; choose canonical rules per localized URL. hreflang requires crawlable translation routes, not just a client-side language switch. Current V2 prototype does NOT meet that gate.
- Host Next.js application with production build, reverse proxy and Node process supervisor. A 2GB VM is suitable only for lightweight cached pages and API endpoints; keep crawling, analytics, AI inference and history processing on external scheduled workers/services.
- Prevent OOM by limiting background jobs and observing process memory. Test real memory usage before choosing process flags.
- CNY / USD equal numeric tier price is a commercial pricing policy, not an exchange rate. Select currency on checkout before payment; verify that the authorized processor/merchant supports it. Demo does not collect payments.
- Ensure CN-domain filing / compliance where applicable and review legal requirements before Mainland hosting or promotion.
- Production gates: validated metrics with date/scope/source, full nine-language translations, localized SEO routes, payments and reconciliation, crawler protections, consent and privacy, auth and vendor claims audit, rate limiting, mobile UX, build and accessibility tests.
