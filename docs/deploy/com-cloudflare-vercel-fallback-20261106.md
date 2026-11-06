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

## 2026-11-06 verified second-stage engineering results

All entries in this section are backed by actual GitHub Actions, not inferred production success.

- Original source assets: six files exceed 25 MiB. Running `scripts/prepare-media-runtime.cjs` creates a **seventh**: `public/media/ffmpeg-0.12.10/ffmpeg-core.wasm`. The read-only asset integrity audit now requires all seven, including the generated file, to be accounted for and SHA-256 hashed.
- Official Cloudflare `vinext init` successfully executed on a throwaway GitHub runner, with no deployment credentials, DNS or Vercel mutation. It automatically upgraded React 18.3.1 → 19.3.1 and installed vinext 1.4.3 even though the invoked init CLI was pinned to 1.3.1. These are runner-only modifications, **not** an authorized upgrade to main. Pin reviewed dependencies and revalidate existing React/Next behavior before committing any permanent migration.
- Actual `pnpm run build:vinext` **failed** while bundling `lib/sasi/intelligence/archive-generated-media.ts` because native `sharp` was mapped to a missing `empty-stub.js`. The code also uses Node filesystem/temp files and a spawned video decoder. A fake `sharp` implementation is not an acceptable production fix. Separate actual media validation/archiving into a verified Node processing service and keep light task/auth orchestration in Workers.
- A separate graph scanner walks transitive literal API imports. From 216 API route entry files, 58 routes have source indicators for native Node file/process/network dependencies; six reach `sharp`. This is a **signal inventory**, not 58 confirmed runtime failures or security vulnerabilities. Dynamic imports, packages and generated code can reveal additional issues.
- The `.com` project still points to Vercel deployment `19b88763` (READY), while source main was `9ce91400` at review. A READY historical deployment cannot certify the newest candidate. Vercel remains intact as standby.

## Seven public assets: R2 CDN contract, no silent loss

The seven public assets are not private customer data. They are browser-loadable engine/model/video files and can use a separate Cloudflare R2 **public custom domain** after the owner explicitly configures one. Do not enable `r2.dev` for production: it is intended for development, rate-limited and cannot provide normal CDN caching controls.

1. Run `node scripts/prepare-media-runtime.cjs` in an environment with frozen project dependencies.
2. Generate hashes: `node scripts/cloudflare/audit-large-assets.mjs --json ./com-large-assets.json --fail-unaccounted`. The manifest includes exact relative paths, SHA-256 checksums and file sizes.
3. Upload the seven **existing verified files**, preserving their paths as R2 object keys. Official CLI example:
   ```bash
   npx wrangler r2 object put YOUR_PUBLIC_ASSET_BUCKET/models/Xenova/clip-vit-base-patch32/onnx/vision_model_quantized.onnx --file public/models/Xenova/clip-vit-base-patch32/onnx/vision_model_quantized.onnx --content-type application/octet-stream --remote
   ```
   Apply `video/mp4` for the entrance video, `application/wasm` for WASM, and `application/octet-stream` for ONNX. Do not publish user uploads, passwords, receipts or generated private media to this bucket.
4. Configure a dedicated `*.lingxifield.com` custom hostname for the bucket, with GET/HEAD CORS allowing `https://lingxifield.com`, exposing Content-Length and Content-Range and permitting Range requests. Check CDN caching policy for ONNX/WASM (not reliably cached under default extension rules). Do not edit `.cn` routing.
5. Only **after** the assets exist at that hostname, run:
   ```bash
   node scripts/cloudflare/prove-r2-assets.mjs --cdn https://YOUR-ASSET-SUBDOMAIN.lingxifield.com --manifest ./com-large-assets.json --full
   ```
   It rejects wrong length, wrong MIME, missing CORS, broken partial content, and SHA-256 mismatch, and streams data rather than loading whole files into RAM. A header-only check intentionally does not count as asset delivery verified.
6. Implement and test hostname-specific browser asset routing for `.com` only. Keep the original files in the repo and Vercel until real browser PDF/video/OCR/model tests pass, including a fallback rehearsal.
7. `siteReleaseReady` remains false after R2 asset validation; all service-level authentication, billing, tool journeys, Cron, worker CPU, and Cloudflare deployment checks are independent.

Official guidance:
- https://developers.cloudflare.com/r2/reference/wrangler-commands/
- https://developers.cloudflare.com/r2/buckets/public-buckets/
- https://developers.cloudflare.com/r2/buckets/cors/
- https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/nextjs/

### 2026-11-06 · CI minutes control and preview CLI fix

- Source-backed real R2 download proof succeeded for all 7 public objects: HEAD size, HTTP 206 Range, CORS, full streamed SHA-256 (GitHub Actions [42179848366](https://github.com/3078024889/lingxi-quantum/actions/runs/42179848366)). This proves **only public asset delivery**, not paid or authenticated functions.
- Deploy CLI issue found: npm has `@vinext/cloudflare 1.3.3` installed by `vinext@1.4.3 init`; `@vinext/cloudflare@1.4.3` is an unavailable package version. Use `pnpm exec vinext-cloudflare previews deploy ... --skip-build` to invoke the already installed CLI from the identical CI worktree, without another npm install or recompilation.
- CI budget: Native Next.js full Production Gate, mobile PDF, desktop PDF, and tool-quota Playwright suites are deliberately **skipped for pull requests whose exact head branch is `infra/com-cloudflare-readiness-20261106`**, while other branches remain unchanged. These suites remain manually runnable with `workflow_dispatch`. A skip is not proof of passing: **run them again on the approved final source SHA and require complete success before any production merge/cutover**. This reduces repeating 4 GitHub-hosted CI jobs per tiny Cloudflare-only commit.
- No Cloudflare Preview or production deployment means no `lingxifield.com` recovery claim. A public-only Worker Preview will deliberately reply `503` on billing, user accounts and SASI APIs until independently migrated and proven. Vercel remains untouched, not a functioning fallback while its origin returns `402 DEPLOYMENT_DISABLED`; `.cn` remains separate.
