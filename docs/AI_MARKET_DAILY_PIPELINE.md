# Daily AI model metadata pipeline (review-only)

The isolated GitHub Actions workflow now chains:
1. Fetch and validate the public OpenRouter model catalog.
2. Ingest into an isolated append-only store on the job runner.
3. Export a chronological history structure.
4. Generate a validated snapshot manifest.
5. Upload snapshots and internal store as review artifacts with 14-day retention.

This is an **integration exercise**, not durable cross-run persistence: each runner starts empty, so each scheduled run produces a one-day history. No public charts or historical claims should use it as a multi-day database.

Production requirements: durable storage with backup/restore; an ingestion service with access control and idempotency; per-provider redistribution rights review; history freshness monitoring; operational alerting; and staging browser tests before merge. Do not store API secrets in artifacts or publish unreviewed third-party data.
