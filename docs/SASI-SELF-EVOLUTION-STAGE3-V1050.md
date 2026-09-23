# SASI Self-Evolution Stage III — V10.50

V10.50 closes the first full cognitive self-evolution decision loop.

## Closed loop

```text
episode failure
→ failure attribution
→ improvement hypothesis
→ strategy mutation
→ awaiting sandbox
→ development benchmark
→ sealed benchmark
→ regression benchmark
→ human approval
→ promote / reject / stale
```

## Important distinction

V10.50 gives SASI a complete **decision loop for self-improvement**.

It does not remove the existing code-sandbox boundary.

Strategy evolution can happen without editing code.

When a hypothesis requires code change, the existing code-proposal + isolated worktree mechanism remains mandatory.

## Failure attribution

A failure is no longer just an error string.

It records:

```text
category
observation
likely causes
cause confidence
evidence
affected capabilities
severity
reproducibility
```

## Falsifiable hypotheses

Every improvement hypothesis contains falsification criteria.

That means SASI does not merely say:

```text
"this change should make me better"
```

It must define what result would prove the hypothesis wrong.

## Strategy mutation

Stage III can create child Strategy Genomes.

The initial deterministic mutation supports:

```text
retrieval-weight changes
reasoning-stage changes
reflection-depth changes
```

Weights are normalized before evaluation.

## Benchmark discipline

Three evaluation classes stay separate:

```text
development
sealed
regression
```

Fixture hashes are checked to reduce accidental benchmark drift.

## Promotion

A candidate cannot promote unless:

```text
sandbox passed
development passed
sealed passed
regression passed with no regressions
human approved
tested HEAD == current HEAD
```

A changed repository HEAD makes the result stale.

## Why human approval remains

SASI now has increasingly capable self-evolution machinery.

However, production code merge authority is still intentionally separate.

This preserves the principle:

```text
autonomous learning ≠ unrestricted production mutation
```

## Next stage

The next major stage can connect model-authored code proposals to this cycle:

```text
failure
→ hypothesis
→ strategy improvement fails to solve it
→ code intervention requested
→ model generates patch proposal
→ V10.22.1 isolated worktree
→ tests / benchmarks
→ reviewable commit candidate
```
