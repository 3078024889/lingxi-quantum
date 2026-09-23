# SASI Production Reconciliation — V11.30

V11.30 is a production-preparation stage, not a new cognitive stage.

## Confirmed production facts at inspection time

Production currently contains the original SASI foundation/kernel/BYOK schema.

The later cognitive/self-evolution migration chain is not present in production migration history.

Production currently contains:

```text
sasi_projects
sasi_jobs
ai_wallets
ai_requests
```

The core AI billing RPCs are SECURITY DEFINER but are not executable by authenticated users:

```text
reserve_ai_funds
settle_ai_funds
release_ai_funds
ai_wallet_snapshot
```

`create_sasi_project(...)` differs:

```text
SECURITY DEFINER
authenticated EXECUTE = true
```

This package does not revoke that grant because its intended client workflow must be verified first.

## Operator console upgrade

The existing `/sasi/operator` page is upgraded from a simple table-existence view into a production health/evidence console.

It reports:

```text
cognitive schema readiness
reasoner configuration
AI billing table readiness
runtime learning evidence
user feedback
external work
candidate competitions
promotions
rollbacks
critical table counts
```

Missing cognitive tables are shown as unavailable instead of being treated as empty.

## Migration reconciliation

The local migration preflight verifies the intended cognitive order:

```text
V10.23 general intelligence seed
V10.24 ingestion / teacher mesh
V10.40 learning runtime
V10.50 self evolution
V10.60 model-authored code
V10.80 user-triggered control
V10.90 measured benchmark
V11.00 promotion / rollback
V11.10 runtime learning
```

It does not execute SQL.

## Why production application is still separate

Applying the entire chain is a production schema mutation.

Before that action, each local migration should be read against the real current schema and dependency order.

V11.30 therefore prepares the system and makes production state visible, but preserves the explicit boundary between:

```text
code complete
and
production schema applied
```
