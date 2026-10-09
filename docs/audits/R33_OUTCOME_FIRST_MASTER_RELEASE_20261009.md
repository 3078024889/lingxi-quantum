# LINGXIFIELD R33 — outcome-first master package and tomorrow's release gates

This is an engineering document only. Never show these internal labels, statuses, model names, quota ledger details, or architecture terms on the user-facing pages.

## Goal

Finish each user task, not just expose a button. The food-calorie experience is the internal reference for an end-to-end journey: input → correction → trustworthy calculated result → follow-up → saved/recoverable work. Adapt this pattern by category; do not clone the calorie architecture onto every tool.

## Reviewed mature products and source patterns

| Reference | Confirmed pattern | LINGXIFIELD adaptation |
| --- | --- | --- |
| [Sejda Sign PDF](https://www.sejda.com/sign-pdf) | Type, draw, upload, camera; transparent image variants; page placement/resize | Transparent original photo cleanup, separate visual signer from certificate-backed signing, add the easiest suitable signature entry modes |
| [PDF24 Sign PDF](https://tools.pdf24.org/en/sign-pdf) | Draw, upload, camera, place, save | Short user journey without technical language; do not imply PDF24's operating cost is zero |
| [PDF.js](https://github.com/mozilla/pdf.js) | User-visible signature editor and image upload errors | Browser-native editing affordances, accessible controls, local preview |
| [pdf-lib](https://github.com/Hopding/pdf-lib) | PDF image embedding, placement and save APIs | Keep current PDF engine and verify PNG alpha after embedding instead of switching engines |
| [Photopea Magic Cut](https://www.photopea.com/tuts/magic-cut-remove-image-background-online/) | Mark foreground/background using adjustable brush with immediate preview | For severe shadow/complex photo failures introduce guided keep/erase selection, only after measuring current implementation |
| [Squoosh](https://github.com/GoogleChromeLabs/squoosh) | Local codecs and before/after comparison | Local image conversions with real file decode checks, artifact size and visual quality metrics |
| [IOPaint](https://github.com/Sanster/IOPaint) | High-quality image fill using AI and a selected region | Distinguish true background reconstruction from simple crop/blur. GPU models may NOT fit 2GB server/zero-cost constraint |
| [OCRmyPDF](https://github.com/ocrmypdf/OCRmyPDF) | Deskew, optional background removal, searchable text layer and validation | Accurate scanned PDF recovery with opt-in cleaning and independent output validation; do not run heavy native pipeline without capacity |
| [Camelot](https://github.com/camelot-dev/camelot) | Ruled/unruled tables, structure extraction, per-table quality metrics | PDF-to-Excel should preserve cell grid and reveal uncertainty instead of claiming page-to-image conversion is table extraction |
| [Tesseract.js](https://github.com/naptha/tesseract.js) | Browser/Node OCR, reusable worker lifecycle | OCR local path where practical; worker reuse and language-pack readiness |
| [Vercel AI SDK](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams) | Durable message/active-stream linkage, replay/resume with explicit storage | Current SASI should use existing Supabase tables; true stream resume requires durable stream storage and cannot be assumed zero-cost |

Review source licenses independently before copying any implementation. This plan adapts verified behavior and interfaces, not unlicensed snippets.

## First product-quality focus: handwritten PDF signing

Current R28: background-normalized ink extraction, gray-paper processing, ink threshold adjustment, transparent image preview, PDF placement and export, save transparent PNG. R33: manual touch/mouse eraser, undo and immediate update of both PDF overlay and transparent PNG data.

Remaining acceptance before claiming 'beautiful signature extraction':
- Dark pencil on gray, textured and shadowed paper, thin ballpoint pen, black/blue ink, scanned PNG, smartphone JPEG including sideways/uneven illumination.
- Identify false negatives (broken pen strokes), false positives (paper texture, borders) and preserve natural stroke hue; compare outputs with human approved transparent alpha masks.
- Add guided foreground/background painting if automatic extraction still fails on sample set.
- Verify hand-erased details in a **downloaded** PDF, not only in React preview; inspect final alpha channel and signature placement after save.
- Confirm touch drag, high DPI display, undo, upload errors, same-page and multi-page editing; validate signed PDF in a second viewer.
- Visual signature is NOT a PKI digital signature; do not claim certificate trust or legal enforceability.

## 118 tools product-review standard

The generator `scripts/audit/tool-outcome-contracts.mjs` emits an individually identified outcome contract for every current public slug based on actual registry and fixture mappings. It intentionally marks product-quality and untested capabilities as `TO_AUDIT`, and distinguishes reusable reference implementation patterns from confirmed LINGXIFIELD functionality.

Release checks for each individual tool:
1. Real user input, including messy/out-of-spec inputs.
2. Correct task output, with editable preview/repair where needed.
3. File download and independent open/decoding checks.
4. Visual quality and preservation constraints (not just MIME/size).
5. Mobile usability, keyboard accessibility and recoverability.
6. Honest free/paid disclosures, no unjustified charge, no false success.
7. Nine-language user-facing words where visible.

## Prioritization by outcome value

P0: PDF signatures, PDF table extraction, PDF page changes and actual redaction, scan/OCR, image cutout and repair, video watermark removal and short drama export — because visible defects directly fail the user's job.
P1: compression to precise output size, conversions, subtitles/transcriptions with timecodes, ID photos, PDF forms, temp-mail reliability and expiry.
P2: deterministic developer and text utilities that already produce correct verified outputs. Do not replace working tools simply to increase code footprint.

## Zero incremental hosting: constraints

- Reuse existing browser canvas, PDF engine, storage, available tools and model providers.
- Heavy AI inpainting, local FFmpeg/Whisper or large OCR language models may be CPU/RAM intensive; do not promise they run free on a 2GB server without performance measurement.
- Review production limits and signed-user sessions before changing charge/allowance semantics; there is no evidence that 'unlimited GPT-like free chat' is affordable or technically guaranteed.
- Prefer precise local editing to premature server inference. Keep paid features disabled until model availability, real quality and refund semantics are proved.

## SASI release bundle components

R27 merged: persisted chat history selection. R32 open: avoid out-of-order history/save response overwriting user-selected conversation. Next: durable stream state, server-authoritative quota API, weekly separate grant rules, chat quality evaluation and authenticated cross-device sessions. Do not merge isolated ad hoc state stores.

## Staging manifest, not a claim of deployment

- R28 merged: ink extraction; **Vercel production has not been confirmed on R28 SHA**.
- R29 merged: 118x2 URL smoke; not proof of tool functionality.
- R30 PR #30: actual PNG/JPG and PDF output regression, CI success observed on head before master review.
- R31 PR #31: natural-language errors; CI had 2 failing new tests and needs correction before merge.
- R32 PR #32: SASI history safety; CI success observed on head before master review.
- R33 PR #33: hand eraser and all-tool quality contract; **pending production test and manual real-photo verification**.
- No merge, main push or Vercel deployment of R33 until user-agreed tomorrow release window and all relevant gates pass. A GitHub PR branch is not a released website.

## Evidence policy

Never claim all 118 tools have been functionally tested from 236 URL checks; never equate a color badge or SDK install with a successful real output. Each claim must name test sample, expected artifact and observed result. Label all intended features not yet implemented.


## 2026-10-10 continuation audit: source gate, Vercel and mature-code extraction

The latest PR head was inspected before any further feature expansion.

Observed release blockers:
- GitHub Production Gate failed in `scripts/test-site-facts.cjs` because a historical hard-coded free-tool count still expected 97 while the catalog now truthfully exposes 98 after `pdf-to-xlsx` became a real free local tool.
- The R36 inpainting regression itself contained two test-authoring defects: a literal escaped newline embedded in TypeScript and a reference to an undefined `original` variable. This meant the intended non-mutation invariant was not actually testable.
- Vercel currently reports failure with a build-rate-limit target URL. This is independent from the GitHub source-gate failure and must not be misreported as a product-code regression.

Fix strategy:
- Replace the brittle historical free-count assertion with a stronger invariant: all nine locales must expose the same execution/billing classification for every tool. Explicitly lock `pdf-to-xlsx` as `free-local`.
- Repair the image inpainting regression so it checks the real purity contract: output may change only selected pixels while the source buffer remains byte-for-byte unchanged.
- Keep production deployment blocked until GitHub source gate, build, desktop/mobile browser checks and Vercel capacity all pass.

Fresh mature-source findings applied to the roadmap:
- Squoosh feature-tests encoders before exposing them and keeps codec/edit state separate. LINGXIFIELD should expose only capabilities that are actually supported in the current browser instead of presenting dead format options.
- PDF.js transfers TypedArrays to workers to reduce main-thread memory pressure and supports worker/offscreen rendering fallbacks. Large PDF/image work should follow the same capability-detection pattern rather than forcing one execution lane.
- Tesseract.js treats an empty OCR page as a valid result, not an exception, and supports structured outputs such as blocks/TSV plus reusable workers. OCR-to-table must distinguish “recognition succeeded but no table exists” from runtime failure.
- IOPaint separates mask semantics from model selection and can switch high-quality inpainting backends. LINGXIFIELD should preserve the same boundary: precise mask editing is always available locally; heavy model reconstruction is a separate capability and must never be disguised as the lightweight local diffusion fallback.
- Camelot's stream/table logic reinforces the current rule: repeated spatial alignment and table structure are evidence; ordinary prose must never be converted into a fake spreadsheet.

Next P0 convergence after the gate is green:
1. Make every image/PDF capability browser-feature-tested and hide unsupported output options automatically.
2. Add structured OCR table-confidence evidence and explicit empty-page/no-table states.
3. Add image-repair quality tiers without changing the truth label of the local fallback.
4. Continue artifact-level acceptance for PDF compression target size, PDF redaction, ID-photo print sheets, video transcription/subtitles and watermark workflows.
5. Route every successful artifact back into the unified SASI result workspace for continuation/recovery instead of leaving tools as isolated endpoints.
