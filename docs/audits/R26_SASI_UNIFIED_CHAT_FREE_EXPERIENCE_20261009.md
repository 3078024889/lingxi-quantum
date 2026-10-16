# R26 SASI unified conversation & free-experience audit — 2026-10-09

Audit basis: `main` at `6200e4fff2023a9e15fc3d92722ec5250121a4f2`. This is a source-based audit, not a claim that all production behaviors have been reproduced.

## Product invariant

All visible UX copy must describe user actions and actual results in natural language in nine locales. Engineering terms, routing states, provider details, quota ledger keys and diagnostic labels belong in internal logs only. Do not silently charge users or claim an asset exists when it does not.

## Verified source findings (priority order)

**P0 — Quota truth and durability.** `lib/sasi/experience/daily-budget.ts` reserves against `reserve_sasi_experience_v90` at a default 180 units/day, with an in-process `Map` fallback on DB failure. In a multi-instance/serverless deployment this fallback is not globally consistent or durable. `lib/sasi/experience/resilient-text.ts` reserves 8 chat units, 18 knowledge, 28 research, 36 website and 32 drama before attempting a provider, then settles success/failure. Do not describe this as unlimited chatting or a verified weekly allowance. Before changing reset schedules, reconcile with separately approved weekly allowances for the book/learning product, and version the migration carefully. Require an authoritative balance API with atomic reserve/settle/refund, idempotent request reference IDs, timezone/reset semantics and no cross-instance soft balances. On ledger outage provide an honest recovery state; do not silently mint locally spendable allowance.

**P0 — Persistent conversation not fully unified.** `components/SasiUnifiedConversationProvider.tsx` stores turns only in React state, while `components/SasiPromptConversation.tsx` independently loads/saves turns to `/api/sasi/conversations`. `components/SasiOneSurface.tsx` switches modes with different mounted components. The server history GET currently loads the newest thread only (`app/api/sasi/conversations/route.ts`), even though it lists 20 thread headers. User should be able to select and resume an older thread, preserve draft & pending state, and continue after switching mode or reloading. Keep one server-authoritative message timeline with stable thread/turn IDs; never treat in-memory state as the only record.

**P1 — Continuity/context budget.** The browser sends the last 12 user/assistant pairs in `SasiPromptConversation.tsx`; the server accepts at most 24 role messages in `app/api/sasi/experience/text/route.ts`. Old decisions/preferences can disappear once they fall outside this sliding window. Introduce scoped, inspectable conversation summaries linked to a thread and project, preserve direct user constraints, and construct context from recent turns + relevant durable memory, bounded by token budget. Treat summaries as fallible, never invent past instructions.

**P1 — Response durability & recovery.** `/api/sasi/experience/text` streams delta/reset/done, but `SasiPromptConversation.tsx` stores the turn only after a successful complete response; interrupted or reloaded streams have no demonstrated resumption. Use a durable run ID, storage for partial/completed generation and explicit resume behavior. The Vercel AI SDK message persistence/resume guides and LangGraph checkpointers are reference patterns, not drop-in authorization to copy code. Preserve history access control, idempotency and finality.

**P1 — Free experience clarity.** Guest users get `local-only` from `/api/sasi/experience/text`, and `SasiPromptConversation` can separately try browser-local, user-resource, free-experience and BYOK quote pathways. Audit what the UI says in all nine languages when local answer, provider success, provider unavailable, exhaustion, sign-in required, and external charging consent occurs. Show truthful included use, remaining amount, refresh date and next action; separate conversation entitlement from premium media/tool entitlements.

**P1 — Backend provider readiness.** `lib/sasi/experience/free-provider-config.ts` defines global (OpenRouter, Groq, Cerebras, NVIDIA, Gemini, Mistral, Fireworks, Cloudflare) and China (Zhipu, Volcengine, Aliyun) sources that require explicit enabled flags and credentials. Merely having these adapters does not prove a configured provider is live. `free-text-router.ts` has cooldown/fallback/affinity; require nonsecret production health probes per region and quality tests before claiming GPT-like intelligence.

**P2 — Presentation.** Replace internal statuses with concise user-language notices only; nine-language parity. Provide an understandable, consistent free-use indicator and an honest unavailable state; do not show engineering jargon or unsupported accuracy claims.

## External implementation principles (study and adapt, no blind copying)

- https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence — durable per-chat message IDs and loading.
- https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams — resumed streaming requires state storage and active-stream linkage; assess compatibility with existing abort semantics.
- https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph — state, checkpoint boundaries, resumability and human review.
- https://docs.langchain.com/oss/javascript/deepagents/overview — context compaction and cross-thread memory; require scoped retrieval and provenance.
- https://help.openai.com/en/articles/9275245-using-chatgpt-s-free-tier-faq — distinguish everyday conversation access from separately constrained advanced features; do not present competitor limits as SASI entitlements.

## Staged implementation / release gates

1. Record the current quota DB schema, `reserve_sasi_experience_v90`/settle semantics and all users' current grant types. Write concurrency/fault-injection tests (two workers, DB unavailable, retry, settlement failure, reset boundary).
2. Implement authoritative quota `GET`, a truthful nine-language balance/reset state and a shared, tested entitlement policy. Backfill/migrate only after explicit terms approval; preserve separately granted weekly extras.
3. Consolidate chat history around durable thread IDs, thread switching, per-turn idempotency, history retrieval and recoverable pending answers.
4. Upgrade context assembly and quality eval set: 20-turn reference recall, repeated corrections, mode switch, interruption/retry, real research with citations, no empty placeholder, no unapproved charges.
5. Production Gate, desktop/mobile, authenticated user flow, 9 locale screenshots, dual-domain smoke, Vercel SHA match. Merge only proven changes. Keep legacy modules until import/traffic/audit proves deletion safe.

## Confidence/status
Verified by reading current GitHub source: modules and control-flow above. Not yet proven: production API keys/providers, actual DB RPC migrations and entitlement policy, historical conversations on live accounts, usage balance correctness, cross-device resume, runtime model quality and global failover. This audit alone makes no changes to runtime functionality.
