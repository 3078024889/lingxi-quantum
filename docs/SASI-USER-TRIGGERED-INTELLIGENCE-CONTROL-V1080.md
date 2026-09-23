# SASI User-Triggered Intelligence Control Plane — V10.80

V10.80 implements the product decision:

> Real external-model calls happen because a user intentionally invokes a feature, not because SASI silently spends provider credits in the background.

## Paid-call trigger rule

Allowed paid-call triggers:

```text
user-action
operator-approved
```

Denied in the normal runtime:

```text
background
system-test
```

For product-facing hosted intelligence, V10.80 uses `user-action`.

A user-trigger requires:

```text
authenticated user id
interactive request
request id
intent policy
existing billed-text reserve/settle/release path
```

## Billing integration

V10.80 reuses the existing `runBilledText` path.

That means platform-hosted text intelligence uses:

```text
reserve_ai_funds
→ provider call
→ settle_ai_funds

or on failure:

release_ai_funds
```

This is preferable to bypassing the existing AI wallet.

## Intent policies

The first controlled intents are:

```text
knowledge-answer
teacher-extract
teacher-review
code-author
director-reasoning
```

Each intent declares:

```text
task kind
intelligence tier
maximum prompt size
maximum provider calls
whether user balance is required
```

Current provider-call maximum is one per user action.

## Code author

The Stage IV/V code-authoring system can now use the user-funded billing bridge.

The provider result still has to pass:

```text
structured output parse
declared target gate
evolvable-zone gate
risk assessment
detached sandbox
benchmarks
human approval
```

A successful paid model response does not mean a successful code promotion.

## Background self-evolution

SASI may still autonomously:

```text
detect failure
attribute cause
form hypothesis
prepare pending external work
```

But when an external paid model is needed:

```text
pending-user-trigger
```

is created instead of silently making the call.

The user's next relevant interaction can execute it.

## Model configuration

V10.80 also centralizes Ark/Doubao reasoning model resolution.

Priority:

```text
SASI_ARK_TEACHER_MODEL
SASI_REASONER_PRIMARY_MODEL
AI_HIGH_MODEL
AI_DEFAULT_MODEL
fallback
```

API-key compatibility:

```text
ARK_API_KEY
or
VOLCENGINE_ARK_API_KEY
```

This reduces environment-variable drift between SASI reasoning subsystems.

## Important scope note

V10.80 does not expose a public API that lets arbitrary users edit the application's repository.

The code-author bridge is a server-side primitive.

Product UX must decide which operator/developer workflows may create code-author tasks.

Normal end users trigger product intelligence, not repository mutation authority.
