# lingxifield.com international recovery: Cloudflare primary, Vercel standby

> Status: migration investigation only. Not deployed; no DNS changes. The production .com and all .cn routing remain untouched. Latest source must be compared to the currently deployed Vercel SHA before cutover.

## Non-negotiable
- Preserve existing Vercel lingxi-quantum project, deployment history, domains, environment configuration, and production availability. Do not detach, disable, erase, or pause the Vercel app.
- Preserve .cn Aliyun recovery independently; .com changes must not touch .cn origin, its DNS, auth/cookies or payment flow.
- Do not enable Cloudflare domain routes or change .com DNS until real smoke tests, full-site acceptance and a documented fallback drill are passed.
- Cache publicly shareable assets; never cache authenticated responses, personal files, payments, signed URLs or private APIs.
- Do not promise automatic free-plan failover. Free quota exhaustion may cause Worker HTTP 429 before any fallback is possible.

## Current repo observations (2026-11-06)
- next version is 15.5.27. Cloudflare vinext is beta; vinext compatibility, build and runtime have NOT been tested.
- next.config.js traces SASI FFmpeg WASM and native video helper scripts. Node module compatibility and bundle footprint require a full audit.
- middleware.ts handles host redirects, noindex/canonical and Supabase session refresh. Do not blindly trust untrusted forwarded-host; verify host and cookie behavior on Workers.
- vercel.json schedules /api/cron/privacy-cleanup, /api/cron/withdrawal-reconcile and /api/cron/sasi-v5-radar.
- .com and .cn currently share a Vercel project. Routing must be hostname scoped.
- Client-side PDF/FFmpeg/OCR remain preferable when real output can be independently verified. A static signature inventory is not functional proof.

## Migration execution
1. Record the working Vercel deployment SHA and .com behavior. Record only required environment variable NAMES, never values or secret-bearing .env files.
2. Run: node scripts/cloudflare/audit-com-readiness.mjs --json /tmp/com-cloudflare-audit.json . Triage Node-native dependencies, memory-heavy APIs, auth/payment routes, scheduler and oversized assets.
3. Run official command: pnpm dlx vinext check . Review results and only then initialize vinext in an isolated branch with explicit cache and image options, leaving the current Next.js build functional.
4. Serve public static pages and assets from Cloudflare CDN. Move small session/status/authorized-upload APIs to Workers only after measuring p95/p99 CPU and security behavior. Keep financial mutations on verified safe backends.
5. For R2 uploads, authorize short-lived narrowly scoped signed URLs; browser uploads bypass Worker bodies. SASI jobs submit bounded metadata and use existing provider/authorized compute with signed callbacks, idempotency and R2 delivery.
6. Recreate all 3 scheduled jobs in a separately verified scheduler. Show real execution and audit logs, not merely configured triggers.
7. Deploy testing only to workers.dev. Verify 9 languages and SEO, 124 tool routes' actual input/output/reopen, PDF editor, file exports, sessions, history, purchases, callbacks/refunds, abuse protection, phones, SASI provider output; record exact commit SHA.
8. Test the Vercel fallback with a proven rollback rehearsal before .com switch. Do not touch .cn. After production acceptance, monitor Cloudflare CPU, request budget, error rates, Vercel fallback readiness.
9. On failed acceptance, keep .com at its current origin. Never replace broken controls with mock or success placeholders.

## Capacity and manual fallback
- Workers Free has 100k Worker requests/day, 10ms CPU/request, 128MB memory. Network wait does not generally consume CPU; compute/render/parse do. Static assets matching the static asset handler are free.
- Workers Free has 20k static assets per version and 25 MiB per static asset. Enforce a preflight.
- A host-scoped Cloudflare Worker route over separately verified Vercel origin DNS can be a manual failback design, but only AFTER validating DNS, certificates, redirects, Host headers and cookies. Disabling a route might restore traffic to the Vercel origin; this is not automatic failover and requires a real drill.
- Do not add untested Worker-to-Vercel fetch failover: redirects/callbacks/session and payment replay can create loops or duplicate side effects.
- Alert at a conservative warning threshold (for example 70%-80% free daily Worker request use), and preserve tested manual rollback steps.

## Reference docs
- https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/nextjs/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/

## Release gate
- [ ] vinext check and server-transitive import review complete
- [ ] Both native Next.js build and vinext build pass
- [ ] 124-tool actual output evidence complete
- [ ] Three cron jobs and R2 retention/retry lifecycle verified
- [ ] Authentication, historical purchases, refunds and provider output verified
- [ ] CPU and static capacity measurements pass
- [ ] Vercel fallback routes tested; .cn unchanged
- [ ] Explicit exact-SHA production approval before .com switch

## Read-only dual-origin checks (new)

The Vercel project MUST remain connected to the original Git repository. Its environment variables, history, custom-domain registration and emergency deployment access remain untouched.

After provisioning a separate Cloudflare *test-only* Worker, run the probes with the exact deployment preview addresses, **not** with secrets or signed URLs:

```bash
node --test tests/cloudflare/probe-com-origins.test.mjs
node scripts/cloudflare/probe-com-origins.mjs \
  --cloudflare https://YOUR-TEST-WORKER.YOUR-SUBDOMAIN.workers.dev \
  --vercel https://YOUR-VERIFIED-DEPLOYMENT.vercel.app \
  --require-healthy
```

An origin passing `/api/health`, `/robots.txt`, and `/siai` is **anonymous smoke only**. Redirects, authentication walls, invalid content types or cacheable health responses fail the check. This deliberately does NOT check or alter payments, personal records, provider tasks or DNS. Build-SHA equality, user sessions, callback URLs, cookies and real functional tests are mandatory separate release evidence.

**Standby caveat.** The project's `lingxi-quantum.vercel.app` alias has been configured to redirect to `lingxifield.com`; a redirecting alias is not an independent fallback proof. Select a directly reachable deployment URL and verify `GET /api/health` without `.com` redirection or deployment-protection challenge. Do not describe `READY` alone as traffic-ready.

**Fail-open is not a generic solution.** Cloudflare Workers route fail-open can bypass a Worker after daily quota exhaustion, but would also bypass any authentication, safety gate or authorization performed *only* by that Worker. Treat payment, permission, private-file access and abuse protection as security-critical and fail closed unless independently equivalent enforcement has been proven at the fallback origin.

**Double proxy trade-off.** Cloudflare Worker Routes can execute before an existing origin, allowing a tested manual route-disable fallback, but Vercel explicitly discourages external reverse proxies because of security visibility and operational complexity. Prefer independent Worker origin testing and an explicit, rehearsed DNS/route switch. Never configure a custom-domain Worker and assume removing it automatically restores an origin that has no healthy DNS record.

**Operational trigger.** Alert at 70% of Cloudflare's daily request budget, evaluate traffic and availability, and initiate a human-reviewed fallback before exhaustion. A 429/1027 event is a trigger to investigate, not a green light to automatically replay mutating requests. DNS TTLs, certificate readiness, payment callback hosts, OAuth redirect URLs, Supabase redirect allowlist and preview-host cookie behavior must all be captured in the signed-off rollback checklist.

Relevant upstream guidance:
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/configuration/routing/routes/
- https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment
