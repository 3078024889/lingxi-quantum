# Verified placement and refund ledger — isolated acceptance

This versioned migration adds a **server-only event provenance table**, a **strict placement entitlement table**, and a **refund event ledger** linked to the original LINGXIFIELD `orders` and approved vendor claims.

The authenticated merchant adapter has **not yet been implemented for Global SIAI products**. Recording an event here is not equivalent to implementing PayPal/Alipay/WeChat signature verification; the actual live webhook adapter must verify cryptographic signatures, account merchant ID, amount, currency, paid order ID, timestamp and replay before writing into the service-only tables.

A verified settlement event references a linked, paid `ai-market:sponsored|category|brand` main-site order and immutable promotion request. Only after all validations can an entitlement become `active`; no anonymous write, no user-controlled payment success, no direct SASI top-up conversion. Duplicate provider events and cross-user placements fail. The entitlement is effective only in `starts_at <= now < ends_at` and when its associated claim remains approved.

Any verified refund, including a partial refund, revokes placement immediately in the same PostgreSQL transaction. Revoking the vendor claim also revokes active placements. The 366-day maximum window is a **safety ceiling, not a commercially promised duration**; the paid plan duration must be defined before merchant activation. The primary ranking calculation never reads this entitlement.

Disposable PostgreSQL tests create an order and a simulated provider-verified evidence record to test referential integrity. This is **not a real provider transaction or webhook**. Production deployment and payment remain blocked.
