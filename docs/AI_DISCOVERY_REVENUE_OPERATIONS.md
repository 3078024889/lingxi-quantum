# AI Discovery: automation and payment integration contract

The website already has checkout and payment infrastructure, but AI Discovery sponsorship is **not** integrated with it yet. Do not claim paid sponsorship is live or route new sponsorship payments through unrelated product IDs.

Operational lifecycle: inquiry -> review -> approved/rejected -> expired. Publication requires verified provider identity, contract/terms, payment confirmation from the server-side existing payment system, a clearly labeled Sponsored placement, valid placement dates and an audit trail. The pure module `lib/ai-discovery/sponsorship-ops.mjs` is only a policy gate, not an admin API or a payment processor.

No client-supplied `paid=true` or URL query parameter may authorize placement. Verify gateway webhook signatures and idempotent order settlement server-side; record currency, amount, tax/refund policy and order-to-placement mapping before enabling paid inventory. Editorial ranking remains separate and cannot be purchased.

AI may prepare listings, validate official sources, generate content and assemble reports. Sensitive operations (refunds, payouts, contracts, access grants and price changes) require authorized review and logged decisions. Store customer contact and payment identifiers only in protected storage; never commit them to the repository.

Release gate: test desktop/mobile checkout, success/failure/refund, repeated webhooks, no-payment/no-placement, RLS and audit logging. Existing CI failures are unresolved; do not merge or deploy.
