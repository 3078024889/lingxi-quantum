# LINGXIFIELD V130 — PDF / SASI / commercial product review

Date: 2026-11-02. Candidate: PR #111, dependent on #106 → #105 → #104. This is an implementation review, **not** a claim of production acceptance.

## Grounded source findings

1. **PDF editor**: `components/tools/PdfEditorWorkbench.tsx` contains `onDoubleClick` handlers for original-text edit/replacement and for replacing original images, plus selectable user-added objects, signatures and images. The source-text replacement uses a white cover/mask; that **does not erase the old PDF text/content stream**. It is suitable as visual correction, **not secure redaction**. Keep actual redaction as a distinct workflow with output-reopen/content-extraction tests.
2. **SASI Ask**: `app/api/sasi/ask/route.ts` calls `runSasiAsk`. `lib/sasi/ask/run-ask.ts` always returns `buildDeterministicAskAnswer(...)` and `generation:"deterministic"`, even when a meaningful user question needs creative synthesis. This directly explains why the Ask endpoint can sound like a list of retrieved snippets, not model reasoning. `buildAskMessages` exists but is not invoked in this endpoint.
3. **Model inference infrastructure already exists**: `lib/sasi/experience/resilient-text.ts` supports metered daily experience and connected-model fallback, but calling it from Ask must remain opt-in, authenticated, with provider limits, explicit fallback and zero unexpected charges. Do not silently make the deterministic endpoint a billable LLM call.
4. **SASI drama planning**: `app/api/sasi/drama/plan/route.ts` already calls metered model inference and parses structured shot JSON; `lib/sasi/automatic-video-plan.ts` caps output at 60 shots, 600 seconds, 24 shots per episode. Plan JSON success is **not** full rendered-video success: separate asset persistence, scene continuity, per-shot retries, provider entitlement, real MP4 assembly/export, cancellation and refund handling must be tested.
5. **Video toolkit**: the V130 source repair invalidates old export files when parameters change and blocks parameter edits while processing. Real ffmpeg.wasm generated media and mobile browser validation are separately required.

## Licensed implementation references (review, do not wholesale copy)

- Mozilla PDF.js: https://github.com/mozilla/pdf.js — PDF rendering/text extraction, Apache-2.0; respect bundled subcomponent notices.
- pdf-lib: https://github.com/Hopding/pdf-lib — PDF drawing/annotation and byte roundtrips, MIT. Overlay drawing alone cannot establish genuine source-text erasure.
- Konva Transformer: https://konvajs.org/docs/react/Transformer.html — drag/resize/rotate interaction design, assess implementation/license before integration.
- StoryBored: https://github.com/storybored-app/storybored — scene/shot/take approvals, character identity, persisted workflow, MIT. Do not import its inference engines and weights without checking individual model/commercial licenses.

## Next executable acceptance gates

### PDF
Synthetic searchable vector PDF and scanned PDF; double-click source text, edit/cancel, replace existing image, insert/delete user-added text, handwritten signature; drag and resize each object; save downloaded PDF; reopen in an independent PDF parser and extract text/image + render all pages. Require explicit separate secure-redaction tests (original sensitive bytes must not survive).

### SASI chat
Unit-test routing and quotas: no provider configured, connected provider, provider timeout, insufficient allowance, idempotent retry, user-isolation and no cross-project context leak. Compare deterministic fallback against a user-approved inference path for 30 realistic questions (short chat, story development, revision, memory continuity). Record factual accuracy, task completion, unsupported assertions, token cost and first response latency. No silent paid path.

### SASI drama
At least 3 synthetic scripts (single scene, 6 shots, 3 episodes); require same character traits and props across shots, actual shot outputs, resume from failed shot, total ordered timeline, audio alignment, exported MP4 bytes and decoded frame count. Missing rendering credentials is `NOT_VERIFIED`, not `PASS`.

### Revenue path
Keep simple: free local utilities for search acquisition; paid batch PDF exports and SASI compute credits only when actual cost and entitlement ledger are enforced; B2B featured AI vendors must be explicitly marked sponsored, with verified click reports and non-manipulated organic rankings. The published CNY/USD nominal price policy remains unchanged. Merchant onboarding/PayPal and Alipay/WeChat callbacks, refunds and reconciliation must be production-verified before taking payments. Test conversions from search → tool completion → repeat use → paid conversion, not raw page views alone.

## Release safety
Draft only. Do not change main, production database, domains, paid wallet or live payments. Green CI + deployed SHA + real user flow evidence are independent gates.
