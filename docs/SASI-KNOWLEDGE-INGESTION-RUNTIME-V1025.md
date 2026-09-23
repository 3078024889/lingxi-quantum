# SASI Knowledge Ingestion Runtime — V10.25

V10.25 moves the V10.24 contracts into an executable local runtime.

It still does not automatically spend provider money.

## Runtime path

```text
source text
→ normalize + SHA-256
→ extraction output contract
→ Knowledge Candidate
→ candidate validation
→ Teacher Review inputs
→ evidence gate
→ candidate-ready / needs-evidence / reject
→ active-learning closure state
```

## Why extraction remains adapter-driven

The runtime does not hardwire one model.

Extraction can later come from:

```text
Doubao
GPT
Grok
Claude
Gemini
Qwen
local model
deterministic extractor
human correction
```

All of them must produce the same `SasiExtractionOutput`.

## Teacher adapter registry

V10.25 introduces a provider-neutral runtime registry.

No network adapter is registered by default.

That means simply installing V10.25 cannot create an API bill.

Provider adapters must be explicitly connected from BYOK or a separately enabled hosted policy.

## Budget guard

Teacher calls receive hard budgets:

```text
max calls
max input tokens
max output tokens
max cost
```

This is the prerequisite for later multi-teacher learning without uncontrolled spend.

## Active-learning closure

A queued unknown is closed only when the ingestion decision becomes `candidate-ready`.

`needs-evidence` remains researching.

Rejected material is deferred rather than silently disappearing.

## Next

V10.26 can connect the first real teacher adapter to the already configured reasoning provider, behind:

```text
explicit provider selection
explicit budget
dry-run mode
no secret logging
structured extraction
structured teacher review
```

It should not enable all providers at once.
