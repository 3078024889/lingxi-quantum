# AI Discovery sponsorship event lifecycle

Pure reducer: `lib/ai-discovery/sponsorship-ledger.mjs`.

An event must originate from an authenticated server-side gateway adapter. The `serverVerified` boolean is only a contract marker and is not itself a security boundary. The adapter must verify gateway signatures and merchant ownership. Persist order state and event IDs with a **unique event ID constraint and transaction/row lock**. In-memory deduplication alone is not safe against concurrent webhook deliveries or server restarts.

Rules: verified settlement permits fulfillment; a refund or dispute revokes fulfillment; repeated events do not double-apply; late settlements never undo refund/dispute. Other states fail closed. Cancellation, partial refunds, chargeback reversals and provider-specific event ordering require additional integration tests before live use.

Verified locally with Node 22: 7 tests passed. No live gateway or database has been connected. Do not deploy until existing CI browser and payment-recovery failures are resolved.
