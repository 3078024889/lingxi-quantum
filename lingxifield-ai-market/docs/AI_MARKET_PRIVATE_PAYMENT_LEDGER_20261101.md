# Isolated AI Market Billing Ledger — live schema audit 2026-11-01

Supabase project: sxsgdpqojepgbbrxrzlq
Migration applied: `ai_market_private_order_events_refunds_isolation_20261101`

## Created
- `ai_market_private.billing_orders` — unique merchant ref, frozen currency / minor-unit amount, plan, status, provider reference, paid proof.
- `ai_market_private.payment_events` — unique (provider, external_event_id), SHA-256 payload digest and mandatory signature-verification timestamp.
- `ai_market_private.payment_refunds` — unique provider refund reference and refund-proof timestamp.
- Allowed providers: Alipay (CNY), WeChat Pay (CNY), PayPal (USD).
- Providers' callbacks, merchant secrets, vendor verification, order creation, fulfillment and refunds MUST be implemented and tested separately.

## Read-only access-control verification
- Three private tables exist.
- RLS enabled on all three tables.
- `anon` schema usage: false; `authenticated` schema usage: false.
- `anon` SELECT: false; `authenticated` INSERT: false.
- Only backend service role has explicitly granted table privileges.
- Existing public orders and vendor tables were not modified.
- Supabase security linter reports `rls_enabled_no_policy` informational messages on these private deny-by-default tables (intentional). Preserve deny-by-default rather than granting permissive policies.

## Release blockers
1. AI Market `/api/v1/billing/providers` currently returns all `checkoutAvailable:false`. `/api/v1/billing/checkout` deliberately rejects checkout.
2. A backend must derive plan price and currency from an approved server-side catalog; never trust browser amount or currency.
3. Implement signed merchant callbacks, timestamp replay defense, atomic idempotent transition `pending -> paid` and refund idempotency in backend service role only.
4. Verify 3 providers in sandboxes and approved merchant accounts, including double callbacks, wrong amount/currency, invalid signature, cross-vendor IDOR, simultaneous capture/refund, retry and reconciliation.
5. No production charges and no switch to active checkout until written merchant acceptance and end-to-end proof.

This is an internal ledger foundation, NOT a payment integration or merchant approval.
