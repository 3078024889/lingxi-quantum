# LINGXIFIELD production completion register — 2026-11-03

This is a **remaining-work register**, not a declaration of production success. Its assertions refer to source and CI evidence on PR #136. Do not copy `RUN_REQUIRED` placeholders into public claims of readiness.

## Baseline: 124 tool catalog contracts

| Evidence class | Tool count | What this actually proves | Still required |
|---|---:|---|---|
| Real fixture group | 30 | Committed fixture inputs and selected deterministic paths | Cross-browser upload → processing → downloadable real bytes → independent reopen/validate; corrupt input, repeated use, mobile gestures |
| Local contract | 78 | Source-side/local contracts and code-path expectations | Real runtime input/output across desktop/mobile and nine locales |
| Online contract | 16 | Isolated external service contracts; CI mocks are not billable API proof | Controlled sandbox provider request/response, timeout, retry/idempotency, cancellation, quote/grant/ledger/reconciliation, downloadable output |

The 16 online-contract tool IDs, per `lib/tools/platform/fixture-matrix.json`, are: batch-image-watermark-remover, burn-after-read, document-translate, food-calorie, id-photo-ai, image-translator, image-watermark-remover, ocr, pdf-ocr, subtitle-translate, temp-mail, url-to-video, video-dubbing, video-transcription, video-translate and video-watermark-remover.

No claim that all 124 tools have passed end-to-end real use is justified by the fixture-count inventory.

## P0: Must pass before merging this PDF release

1. **PDF edit and signature:** upload existing vector PDF and scanned PDF; original text double-click edit; underlying content must truly change when claiming native edit; original image delete/replace must not mutate unrelated shared resources; drag, touch resize and rotate text/images/stamp/signature; save/reopen; no misleading "deleted" label for visual whiteout. Verify signed/encrypted/rotated/multilingual PDFs fail closed when unsupported.
2. **PDF export:** independent PDF.js reopen and page-count verification, fallback without object streams, real browser download, second independent pdf-lib parse, upload-back; check 2+ pages, page selection, broken input, file names and mobile download handoff.
3. **OCR:** invoke pinned Tesseract.js 7 worker on real raster-only PDF with `text+blocks`, verify positioned words and geometry, cancellation, worker termination, nine locale data bundles, zero/poor OCR empty states.
4. **SIAI:** 62-row published source provenance gate, nine languages including RTL, fixed header + dual synced scroll rails on desktop/mobile, 16+ fields, vendor claim/submit forms, same-origin CSRF rejection, no exposed admin capability and no source-code links masquerading as official URLs.
5. **P0 mobile:** run dedicated mobile Chrome smoke in parallel with full CI; full mobile closure remains a separate mandatory step in production-gate. Do not infer mobile success from desktop success.

## P1: Required for full-platform completion, not proved by PDF CI

- **SASI chat**: multi-turn state, tool-call execution, quote/ledger, interrupted-stream recovery and error replay with actual provider response.
- **SASI short drama**: storyboard → video/audio generation → retries → coherent frame/audio streams → real downloadable decode; record provider-specific pricing and rights.
- **Video/image/audio**: process real MP4/WebM/PNG/HEIC/SRT/VTT; resize/trim/rotate/transcribe/translate/remove watermark/noise; inspect output mime, metadata, duration, decodeability, audio-video sync, EXIF deletion, mobile transfer.
- **Global SI AI directory**: canonical 9-language SEO metadata and brand on terms/policies; price, free quota, payment, commercial rights, API costs and vendor data with published citations; multilingual payment/footer review.
- **PayPal/Alipay/WeChat**: independently verified sandbox webhook signatures, replay protection, grant/quote idempotency, cancelled payments, refunds and receipts; real-money transactions only within authorized provider test process; reconciliation is not demonstrated by mocks.
- **Database and accounts**: schema/migration+RLS verification, secret scoping, OTP/MFA deletion verification, CSP report-only vs enforced policy, proxy trust boundaries, vendor ownership.
- **124 tools**: each must have a traceable evidence row: slug, fixture hash, successful and corrupt input, output binary hash and independent reopen, desktop/mobile/9-language result, external API receipt or clear offline-only status, dated CI run and triage owner.

## Global implementation reference — license and compatibility gate

| Project | Verified role / applicability | Usage decision |
|---|---|---|
| Folio `owenpkent/folio` MIT | Page-content Tj/TJ editing, Form-XObject clone, original image-Do transforms, PDF.js reopen verification | Review selected modules, port with attribution and targeted tests; do not claim complex rotated/CJK/signed PDF support |
| `mozilla/pdf.js` Apache-2.0 | Independent PDF renderer and output reader | Already installed; preferred in-browser validation |
| `naptha/tesseract.js` Apache-2.0 | Page raster OCR with position blocks | Already installed and pinned; test timeouts/worker teardown |
| `bensitu/image-editor` MIT + Fabric.js MIT | Image history, masks, precise drag/resize | Consider feature-level React integration; avoid blanket dependency |
| `pdfcpu/pdfcpu` Apache-2.0 | Go-side structure validation, inspection and document merging | Optional isolated server build, not a browser drop-in |
| `Vanilagy/mediabunny` MPL-2.0 | WebCodecs-based media reading/mux | Evaluate narrow file/codec matrix and MPL notice before deployment |
| `qpdf/qpdf` Apache-2.0 | PDF structure repair | Already vendored via qpdf-run; retain wrapper and upstream license notices |
| MuPDF.js / Scribe.js | AGPL/commercial | Not a default proprietary SaaS dependency; commercial-license/legal review required |
| `QrCommunication/gigapdf-lib` | PolyForm Noncommercial | Exclude from production commercial integration |
| FFmpeg wasm core | GPL-2.0-or-later currently recorded in `scripts/prepare-media-runtime.cjs` | Review actual codec flags, source notices and distribution compliance before changing bundles |

License facts should be checked at the exact commit/release before including third-party code.

## Release sequence — independent evidence

1. Finish PR #136 changes in a **draft** branch; preserve `main` and existing production while any required test is red.
2. Run source/security/brand and exact Next.js build; run real desktop 124-tool release scope; run mobile 124-tool release scope, not just PDF smoke.
3. Verify browser PDF OCR, native-text behavior, negative cases, signatures/stamps, actual export download/reopen and all cross-platform data retention.
4. Verify payment/AI-provider environments with no production funds and ensure ledger/recovery reports agree; verify DB RLS migrations and no plaintext secrets.
5. Inspect approved **preview** and official domains; stage a **production** build without assigning domains; test it, then promote only if every production-required gate is green and reviewed.
6. After promotion: verify domains, locale-specific paths, vendor signup, content security, logs, rollback recovery and receipt reconciliation. Store exact deployment ID, git SHA, smoke traces and release notes.

**Current blockers are not cleared by this document.** Do not assert "all tools real-tested" or "deployed" until there is evidence, and do not use a simulated payment as evidence of a real financial transaction.

## 2026-11-03 P0 native PDF text engine integration (development branch)

- Pinned original `owenpkent/folio` MIT commit `8e0a9f86a0957436e47cadb6f6475b2a0aecfd0c`, selectively imported the text content-stream tokenizer, edit mutation and types under `lib/tools/pdf-native`, retaining the license notice.
- Original PDF.js text baseline coordinates are matched to at most one editable `Tj/TJ/'/"` run. On export, the safe run is removed and replacement visual text is rendered on top; output is independently reopened by PDF.js and page count verified.
- Scanned pages continue to use Tesseract OCR + visual overlays. Rotated pages, signed files, ambiguous matches or unsafe content-stream states are refused for native mode; no silent whiteout fallback.
- Removing a painting operator from reachable content **does not prove secure redaction**: old revisions, shared/unreachable objects, image pixels or metadata can remain. Never market this as confidential-data deletion.
- Evidence: `tests/tool-closure/pdf-native-text.test.mjs` checks parser, actual native stream removal, signature denial and fail-closed cases; `tests/final-closure/pdf-native-export-reopen.spec.ts` uses a real PDF, mock payment grant, actual download, pdf-lib reopen, and PDF.js text-layer absence after reupload.
- Full regression status must be recorded from CI, never inferred from source edits.


## 2026-11-03 · Original PDF embedded-image editing UI integration

The original-image engine from MIT-licensed Folio (pinned `8e0a9f86a0957436e47cadb6f6475b2a0aecfd0c`) now has a direct image hit target on supported, unsigned, unrotated pages. Users can click, drag and resize the original image; replace with validated PNG/JPEG or delete it. The UI uses a local pixel crop solely for WYSIWYG preview. Export modifies original `Do` drawing operators, does **not** draw a duplicate overlay, and independently reopens output with PDF.js.

Native images in Form XObjects, signed and rotated pages, ambiguous targets or unsupported transforms are rejected rather than rasterized; the native-image rotation handle is intentionally disabled. Removing an image's `Do` operator does not remove hidden/unreferenced image byte streams and is not secure redaction.

Evidence: 5/5 native image unit tests plus production build passed #41641565253. New real browser tests `tests/final-closure/pdf-native-image-ui.spec.ts` verify original image deletion/replacement, downloadable PDF, re-import and unaffected second-page content. The new UI release remains gated on desktop/mobile CI and must not be merged until green.


## 2026-11-03 OCR hit-area conflict diagnosed and corrected

Desktop full gate #41645522546: 921 passed, 4 skipped and 1 failed; desktop focused #41647191893: 10 passed, 1 skipped and 1 failed. The same failure was Tesseract OCR generated text hit target obscured by a later DOM image hit target covering the scanned page; Playwright reported the original-image selection button intercepted double-click. Source OCR positioned text uses z-index above original-image selection, and a 15-second browser regression now explicitly verifies the scanned source image coexists with the OCR text and can be edited. Do not call this resolved until independent desktop CI proves it.

Cropping security: Native image and text editing are rejected on nonzero MediaBox origins, cropped pages and rotations. This includes an export-time preflight, blocking restored drafts that bypassed UI selection. Direct unit tests assert unsupported cropped-page mutation; both current original PDF operator variants remain fail-closed. The independent native-image crop guard #41646895144 passed 7 tests and a Next.js production build before release integration.
