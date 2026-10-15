# OCR / shared tool execution context — 2026-10-15

This is a source-context record, not a vulnerability report. Snapshot: files read before any repair in this audit. No paid service was called. No runtime behavior is claimed. No applicable root or ancestor `AGENTS.md` was found by repository file search; matches under archived `skills/devoured-*` do not govern these source paths.

## Reachability and boundaries

| Entry | Processing chain | Result / recovery boundary |
|---|---|---|
| `app/tools/ocr/page.tsx:5` | `OcrWorkbench` → `run` (`components/tools/OcrWorkbench.tsx:32`) → dynamic Tesseract import (36) → `createWorker` (37) → sequential `recognize` (41) | text state set only after whole batch (44); catch sets generic localized file error (45); finally awaits terminate then clears busy (46) |
| `app/tools/pdf-ocr/page.tsx:3` | `PdfOcrWorkbench.run` (`components/tools/PdfOcrWorkbench.tsx:53`) → `createWorker` (58) → `openPdf` (59) → page render (64) → PNG (66) → recognize (67) | text published after all pages (72); optional Excel conversion (75); paid failures rethrow (85); finally terminates worker / destroys PDF / clears busy (86–87) |
| `app/tools/handwriting-ocr/page.tsx:6` | `HandwritingOcrWorkbench.run` (`components/tools/HandwritingOcrWorkbench.tsx:135`) → English: Transformers import / remote model (146–155), line segmentation (158), pipeline per line (168); multilingual: Tesseract (187–209) | whole output state after batch (215); catch exposes thrown message and rethrows (217–220); finally clears busy (221–222) |
| Shared file tool UI | `ToolWorkbench` dispatcher (`components/tools/ToolWorkbench.tsx:30–47`) → `FileToolWorkbench.run` (104) → `runFileTool` (240) → slug-specific helper | generic error result (117–124); finally busy false (126–128). This runner does not wrap the dedicated OCR workbenches. |
| PDF→Excel OCR continuation | `ToolWorkbench.tsx:231–232` creates handoff and navigates → `PdfOcrWorkbench.tsx:36–45` consumes it → OCR block tokens → Excel (67–81) | one-shot browser handoff; failed table conversion leaves text and explanatory note (79–81) |

Other direct Tesseract consumers: `components/tools/PdfToWordWorkbench.tsx:24`, `components/tools/ImageTranslatorWorkbench.tsx:34–36`, and `lib/tools/shared/ocr.ts:1`. A search of `components/tools` and `lib/tools` found the shared `ocrImage` declaration but no callers. Do not assume fixing that helper changes the workbenches.

## Worker and resource loading

The installed Tesseract source reports version 7.0.0 (`node_modules/tesseract.js/package.json:3`); its browser mapping selects `src/worker/browser/index.js` (`package.json:29–31`). Application imports depend on the bundler honoring that mapping. Build-output verification remains open.

`createWorker` merges defaults and explicit options (`node_modules/tesseract.js/src/createWorker.js:18–29`), spawns a worker (46), and returns `workerRes` (245). Browser default worker URL is jsDelivr (`src/worker/browser/defaultOptions.js:11`). Default Blob worker wraps `importScripts(workerPath)` (`src/worker/browser/spawnWorker.js:10–19`, `src/constants/defaultOptions.js:9`). Core URL defaults to jsDelivr and selects supported WASM variants (`src/worker-script/browser/getCore.js:14–46`). Cache miss downloads language data from jsDelivr (`src/worker-script/index.js:109–144`), then writes the virtual filesystem/cache (176–183).

The main promise initializes load → languages → initialize → resolve (`src/createWorker.js:239–242`). The chain has a swallowing catch (243). The worker message reject path rejects the job promise and explicitly rejects `workerRes` only for `action === 'load'` (209–218); worker `onerror` also rejects `workerRes` (44–47). Whether a language/initialization rejection reaches a browser error event, and therefore settles the returned promise, is an **open runtime question**. This record does not assert the screenshot's cause.

PDF rendering uses a same-origin worker: `lib/tools/pdf-render-client.ts:10–16` sets `/pdfjs/pdf.worker.min.mjs`; `openPdf` reads the entire input into a Uint8Array and returns PDF.js loading promise (19–23). `renderPdfPage` creates a canvas from scaled viewport dimensions and awaits render (25–35). `canvasToBlob` depends on the browser callback settling (38–42). The local worker exists under `public/pdfjs/`; production delivery and matching library version are not verified here.

`next.config.js:3` declares CSP **Report-Only**, with `worker-src 'self' blob:` and `connect-src 'self' https: wss:`. Its presence is not evidence of an enforced block. Live edge/server response headers remain unknown.

## Cross-function invariants and assumptions

- Intake limits are enforced by `FileDropzone.apply` (`components/tools/FileDropzone.tsx:44–60`): file bytes, MIME/extension acceptance, file count, and deduplication. They are not decoded-pixel limits. OCR inputs are untrusted files; decoder support follows Tesseract/browser behavior. Pixel/resource limit establishment in OCR paths: **nothing found**.
- OCR assumes dynamic import, worker startup, core import, cache access, language download, recognition, and termination eventually settle (`OcrWorkbench.tsx:36–46`). An application timeout, abort signal, cancellation, or explicit `errorHandler` in this path: **nothing found**.
- `busy` is cleared only after awaited worker termination (`OcrWorkbench.tsx:46`); no worker reference exists in application state until `createWorker` resolves (37). Cleanup of an internally spawned worker when creation never returns is delegated to Tesseract; application enforcement: **nothing found**.
- PDF OCR's stop flag is checked only at the next page boundary (`PdfOcrWorkbench.tsx:61–62`). Its cancel button sets the flag (107); it does not interrupt current worker creation, PDF parsing, rendering, or recognition. A bounded stop latency: **nothing found**.
- Whole-batch results are committed after processing all inputs (`OcrWorkbench.tsx:44`, `HandwritingOcrWorkbench.tsx:215`); earlier successful items are local arrays until then. Incremental successful-result recovery in these paths: **nothing found**.
- The English handwriting path explicitly enables remote models/browser cache (`HandwritingOcrWorkbench.tsx:147–148`), assumes `Xenova/trocr-small-handwritten` is reachable/compatible (151–155), caps line count at 120 (`segmentLines`, 78), and revokes each line object URL (177). Model load/inference timeout and pipeline disposal: **nothing found**.
- Paid callbacks may perform local OCR and depend on rejected processing reaching the payment wrapper (`PdfOcrWorkbench.tsx:85`, `HandwritingOcrWorkbench.tsx:220`, `PdfToWordWorkbench.tsx:47`, `ImageTranslatorWorkbench.tsx:61`). Payment accounting and compensation are outside this record and remain open.

## Unknowns for the next phase

1. Which precise resource/job generated the screenshot's 0% message? Capture browser request status, console errors, and worker messages with the user's small non-sensitive fixture.
2. Do cold-cache mainland-network browsers resolve all default jsDelivr worker/core/language resources? Is warm-cache behavior different? Source defaults alone cannot answer network availability.
3. Does a failed language load leave `createWorker` pending in the actual bundled browser build? Validate with deterministic request interception before deciding remediation.
4. Do both production domains serve the same code and worker resources? Are stale service-worker/CDN assets involved? Neither domain was fetched in this context task.
5. How do low-memory/mobile browsers behave for high-resolution 30 MB images and 200 MB PDFs? The 2 GB server specification does not establish browser resource capacity.
6. Are existing audit checks browser-executed or source-marker checks? Relevant existing scripts include `scripts/test-paid-processing-failure-v79.cjs:6` (stubbed createWorker failure) and `scripts/audit/v64-global-tool-coverage.mjs:11–12` (source markers); neither snippet establishes real OCR completion.

## Scope limits

Reviewed OCR callers, shared file-runner boundaries, local PDF resource wrapper, installed Tesseract worker/bootstrap source, and intake. Did not audit all registry tools, payment internals, SASI generation, either miniapp, or deployed infrastructure. No code repair, severity judgment, exploit, or paid test was performed by this subtask.
