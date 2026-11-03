# Global SIAI shared account and paid listing architecture

## Account decision
Global SIAI reuses **the existing LINGXIFIELD Supabase user identity** for manufacturer claims, instead of creating another login and user database. Public browsing and free feedback still need no login.

The Global SIAI hosted market can be served on `globalsiai.com`, while the trusted account operations happen at `https://lingxifield.com/account/ai-market`. These are different registrable domains: browser auth cookies **cannot** securely be shared between them. Do not forward JWTs, passwords or refresh tokens through URL parameters. A marketing page may redirect to the central account portal with only the public, allowlisted product ID.

## Workflow
1. User clicks **认领** in one of the 32 listings.
2. Browser opens the original LINGXIFIELD account portal with an allowlisted product identifier. If not logged in, `/account?next=/account/ai-market...` reuses the main account login and verifies the server session.
3. User submits name, public official URL, public evidence URL and work email (NOT automatically accepted as proof), all tied server-side to `auth.users.id`.
4. A database trigger serializes submissions and caps an account at 3 free claims. `UNIQUE(user_id,product_id)` prevents duplicate submissions. RLS only lets a user read their claims and create pending claims. Anonymous users cannot claim and authenticated users cannot self-approve or edit claim status.
5. An independent human/company ownership review must confirm the claimant's authority. Only a controlled operator/service role may update review status. **No automatic approval from email domain matching.**
6. Approved ownership is a prerequisite for future verified merchant orders and clearly labeled paid placements. A subscription **never alters organic rankings**.
7. Refund/revocation lifecycle must be implemented and independently verified before live merchant checkout is enabled.

## Deployment gates
- New main-site migration: `supabase/migrations/20261102120000_ai_market_vendor_account_claims.sql`. This is source code only until applied to the authenticated main database following review; neither Vercel READY nor the PR alone creates the table.
- Main-site route: `/api/ai-market/vendor-claims` authenticated with the existing SSR Supabase cookies. GET returns owner-only claims; POST requires same-origin request, confirmed account, 32-item whitelist, validated inputs. Until migration, storage errors return 503, not false success.
- Main account portal: `/account/ai-market`; market guest claim endpoint now rejects `claim` and still permits anonymous `update` and `list` suggestions.
- No credentials are copied to Global SIAI Vercel preview; `AI_MARKET_BILLING_ENABLED=0` continues to fail closed.
- The portal is initially anchored to `lingxifield.com` as the central login domain. Language adaptation and the cross-domain logged-in indicator require further UX verification, but identity is correctly centralized already.
- Production requirements still open: migration applied with review, manual approval UI/operator action audit, account claim notification, paid SKU in LINGXIFIELD main order registry, provider-verified callback, atomic entitlement ledger, refund and dispute handling, real browser/device verification.

## Threat model
- An arbitrary client-supplied `user_id` or `status` is not trusted; both server insert and RLS use authenticated identity and locked-down INSERT columns.
- Two concurrent applications cannot bypass the three-product ceiling due to the per-owner advisory transaction lock.
- Brand/website names and contact emails are **unverified claims** until reviewed.
- Checkout is not unlocked by a mere Vercel environment variable.
- The marketplace does not store passwords or session tokens. 

## Manual approval and audit extension

The central LINGXIFIELD account now has a server-only reviewer API and review queue. Reviewer authorization uses a verified server-fetched Supabase user and `app_metadata.ai_market_vendor_reviewer === true`; never `user_metadata`, a submitted email, a browser-supplied role or an environment-provided static operator token. The explicit reviewer role must be provisioned separately by the authenticated organization administrator; no user is auto-promoted by the PR.

Reviews have an expected current status, human-entered 12-1000 character reason, and for approvals an explicit checkbox confirming independently reviewed corporate evidence. An atomic PostgreSQL trigger writes the previous/new states and reviewer user ID into a non-public audit log; an approval and its audit either both commit or both fail. An index prevents two simultaneously verified/approved representatives for one product; competing pending claims do not silently disappear. `service_role` is available only server-side in the guarded main-site API.

This is an applicant ownership review and **does not** issue a payable SKU, change independent ranking, settle a payment or open production checkout. No migration has been applied to production in this PR.

## Promotion request and immutable order link (2026-11-02)

Approved claimants can select a paid placement plan from their original `lingxifield.com/account/ai-market` portal. The separate read/write endpoint `/api/ai-market/vendor-promotions` requires the original verified Supabase account, rejects cross-origin submission, takes **only** claim/product/plan/currency/provider/idempotency UUID, and never trusts a submitted amount, status, provider proof or order ID.

`ai_market_vendor_promotion_requests` is a separate RLS-protected table. Price is PostgreSQL **GENERATED ALWAYS AS** from the server-approved plan; CNY/USD use nominally identical 49/149/299. All inserts require an **approved claim owned by the same authenticated user**, an exact product ID, valid provider/currency pair, and are unique per idempotency key. Owner can read requests but cannot UPDATE their price, status, linked order, payment or entitlement.

To reuse the main merchant, a future reviewed **service-role only** adapter may associate a request with an existing `public.orders` UUID. An atomic trigger requires an order for the same user, provider, currency, exact plan SKU `ai-market:sponsored|category|brand`, exact amount and `pending` status. A SASI balance top-up fails. The present main product catalogs do not yet contain these SKUs. No route here creates the real merchant order or updates paid status. Payment providers/entitlements are disabled and no ranking changes.

Security tests run an isolated Supabase-compatible PostgreSQL 17 schema with a disposable `public.orders` ledger and prove price invariance, approved ownership, cross-account isolation, idempotency, forbidden payment/price UPDATE, rejection of SASI recharge, valid exact-SKU association and no state rollback.
