# Existing Alibaba Cloud mainland ECS — zero-new-spend build and restore plan

Scope: **the existing mainland ECS** (Huabei 5 / Hohhot, 2 vCPU, 2 GiB RAM, 3 Mbps). This is NOT an overseas instance. No new host or subscription is purchased.

## Safety and truth constraints

- The production `.cn` host currently proxies toward a Vercel origin that returns **HTTP 402 / DEPLOYMENT_DISABLED**. Rebuilding the frontend on GitHub is NOT itself a restoration.
- This branch builds a self-hosted **Next.js standalone** artifact in GitHub Actions, so the 2 GiB ECS does not need to compile the monorepo.
- No host access, operating-system or nginx changes, Cloudflare authorization, DNS edits, or real payment test is performed by this workflow. Vercel remains configured as-is.
- The site has external Supabase, R2, provider and payment integrations. Preserve real existing environment values and ensure matching allowed callback/origin URLs before exposing production.
- Build-time `NEXT_PUBLIC_*` variables must be configured as GitHub repository variables for the target host **before any live cutover**. The secret Supabase service-role key, R2 secrets, provider keys, payment/webhook keys and signing secrets must never be included in GitHub Actions artifacts, source files or logs.
- The artifact smoke check on GitHub verifies `/api/health` and `/tools` only. It is **not** an authentication, payment, 124-tool delivery or production browser acceptance test.
- Mainland deployment requires an appropriate ICP filing for **each domain** served on that mainland host. Do not route an unfiled `.com` through mainland ECS simply to bypass Vercel.

## Deployment recipe (apply only after a server-side SSH operator validates existing nginx and backups)

1. Inspect existing services and capacity over SSH without editing anything:

   ```sh
   cat /etc/os-release
   free -m; df -h; sudo ss -lntp
   sudo systemctl status nginx --no-pager || true
   sudo nginx -T > /root/nginx-before-lingxi.txt 2>&1 || true
   command -v node; node --version
   ```

   Record CPU, memory, disk free space, firewall rules and the current `.cn` upstream. This ECS is only **2 GiB RAM**; all heavy OCR, video and document conversion must remain in separately validated execution environments.

2. Download the successful **GitHub Actions** build artifact for this exact source revision; validate the SHA256 file, do not copy secrets into it.
3. Install Node.js **24.x** and create a non-login `lingxifield` service account; prepare `/opt/lingxifield/releases/<sha>/` and `/etc/lingxifield/production.env` with permissions restricted to the service account and administrators. Extract the artifact into the immutable release directory.
4. Install the reviewed `infra/selfhost/lingxifield-ecs.service` under `/etc/systemd/system/`; adjust ExecStart to the actual absolute `node` binary path confirmed in step 1, not a guessed path.
5. Start the Node service on **127.0.0.1:3187 only**, leaving all current 80/443 listeners and existing nginx upstream untouched. Validate:

   ```sh
   curl -fsS --max-time 5 http://127.0.0.1:3187/api/health
   curl -fsS --max-time 15 -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3187/tools
   curl -fsS --max-time 15 -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3187/siai
   journalctl -u lingxifield-ecs -n 70 --no-pager
   ```

6. Before public cutover, verify nine languages, user login/logout, Supabase session refresh, tool file upload/download, R2, CORS, 124 tool visibility, callback/webhook signature checks and rollback. Payment must remain disabled until independently verified.
7. Only if the above passes, back up the **existing** nginx site config and change the `.cn` upstream for the site to `http://127.0.0.1:3187` with preserved `Host`, `X-Forwarded-Host` and `X-Forwarded-Proto`. Run `nginx -t` and reload nginx; verify HTTPS externally, then retain a fast rollback path to the previous config.
8. Monitor memory/OOM and bandwidth (3 Mbps), and never use production ECS to compile Next.js. If the Next.js runtime exceeds the available 2 GiB memory, keep it offline and fall back to a static-only recovery site, rather than risking the existing services.

## Cloudflare / overseas

Use a **separate**, static-only Cloudflare Pages rescue build for public pages on `.com` until full-stack Cloudflare Workers compatibility and budgets are proven. This ECS is in **Hohhot, not Hong Kong**. A separate overseas ECS is a new, paid instance. Vercel stays in the account but remains unavailable while paused.
