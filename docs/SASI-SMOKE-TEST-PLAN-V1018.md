# SASI V10.18 — Real Provider Smoke-Test Plan

V10.18 is deliberately **no-spend**.

It does not call any external video-generation API and does not create an order or job.

Its only purpose is to inspect the local production configuration and determine the cheapest valid real-provider test route from:

- verified providers
- configured provider credentials (presence only; secrets are never printed)
- configured model
- current `SASI_VIDEO_RATES_JSON`
- application-level minimum duration
- rate expiry
- provider asset-host requirements
- content-labeling prerequisites
- reconciliation prerequisites

The following production flags remain unchanged:

```text
SASI_BILLING_ENABLED
SASI_JOBS_ENABLED
SASI_REFUND_FLOW_TESTED
SASI_USAGE_SETTLEMENT_TESTED
```

After V10.18 identifies the cheapest verified route, V10.18.1 can run exactly one controlled end-to-end provider test with explicit user approval before any real external cost is incurred.
