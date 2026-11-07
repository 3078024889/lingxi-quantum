# LINGXIFIELD main domains — staged cutover register (2026-11-07)

## Exact scope
- International main: `lingxifield.com`, `www.lingxifield.com`. Cloudflare is already authoritative DNS, but apex A still resolves to Vercel `216.198.79.1`, and www CNAME still points to Vercel.
- Domestic main: `lingxifield.cn`, current Alibaba ECS `39.104.205.16`. **Do not edit .cn DNS** during .com cutover.
- **Never merge or edit independent `globalsiai.com/.cn` sites in this release.**
- Preserve Vercel project `lingxi-quantum`, environment, historical deployments and domain registration as rollback candidates. A `READY` deployment currently behind HTTP 402 is **not a verified working fallback**.

## Source and CI
- Persisted integration branch: `release/lingxifield-main-dual-20261107`.
- Exact source, PostgreSQL17, full production build, desktop+mobile Playwright four-shard gate: `dual-main-exact-sha-release-gate.yml`.
- Source includes unified toolpass, password/login SSR repair, mini-program direct tools/share and nine-language repair notice.
- Separate self-hosted CN candidate: `build/lingxi-selfhost-cn-20261107`; `cn-selfhost-standalone-candidate.yml` uploads a self-host archive *only when actual loopback tests pass*. It does not deploy anything.
- Current production Supabase does not contain new `lingxi_tool_passes`/`lingxi_tool_use_events` tables; historical `orders` exists and must be preserved. No production schema migrations before a verified backup and acceptance plan.

## Public host evidence
GitHub read-only probe: https://github.com/3078024889/lingxi-quantum/actions/runs/42344246384

| Origin | / | /siai | /api/health | anonymous /api/sasi/account | anonymous /api/tools/jobs |
| --- | --- | --- | --- | --- | --- |
| International Vercel apex | 402 | 402 | 402 | 402 | 402 |
| Domestic ECS live | 200 | 200 | 200 | 500 | 500 |
| Cloudflare preview Worker | 200 | 200 | 200 | 503 | 503 |

Expected minimum **public** no-cookie gate for each final domain: `/ /tools /siai /api/health` HTTP 200 and both protected sample GET routes HTTP 401. This is necessary but NOT sufficient.

## Production launch order (STRICT)
1. Complete exact-SHA source/SQL/4 browser-shard green gate, reproducible standalone with client Supabase public URL/publishable key baked at **build time**, and protected anonymous 401 at **runtime**.
2. For CN, install verified SHA256 bundle into a NEW isolated versioned release directory, privately staged on loopback 3189 with correct same-project server and browser config. Do not print any secret, and do not copy environment files into artifacts. Test real account sign-in/out/session persistence; original/translated file reopening, PDF edit, camera/mobile upload, R2 and SASI jobs.
3. Confirm refund/settlement provider callbacks, provider signatures, legacy paid orders/exports, currencies, one-free-use quota, all 21 execution routes and full 124-tool roundtrips. Run production-migration dry-run and capture immutable DB snapshot before any DDL.
4. Promote CN by swapping only the verified application/service target, with prior service/release/config preserved; after user-visible checks, disable maintenance completion banner only after `LINGXI_SITE_NOTICE_ENABLED` and readiness flags satisfy reviewed contract.
5. For COM, provision or identify an authorized **non-mainland Node backend**. Do not route the unregistered .com to mainland ECS. Cloudflare official OpenNext/vinext adapter must pass actual SSR/auth/payments/media tests first, or use a dedicated secured Cloudflare Tunnel to the proven non-mainland Node server. Existing public-only Worker returns 503 for business APIs and must NOT be promoted.
6. Secure CF preview hostname with Cloudflare Access; validate login cookies/Host/Origin callbacks, OAuth redirect allowlists, 9 locales, SEO, full privacy and data deletion, scheduled cleanup jobs, R2 private signatures, static assets/large-media CDN and all 124 tool output paths.
7. Rehearse rollback to a **proven healthy** prior environment (not merely Vercel READY with HTTP 402). Obtain evidence and an approved exact package hash.
8. ONLY after passing real COM probe and signed-off checks: in Cloudflare `lingxifield.com` zone replace *only* the apex and www records that currently route to Vercel, and attach a verified **Custom Domain** to the actual production worker/tunnel ingress. Leave NS, CN records, MX, TXT, CAA, mail and independent `globalsiai` untouched.
9. Verify HTTPS and www 301, nine languages, public APIs, real login and trial purchase/refund, full features and rollback for BOTH public main domains. Then explicitly enable factual "upgraded" announcement with a verified date, never before.

## Immediate no-go reasons
- Existing COM apex HTTP 402; cloudflare preview private business API HTTP 503; no usable authorized Cloudflare/Alibaba production connector in this chat.
- Existing CN production private API HTTP 500.
- Supabase production has not applied new toolpass migrations; real payment, login, user session and complete 124 tools acceptance not yet evidenced.
- GitHub Actions source or standalone artifact green is **offline/source proof only**.

## Sources
- https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
- https://developers.cloudflare.com/workers/framework-guides/automatic-configuration/
- https://developers.cloudflare.com/tunnel/
- https://nextjs.org/docs/app/api-reference/config/next-config-js/output
