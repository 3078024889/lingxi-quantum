# SASI Learning Runtime Stage II — V10.40

Stage II adds durable learning lineage and closes the feedback path from outcomes back into SASI's self-model and memories.

## New closed loop

```text
Teacher learning cycle
→ learning run trace
→ knowledge draft
→ episodic memory
→ model observations
→ self capability feedback
→ procedural-memory promotion gate
```

## What SASI learns about itself

Capabilities are not declared from branding or provider reputation.

They are updated from measured observations:

```text
benchmark
+ score
+ sample count
→ weighted self capability
→ strengths / weaknesses
```

A capability is only considered a strength or weakness after enough samples.

## Model routing evidence

Model capability profiles can now be informed by actual observations instead of static assumptions.

Observations include:

```text
provider
model
capability
score
success
latency
token usage
cost
benchmark
time
```

## Memory feedback

Stage II adds concrete records for:

- episodic memory: what happened
- procedural memory: what method repeatedly works

A procedure is not promoted after one lucky success.

Initial gate:

```text
successRate >= 0.75
sampleSize >= 3
regressionCount == 0
```

## Persistence

A server-only repository writes durable runtime state through Supabase service-role access.

No browser/client write path is introduced for global learning state.

## Safety boundary

Knowledge learning still cannot directly rewrite production code.

Code evolution remains:

```text
failure
→ hypothesis
→ proposal
→ isolated worktree
→ test
→ benchmark
→ human approval
```

Stage II records the evidence that future code-evolution proposals can use.

## Provider spend

The installer performs no real provider calls.
