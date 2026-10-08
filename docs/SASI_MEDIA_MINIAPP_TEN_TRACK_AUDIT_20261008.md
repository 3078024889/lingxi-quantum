# SASI / AI media / WeChat mini program — 2026-10-08 evidence-led audit

Scope: code-level inspection of main at 8b451341, screenshots supplied by owner, publicly documented integration patterns. The ten review tracks below are **not** ten completed production test cycles. Do not equate code inspection with end-user success.

1. **Conversation entry:** `SasiUnifiedLauncher` infers mode from text; `SasiOneSurface` switches distinct components. Fix in this PR: natural-language requests enter chat instead of forced workspace jump.
2. **Intent dispatch:** `SasiPromptConversation` previously auto-called onTask for inferred drama/website. Fix in this PR: remove automatic redirect in chat.
3. **Conversation context:** the chat client previously passed only 4 recent turns as a concatenated string. Fix in this PR: up to 12 turns as bounded typed user/assistant roles to `/api/sasi/experience/text`.
4. **Server prompt boundaries:** route now ignores browser-supplied system roles and places validated history between internal system instructions and current user input. Candidate in PR #15: authenticated server-side thread read/append against existing Supabase conversation tables, parent-linked messages and per-user ownership checks. Still requires account-level E2E and account deletion UX.
5. **Answer presentation:** `SasiAssistantText` printed Markdown markers literally. Fix in this PR: safe common headings, bold, code spans and lists, no HTML execution. Future: audited full Markdown renderer.
6. **Latency/streaming:** `free-text-router` uses `stream:false`, up to five sequential provider attempts and 18s timeout per attempt. Future: streaming transport, cancellation, first-token metric, circuit breaker and provider health.
7. **Free experience & generation:** free text uses `reserveExperience/settleExperience` with an in-process soft fallback during database failures; this is insufficient as a fail-closed quota for expensive media generation. Image/video generation is separately routed through task engine. Do not claim free finished images/videos without provider capacity, quota, idempotency and rollback evidence.
8. **C2PA:** no c2pa-web/node dependency or image/video credential verifier exists in the inspected production tool path. AI-classification output is not cryptographic provenance. Evaluate @contentauth/c2pa-web and @contentauth/c2pa-node; retain verified/invalid/absent/unsupported distinctions.
9. **Mini program indexing:** `miniapp/app.json` points to `sitemap.json`; sitemap allows homepage/tools and four discovery pages. Screenshot shows search allowed, yet WeChat does not display it. Next: confirm actual released appid/version/name/category, page indexing and crawler logs in WeChat admin. Sitemap merely permits indexing, not guaranteed ranking or appearance.
10. **Release & commerce:** independent GitHub Production Gate/desktop/mobile, Vercel preview and production SHA required. AI media fees remain disabled-quality-gate; never charge based only on model smoke results.

External implementation references:
- https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence
- https://github.com/vercel/ai/blob/main/content/docs/04-ai-sdk-ui/02-chatbot.mdx
- https://opensource.contentauthenticity.org/docs/c2pa-js/
- https://opensource.contentauthenticity.org/docs/sdk-repos/c2pa-js/packages/c2pa-web/

Go/no-go: PR #15 may merge only after its actual CI and preview are green. Streaming, C2PA validation, AI media benchmarking, mini-program search visibility and account-facing conversation history management are **not** implemented by this PR. Candidate database persistence still requires production validation.
