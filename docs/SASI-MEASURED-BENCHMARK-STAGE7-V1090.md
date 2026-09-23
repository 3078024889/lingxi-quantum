# SASI Measured Benchmark & Candidate Competition — V10.90

V10.90 turns SASI self-improvement from "a candidate passed" into "a candidate measurably outperformed the current baseline without breaking safety gates."

## Evaluation dimensions

Stage VII measures:

```text
correctness
quality
stability
latency
cost
sample count
regressions
```

Quality is not allowed to hide regressions.

Low cost is not allowed to compensate for correctness falling below a hard floor.

## Two layers: gates + score

First, every candidate must pass hard gates.

Example:

```text
minimum correctness
minimum quality
minimum stability
minimum sample count
zero or bounded regressions
latency ceiling
cost ceiling
sandbox
development
sealed
regression
```

Only after the hard gates does weighted scoring matter.

This prevents a fast/cheap but wrong candidate from winning on averages.

## Baseline comparison

A candidate does not qualify merely because its score is positive.

It must beat the current baseline by:

```text
minimum absolute improvement
AND
minimum relative improvement
```

If nothing improves enough:

```text
keep-baseline
```

This is an important anti-churn rule.

## Sealed benchmark guard

Sealed benchmarks now have explicit:

```text
fixture hash
case count
version
```

If the fixture changes, the sealed result is rejected.

## Benchmark runtime

Stage VII adds an executable benchmark harness.

A suite contains cases and an executor/judge pair.

The runtime records:

```text
per-case pass/fail
correctness
quality
latency
cost
error
aggregate pass rate
aggregate stability
regressions
suite hash
```

The harness is provider-neutral.

## Promotion bridge

A measured candidate still does not auto-merge.

The chain is now:

```text
candidate competition
→ candidate-qualified
→ existing promotion gate
→ sandbox
→ development
→ sealed
→ regression
→ human approval
→ HEAD freshness
→ promote
```

## Persistence

Stage VII introduces durable records for:

```text
benchmark suites
candidate evaluations
candidate competitions
```

Authenticated users do not receive direct write access to evaluation state.

## Installation

The installer runs a deterministic zero-cost competition:

- one baseline
- one strong candidate
- one regression candidate

The regression candidate has intentionally excellent quality metrics but one regression. It must lose before scoring.

Expected provider calls and spend:

```text
0 / 0
```
