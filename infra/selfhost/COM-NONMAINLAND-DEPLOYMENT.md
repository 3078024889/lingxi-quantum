# International site architecture: no China-mainland .com origin

**lingxifield.com has not completed mainland ICP registration.** Do not point its DNS to 39.104.205.16; do not install `lingxifield.com` HTTP/HTTPS Nginx virtual hosts on the Chinese mainland ECS; do not hide a mainland .com origin behind Cloudflare's proxy. The former dual-domain ECS script is *disabled for all write modes* and now provides read-only `--status` inspection only.

Current verified infrastructure:
- `lingxifield.cn` public HTTPS -> permitted mainland ECS Next.js at 127.0.0.1:3188, but most business functions still need backend environment variables and real-user testing.
- `lingxifield.com` DNS nameservers `lou.ns.cloudflare.com`, `mimi.ns.cloudflare.com` (Cloudflare DNS). At last inspection the A records pointed at Vercel IPs; not ECS.
- Supabase project remains active. R2 and model vendor backends can serve a non-mainland front-end if authorized and origin/API policies allow.

**Target, not yet deployed:** Cloudflare Workers/vinext (or a compatible OpenNext adaptation) runs the international site's Next.js-compatible presentation plus verified lightweight route handlers on Cloudflare's non-mainland infrastructure. Use independent Supabase Auth redirects and sessions for each domain. Heavy native/media/AI operations require a separately compliant runtime or third-party processing API, and should never be silently downgraded to mock/placeholder or bypass payment permissions. Mainland `.cn` API services may be used under their own duly filed names only after evaluating cross-border data flows and access-control; never front an unfiled `.com` site through a mainland-hosted `.com` origin.

The application has ~216 Next.js API route files across payment, SASI, tool jobs and authentication; do not claim feature parity from SSR build success. Test every required API group, file transformations, payment callbacks, storage and mobile flows before switching international production DNS.

Workers Free published limits: 100,000 requests per day, 10ms CPU/request, 128MB memory. It will not reliably perform FFmpeg/large PDF/OCR/video jobs in the same Worker. See https://developers.cloudflare.com/workers/platform/limits/ and https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/ .

Safe first steps: prepare a separate cloudflare runtime branch; audit native modules, size and Node API compatibility; build a separate Worker bundle; test auth and key routes against an isolated `workers.dev` URL; keep DNS untouched until verifiable international production readiness. Cloudflare DNS proxying alone is not a hosting migration.
