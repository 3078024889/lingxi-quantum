# International admin same-domain recovery (release candidate)

Production blocker observed 2026-11-08: `lingxifield.com/api/account/money-admin` and `/access` returned HTTP 500 whereas .cn accepted anonymous requests with 403/200.

The main .com Worker must NOT receive a new Supabase service-role key merely to expose these routes.

Use a **separate tiny Cloudflare Worker**, no secrets, strictly mapped to:
- `lingxifield.com/api/account/money-admin*`
- `lingxifield.com/api/site-announcements*` (public verified notices; only after .cn endpoint publishes)
- `www.lingxifield.com/api/account/money-admin*`

A more-specific route wins over `lingxifield.com/*`. The Worker forwards the same-domain login cookie only to `https://lingxifield.cn` over HTTPS, and .cn performs the existing validated admin email/rights check and returns data. It rejects unrelated API/payment routes, foreign mutation origins, redirects and any Set-Cookie from the upstream. No merchant operations are created by the bridge.

**2026-11-08 narrow Worker deployed and externally verified.** GitHub Actions run
https://github.com/3078024889/lingxi-quantum/actions/runs/42449780206 deployed
`lingxifield-com-admin-facade` to three exact patterns for main `.com`:
`/api/account/money-admin*`, `/api/tools/pass*`, `/api/site-announcements*`.
The existing global Cloudflare gateway and Vercel fallback were preserved.

Post-deploy anonymous validation:
- `.com/api/account/money-admin/access`: 200 (public permission status only)
- `.com/api/account/money-admin`: 403 anonymously (correct access denial)
- `.com/api/tools/pass`: 200
- `.com/tools/pass`: 500 (web page still needs new static release)
- `.com/api/site-announcements`: 502 because old .cn upstream still returns 404.
- `.com/ai-wallet`: timeout; three merchant providers remain unavailable.
- `.cn/api/tools/access`: 503, and `.com/api/tools/access`: 503. Do not accept toolpass payment until server entitlement and free-use gate are actually verified.
- These results are from https://github.com/3078024889/lingxi-quantum/actions/runs/42449906417.
- Authenticated admin browser acceptance is not yet proven.

**Original cutover checklist retained for rollback reference:**
1. Require the exact branch SHA to pass TypeScript, full Next build and security tests, plus manual auth on .cn.
2. Confirm `www` canonical redirects continue to work. Better only route main `.com` first.
3. Deploy the tiny Worker with a deliberately isolated Cloudflare token; NEVER disable the previous global static gateway or Vercel.
4. Add the narrow route by Cloudflare API or dashboard, verify anonymous `/access` returns 200 and anonymous `/money-admin` is 403, not 500.
5. In a logged-in browser on **.com**, verify `/account/money-admin` renders on the same host and a legitimate admin sees summary, orders and pending actions. Test an ordinary user receives 403.
6. After testing, repeat on `www` only if required (canonical redirect is preferable).
7. On 5xx or session mismatch remove only the specific `/api/account/money-admin*` route, leaving the original gateway, .cn and Vercel untouched.

Never copy credentials between DNS zones, never share an admin session link, and do not proxy public USD/PayPal checkout to CNY payment methods.
