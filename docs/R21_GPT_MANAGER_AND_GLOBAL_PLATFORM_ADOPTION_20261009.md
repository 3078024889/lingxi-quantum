# R21 — Mature platform advantages, verified adoption decisions

## Source distinction
Public patterns below come from provider documentation; current implementation claims are based on inspected LingxiField repository files. References are architecture inputs, **not** claims that those products' proprietary systems were copied or integrated.

| Reference platform/pattern | Verified external strength | Existing LingxiField building block | R21 adoption decision |
|---|---|---|---|
| OpenAI Agents SDK manager/agents-as-tools | Manager owns user conversation and calls specialists without handoff | `components/SasiOneSurface.tsx`, `components/SasiPromptConversation.tsx` | **Adopt interaction principle**: user's prompt stays in chat; creation workspaces only open on explicit action. Don't add Agents SDK dependency. |
| OpenAI Agents SDK guardrails/tracing | Track model, tool, guardrail spans; block unsafe side effects | `lib/sasi/core/stream-events.ts`, existing audit gates | **Future gate**: structured run IDs and measurable errors, no fake tracing indicator. |
| Vercel AI SDK UI protocol | Typed start/delta/end with explicit completion and reconnection | `/api/sasi/experience/text` SSE plus client parser | **Reuse current SSE**, avoid a second streaming framework until versioned compatibility test exists. |
| AWS durable execution patterns / Temporal | At-least-once needs idempotency; external payments need stable keys | `/api/sasi/conversations` idempotent pair write and existing task lifecycle | **Adopt invariant**: never duplicate billable side effects on retry. |
| LangGraph checkpoint design | Recovery checkpoint and cross-session memory are separate | Existing Supabase threads/messages and SASI run store | **Keep existing Supabase**; avoid parallel memory databases. |
| CAI C2PA SDK | Cryptographic provenance, separate from AI inference | `C2paProvenanceCheck.tsx` official Reader | **Already deployed R18, hardened R19**. Keep signer trust, invalid media, and missing manifest distinct. |
| PDF24 / qpdf / OCRmyPDF | Bounded, specialized file operations | Existing PDF tools | **Adopt selectively** subject to license and test; don't introduce universal worker for small browser-local actions. |
| ComfyUI / FFmpeg | Typed media workflows, reusable step outputs | Existing video/frame/analyzer tools | **Future gate**: complete media coverage benchmark before enabling paid truth detection. |

## R21 delivered code
- Immediately display submitted question before model responds, and update the same pending turn during streaming.
- Preserve prompt as a retryable draft if all available provider paths fail.
- Tests cover slow answers and provider failure with deterministic delays to avoid false negatives caused by immediate mocked responses.
- No new model, SDK, service, billing gate, or database table is introduced.

## Release criteria
1. GitHub source/product gates.
2. TypeScript production build.
3. Desktop + mobile Playwright.
4. Vercel preview READY for exact head.
5. Merge only if all pass and production deployment SHA is verified.

## Remaining nonclaims
- LLM output quality comparable to ChatGPT is **not** established by an optimistic chat UI.
- Paid image/video/audio true-origin classification and free-usage quota enforcement remain separately disabled by quality gates.
- This R21 does not claim completion of long-task resumability, full screenplay/video generation, or platform search placement.

## Official reading
- https://openai.github.io/openai-agents-js/guides/agents/
- https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol
- https://docs.aws.amazon.com/durable-execution/patterns/best-practices/idempotency/
- https://opensource.contentauthenticity.org/docs/c2pa-js/
