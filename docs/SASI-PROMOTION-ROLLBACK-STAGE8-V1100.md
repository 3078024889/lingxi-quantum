# SASI Promotion / Rollback Lineage — V11.00

Stage VIII closes the post-promotion safety loop.

## Path

```text
candidate qualified
→ human-approved promotion
→ promotion snapshot
→ canary / stable observation
→ post-promotion health
→ keep / observe / prepare rollback
→ human approval
→ rollback plan
```

## Why this exists

Passing a benchmark is not proof that every real-world workload will stay healthy.

Stage VIII therefore records production-like observations after promotion:

```text
correctness
quality
stability
latency
cost
error rate
sample count
```

## Sample floor

A rollback cannot be prepared from a tiny sample.

Before `minSamples` is reached:

```text
observe
```

not:

```text
rollback
```

## Rollback lineage

Every promotion snapshot records the previous stable snapshot.

This creates an explicit lineage:

```text
stable A
→ canary B
→ stable B
→ canary C
```

The lineage validator rejects missing ancestors and cycles.

## Rollback safety

Rollback is prepared against a known stable snapshot.

It requires:

```text
from snapshot
to stable snapshot
from HEAD
to HEAD
reason codes
human approval
```

V11.00 does NOT implement an autonomous production rollback command.

It prepares evidence and a rollback plan.

Execution remains a separately approved operational action.

## Remaining stages after V11.00

The core cognitive/self-evolution kernel is close to complete.

The remaining work is primarily integration and productionization:

1. persist/apply the accumulated migrations safely
2. connect real user-facing intelligence entry points to the control plane
3. connect Book SASI ingestion to the knowledge runtime
4. connect evaluation evidence to an operator/admin review surface
5. production acceptance, secret scan, migration audit, regression suite
6. commit/deploy/live acceptance and backup cleanup

Optional later expansion:

- additional teacher providers
- SASI student model / distillation
- broader autonomous research under explicit budgets
