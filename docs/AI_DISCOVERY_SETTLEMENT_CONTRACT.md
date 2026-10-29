# AI Discovery sponsorship payment settlement contract

The existing checkout product catalog currently contains SASI balance top-ups, not AI Discovery sponsorship products. This module does not create orders or charge money.

`verifySponsorshipSettlement` is a pure validation layer. The caller MUST obtain `trustedGatewayEvent` only from a server-side gateway verification adapter, never from HTTP request JSON or client-supplied flags. The `verifiedByServer` and `signatureValid` booleans are NOT proof by themselves. Verify signatures, merchant ownership, event status, amounts and currency against the payment provider, then reconcile with a persisted order.

Before enabling sponsorship: introduce a separate paid sponsorship product, server-owned order and placement mapping, protected gateway adapter, unique idempotency constraint, refunds/disputes, audit log, tax terms, expiration, RLS and integration tests. Do not reuse SASI wallet top-up product IDs or credit balance as sponsorship settlement. No payment flow is live from this module.

Local verification: `node --test tests/ai-sponsorship-settlement.test.mjs` (7 cases).
