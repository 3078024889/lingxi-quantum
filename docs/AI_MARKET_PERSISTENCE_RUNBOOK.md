# Internal AI market persistence runbook

This batch adds a **local filesystem persistence adapter**, not a production database. Configure AI_MARKET_STORE_DIR to an access-controlled, durable mounted volume; ephemeral CI runners are not durable.

1. `node scripts/ai-openrouter-snapshot.mjs`
2. `node scripts/ai-market-ingest.mjs reports/ai-market/openrouter-YYYY-MM-DD.json`
3. `node scripts/ai-market-store-export.mjs`
4. Review `$AI_MARKET_STORE_DIR/history.json` internally.

One snapshot per UTC date; conflicting same-date files fail closed and require review. Identical snapshots are idempotent. Raw records and exports remain internal pending source licensing and redistribution review. This adapter does not expose public API routes, does not modify existing database tables, and does not configure a persistent volume or scheduled ingestion. A production store must add transactional concurrency, backup, retention, access control and monitoring.
