# Isolated AI Market Billing Ledger — live schema audit 2026-11-01

Supabase project: `sxsgdpqojepgbbrxrzlq`

## Created and applied
- `ai_market_private.billing_orders` — unique merchant ref, frozen currency / minor-unit amount, plan, status, provider reference and paid proof.
- `ai_market_private.payment_events` — unique (provider, external_event_id), SHA-256 payload digest and mandatory signature-verification timestamp.
- `ai_market_private.payment_refunds` — unique provider refund reference and refund-proof timestamp.
- `ai_market_private.record_verified_payment(...)` — service-role-only atomic capture after external signature verification.
- `ai_market_private.record_verified_refund(...)` — service-role-only atomic refund settlement after external signature verification.
- Providers are constrained to Alipay (CNY), WeChat Pay (CNY) and PayPal (USD).

## Read-only access-control verification
- All three private tables exist and have RLS enabled.
- `anon` and `authenticated` have no usage on `ai_market_private`, no table access, and no execute permission on the verified refund function.
- Only backend `service_role` has execute permission on the verified refund function.
- Existing public orders, SASI wallet and vendor tables were not modified.
- Preserve private deny-by-default table policies; do not grant public policies to suppress informational RLS lints.

## Verified refund transaction test (rolled back)
A real transaction was executed against the connected Supabase project, then rolled back:
1. Created a temporary USD 100.00 paid order with a verified payment reference.
2. Settled a USD 30.00 partial refund — returned `partially_refunded`.
3. Replayed the same provider event — returned `duplicate`.
4. Attempted USD 70.01 — rejected with `REFUND_EXCEEDS_PAID_AMOUNT`.
5. Settled the remaining USD 70.00 — returned `refunded`.
6. Replayed the same event after the order was fully refunded — returned `duplicate`.
7. Verified order status `refunded`, aggregate refund USD 100.00, then rolled back the test transaction. A follow-up query confirmed zero test orders remain.

The refund function locks the order row with `FOR UPDATE`, checks the remaining refundable amount inside the same transaction, and uses the provider event ID plus provider refund reference for replay protection. The later replay-ordering migration ensures a duplicate event remains idempotent even after the order reaches the terminal `refunded` state.

## Release blockers
1. AI Market `/api/v1/billing/providers` currently returns all `checkoutAvailable:false`; `/api/v1/billing/checkout` deliberately rejects checkout.
2. Provider-specific order creation, signed webhook/callback verification, refund API adapters and fulfilment delivery are not yet implemented.
3. The backend must derive plan price and currency from an approved server-side catalog; never trust browser amount or currency.
4. Verify each provider in sandbox and approved merchant accounts, including duplicate callbacks, wrong amount/currency, invalid signature, cross-vendor IDOR, simultaneous capture/refund, retries and reconciliation.
5. No production charges or sponsored entitlement activation until written merchant acceptance and full end-to-end proof.

This is a hardened private ledger and atomic settlement foundation, NOT an active payment integration or merchant approval.
