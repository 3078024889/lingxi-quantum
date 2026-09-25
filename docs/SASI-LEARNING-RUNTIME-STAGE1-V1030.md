# SASI Learning Runtime Stage I — V10.30

## Scope

V10.30 closes the first complete learning-runtime stage.

It integrates:

```text
source
→ teacher extraction
→ structured JSON parse
→ candidate
→ critic review
→ evidence gate
→ knowledge draft
→ semantic-memory consolidation
→ privacy scope
```

It also provides a real Volcano Ark teacher adapter without auto-registering or auto-calling it.

## External teacher principle

SASI remains the system identity.

External models are teachers/tools:

```text
Doubao / Ark
GPT / OpenAI
Grok / xAI
Claude / Anthropic
Gemini / Google
Qwen / Alibaba
local / custom
```

V10.30 implements the first real adapter for Ark because the project already has Ark text infrastructure.

## Cost control

The installer performs only a deterministic mock-teacher dry-run.

Expected:

```text
networkCalls: 0
providerSpend: 0
```

The Ark adapter has:

- no automatic retry
- bounded timeout
- bounded max output tokens
- structured JSON response mode
- no secret logging

Real provider use requires an explicit server-side registration and a configured model/endpoint.

## Knowledge integrity

Even after a teacher extracts and a critic supports a candidate, V10.30 creates only:

```text
model-derived-hypothesis
```

It does not jump directly to verified fact.

Promotion remains governed by the evidence rules from V10.23/V10.24.

## Privacy

Private user knowledge is owner-scoped.

Cross-user private reads are denied by the runtime scope guard.

Private user materials are not eligible for global curated promotion without an explicit, separate human-approved process; personal data blocks global promotion.

## Self-evolution relationship

Knowledge learning and code self-evolution are still separate gates:

```text
knowledge learning
→ semantic/procedural/self memory

code evolution
→ failure
→ hypothesis
→ proposal
→ isolated worktree
→ tests
→ benchmark
→ human merge approval
```

A newly learned fact does not automatically rewrite production code.

## Completion criteria

V10.30 Stage I is complete when:

- TypeScript passes
- deterministic teacher pipeline passes
- evidence gate passes
- semantic consolidation passes
- cross-user private scope is denied
- no provider network call occurs during installation
- no provider spend occurs during installation
