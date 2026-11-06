# Full dynamic lingxifield.com without Vercel

This is a two-phase Nginx deployment on the **existing** Aliyun ECS, sharing the functioning Next.js process at 127.0.0.1:3188. It does **not** make a Cloudflare Pages static export, change DNS, access secrets, run certbot automatically, or alter the .cn/document gateway vhosts.

1. Verify the auth-repaired artifact was extracted: `test -s /opt/lingxifield/releases/ec4edd/server.js`.
2. Run `bash scripts/ops/lingxifield-com-ecs-nginx.sh --status` to inspect the .com DNS, existing vhosts, certbot, and local origin.
3. Run `--stage-http` for the ACME challenge endpoint. This modifies only a new .com HTTP virtual host, with automatic rollback.
4. Point the root and www DNS records for lingxifield.com to this ECS (or proxied through Cloudflare to it). Resolve DNS and firewall/80 before issuing Let's Encrypt.
5. Issue certificate with `certbot certonly --webroot -w /var/www/lingxifield-com-acme -d lingxifield.com -d www.lingxifield.com`.
6. Run `--activate-https`. A correct certificate is required. It installs a .com HTTPS reverse proxy to 3188, tests /, /tools, /siai, /api/health with a unique origin header, and rolls back on failure.
7. Optionally put Cloudflare DNS/CDN in front (proxied A records, SSL Full strict). **No Cloudflare Pages builds occur for DNS/CDN proxying.** Dynamic request handlers remain in Next.js on ECS.
8. The .com still needs the server-side production environment file, Supabase Auth .com callback allowlist, R2, SASI, payment/webhook domain changes and full end-to-end verification.
9. Risk: a single 2-vCPU/2-GiB/3-Mbps China ECS is a cost-saving recovery origin, not independent overseas hosting. Heavy PDF/video jobs and vendor models need browsers, existing separate services and model APIs. A Cloudflare-only full dynamic migration is not compatible with all current Node.js/native-tool processes.
10. For Workers compute, a later split/hybrid build can be tested on an isolated branch; no public routing before full functional parity.

Official: https://developers.cloudflare.com/dns/proxy-status/use-cases/ and https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/ .
