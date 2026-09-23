# SASI Knowledge Ingestion & Teacher Mesh — V10.24

## Goal

V10.24 connects the general-knowledge kernel to a controlled teacher/source pipeline.

This still does not call external models automatically. It establishes the production contracts that later workers will execute.

## Source mesh

Accepted source families:

```text
user-file
book-sasi
official-web
peer-reviewed
reference
reputable-web
teacher-model
manual
```

Teacher-model output is explicitly non-grounding.

A teacher can suggest, critique, synthesize and request evidence, but teacher agreement alone is not external evidence.

## Teacher mesh

Teacher roles:

```text
extractor
reasoner
critic
fact-checker
domain-expert
synthesizer
```

Profiles can represent:

```text
Doubao
OpenAI
xAI / Grok
Anthropic / Claude
Google / Gemini
Alibaba / Qwen
local models
custom providers
```

Each profile stores:

```text
roles
domains
verified state
BYOK state
reliability
cost weight
latency weight
```

No provider is globally hardcoded as the best.

## Knowledge ingestion path

```text
source
→ source normalization
→ candidate extraction
→ teacher review
→ evidence requests
→ candidate decision
→ V10.23 promotion policy
→ semantic memory
```

## Critical epistemic rule

```text
model agreement ≠ factual verification
```

Multiple teacher models can improve critique quality, but at least one non-model grounding source is required before a candidate can proceed toward factual promotion.

## User files and Book SASI

User-provided documents may ground claims about what the document says.

They do not automatically prove that the document's claims are universally true.

Future ingestion workers should preserve this distinction:

```text
document-content fact:
  "This book states X."

world fact:
  "X is true."
```

The second requires the normal evidence/promotion policy.

## Privacy

V10.24 stores source metadata and hashes in the ingestion model.

It does not introduce automatic cross-user sharing of user-uploaded source content.

## Next

V10.25 can implement actual workers:

```text
Book SASI / user upload / trusted source
→ extractor
→ teacher critics
→ evidence resolver
→ Supabase candidate ledger
→ promotion
→ active-learning closure
```

External calls must use configured BYOK or explicitly enabled hosted provider policy.
