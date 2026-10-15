# Tool runtime recovery and ten-round audit — 2026-10-15

中文摘要：已复现并修复 OCR 停在 0% 的失败机制，覆盖相关五个 OCR 工作台；SASI 免费对话增加停止等待、超时和重试反馈。10 轮共 40 项脚本检查通过。广泛浏览器回归为 1,510 通过 / 8 失败；八项均有明确归因及通过的复测，失败记录保留。最终构建后的 42 项专项测试、两项音频语言复测全部通过。本轮未调用付费生成、充值或真实支付；付费成片和小程序真机效果仍未认证。

Baseline: `de97a2283d38890082f08e487d0e84189118a07a` (the October 14 release). Evidence is in `_local/handoff/tool-runtime-20261015/`. Times in user-facing explanations are China Standard Time. This review reads the supplied OCR screenshot, repository history and the October 14 audit/release records; it does not claim access to the complete text of another Codex chat.

## Reproduced failure and repairs

The production OCR on both `.com` and `.cn` recognized an actual English PNG under the available network. This alone did not reproduce the owner's network conditions. A separate browser run blocked the language-data request on the existing production build: after 45 seconds, the UI remained at `Recognizing… · 0%`, with no result or recovery message. The browser recorded the failed jsDelivr language request and an unhandled fetch error. Evidence: `baseline-reproduction.json` and the baseline screenshot. This reproduces the failure mechanism, not proof of the owner's exact failed request.

The installed Tesseract 7.0.0 API swallowed initialization-chain rejection, and its caller received no worker reference until initialization finished. Ordinary `try/finally` in the workbench therefore could neither report that language failure nor terminate the initializing worker. Five workbenches separately used the same default CDN path; editing the unused shared `ocrImage` helper alone would not repair them.

Changes:

- **Same-origin OCR:** build preparation copies the pinned worker/core and ten recognition language packs (nine interface languages plus traditional Chinese) to `/media/ocr-7.0.0-v1/`. CPU-compatible LSTM, SIMD and relaxed-SIMD variants remain selectable by the engine. The browser fetches the selected variant and languages, not every pack. Generated assets are about 35.8 MiB in total and are excluded from Git, regenerated during builds, and covered by SHA-256/size manifests and attribution/license files.
- **Bounded worker ownership:** a documented pnpm patch propagates initialization failures and adds `abortSignal` to Tesseract's application API. Abort/native-worker failure rejects pending jobs, terminates the native worker and removes the listener. Late worker messages after termination are ignored. The shared wrapper sets 90-second initialization and 120-second per-recognition limits. The hosted recognition worker/core and OCR algorithm remain the upstream distributions.
- **All direct Tesseract consumers:** image OCR, PDF OCR, multilingual handwriting, image translation and PDF-to-Word now use that wrapper. Image OCR has cancel/retry, separate loading/recognition status, nine-language recovery messages, empty-text feedback, preserved successful batch results and cleared stale results on file changes. Portuguese and Arabic recognition choices are included. PDF OCR cancellation aborts its OCR worker rather than only setting a next-page flag. PDF-to-Word starts OCR only when an editable page actually lacks sufficient text; visual-only/text-layer conversions avoid an unnecessary OCR download.
- **SASI free response recovery:** the free conversation request has a 30-second response-header deadline, a 190-second overall request cap and a visible “Stop waiting” control. Shared SSE decoding bounds idle reads to 75 seconds and the stream to 180 seconds, cancels failed/stopped readers, and returns after a terminal event even if the transport remains open. Incomplete streamed text is cleared and not committed as a completed answer. The question remains available for retry. Stopping the browser wait does not claim to cancel a durable task already executing on the server.
- **Verification repairs:** two pre-existing PDF test TypeScript overload errors were corrected while retaining decoded-content assertions. Isolated callback tests now provide the new controller/worker dependencies; transport VM tests provide real timers. Failure tests remain enabled. The real OCR/manifest check is included in the production source gate.

OCR runs in the user's browser; this release does not install a server model, GPU service or new background inference process on the 2 GB ECS. The recognition method's existing limitations for handwriting, low resolution and complex layout remain relevant.

Visual QA also found the OCR catalog's `mode` incorrectly described its existing browser execution as online processing. The catalog is corrected to `local`, so processing/privacy copy agrees with the actual execution path. That metadata correction is checked in the final rebuild and focused browser cohort; the earlier broad run's exact scope is recorded separately.

## Ten review/verification rounds

Reproduced with the existing ten-topic runner `node scripts/audit/ten-round-audit-v85.mjs`, whose current final report is copied to `ten-round-report.json` in this run's evidence directory. These are ten distinct audit topics, not ten complete production executions of every possible tool input.

| Round | Scope | Script checks | Final result |
|---|---|---:|---|
| 1 | 121-tool inventory, numeric editing, identifiers | 3 | PASS |
| 2 | Text, structured data, XML, bounded regex workers | 4 | PASS |
| 3 | Images, resize/resource bounds, downloadable ZIP integrity | 3 | PASS |
| 4 | Office/EPUB structure, archive expansion and converter limits | 3 | PASS |
| 5 | Remote media fetching, range/completion and archived media integrity | 4 | PASS |
| 6 | Private file/token completion and engine filesystem boundaries | 4 | PASS |
| 7 | SASI response transport, provider streams, routing and delivery | 4 | PASS |
| 8 | Resumable episodes, reference claims and video delivery validity | 4 | PASS |
| 9 | Mailbox quota, money/refund lifecycle and both Mini Program profiles | 6 | PASS |
| 10 | Engine licenses, patched dependencies and release/test contracts | 5 | PASS |

First pass: 39 passed and one transport test failed because the VM fixture lacked timers used by the new implementation. After correcting that fixture and adding timeout/terminal-event behavior assertions, all 40 passed on the second complete run. Failed-pass logs are retained; they are not represented as a clean first run.

Additional real-engine check: `node scripts/test-ocr-runtime-v87.cjs` verifies asset hashes, ten language packs, missing-language rejection, pre-abort, initialization abort and actual English PNG recognition. It passed. Source gate, baseline gate and Playwright import/dependency contract passed. Production build passed with 1,305 generated pages; existing lint warnings remain recorded in `build.log`.

## Browser and release evidence

The broad desktop/mobile regression completed **1,518 cases: 1,510 PASS / 8 FAIL** in 39.6 minutes (`browser-results.json`, compact `broad-summary.json`). Six failures used the run's original OCR selectors and matched the hidden route announcer on desktop/mobile; their corrected six-case rerun passed. Two other failures occurred before language hydration / textarea availability, and both retained traces recorded browser `net::ERR_NO_BUFFER_SPACE`: desktop audio-transcription English UI and mobile SASI incomplete-stream recovery. Both passed in independent fresh-browser retests, without raising timeouts. No first-run failure is silently reclassified as an original PASS.

The run covers public routes, nine-language interfaces, numeric controls, actual file-output readback, paid-flow adapters isolated by mocks, SASI continuity and worker/stream failure scenarios. Route/render coverage is kept separate from actual output/semantic checks. Recognition-language loading with an English sentinel does not certify arbitrary handwriting or every script's recognition accuracy. The final metadata/privacy and PDF empty/loading-state changes received a new final-build targeted cohort rather than being misrepresented as part of an entirely repeated clean broad run.

Final exact-source production rebuild passed, again generating **1,305 pages** (`build-final.log`). Then **42/42** desktop/mobile OCR/SASI cases passed in 1.6 minutes (`final-focused-results.json`): ten language combinations and actual TXT readback, missing resources, cancellation/timeout/native-worker cleanup, real scanned-PDF OCR, nine-language local/privacy disclosure, failed PDF loading/retry, blank-page rejection, non-SIMD fallback, and SASI wait/retry/incomplete-response handling. The desktop/mobile audio-transcription English UI retest passed **2/2** (`audio-language-retest.json`). Real Node OCR, SSE transport and paid failure/delivery-boundary checks also passed again after the final changes. No supplier or payment adapter was enabled for those tests.

Early new-feature desktop cohort: 14/17 passed; the remaining three assertions also selected Next.js's hidden route announcer, while the actual tool error/cancel messages were present. Scope was corrected to `main`; all six corresponding desktop/mobile recovery cases passed in `ocr-recovery-retest.json`. These checks verify native-worker termination, retained input, button recovery and a successful retry. All ten recognition-language combinations, downloaded text, scanned-PDF first-page OCR and the three SASI wait/retry/incomplete-output tests passed in the original focused cohort.

Additional compatibility run: both desktop/mobile cases passed after a test-only capability-probe override selected the shipped non-SIMD LSTM core and it recognized real image text (`non-simd-results.json`). This verifies the fallback asset and branch; emulated mobile Chrome is not an actual Safari/WeChat-device certification. Final scoped changes also clear a failed PDF OCR loading message and restore its free first-page retry; they receive a new final-build check.

One broad mobile SASI case timed out before its textarea existed. Its retained trace recorded browser `net::ERR_NO_BUFFER_SPACE`, with an unhydrated static shell and no generation request. The exact case passed in a fresh browser in 13 seconds (`sasi-mobile-buffer-retest.json`) with no product change or raised timeout. It remains a separately recorded environment failure/retest, not an erased first-pass success.

PDF OCR additionally rejects a wholly empty recognition result rather than exporting only page headers as a completed result. Blank pages can remain alongside nonempty pages in a multi-page result. Paid processing propagates this error through the existing failure/delivery boundary; the callback rejection regression passes without a payment. The final focused cohort exercises an actual blank free page as well as the missing-language recovery UI.

Baseline production availability: both domains' 121 public tool routes returned HTTP 200. The public HTTP/title/canonical checker passed **260/260** checks, including nine localized hubs per domain (`production-before-canonical/live-http.json`). A first, separately retained raw-language probe found that all 16 non-Chinese static hub responses initially declare `html lang="zh-CN"` (and Arabic initially `ltr`). The existing head bootstrap changes those attributes before the body is read by a JavaScript browser; canonical URLs are localized. Browser language/direction tests and raw static declarations are different contracts. This release retains that existing rendering design and does not claim static HTML locale declarations were repaired.

Release receipt: `_local/handoff/tool-runtime-20261015/release-final.json` is the authoritative post-push record of source SHA, Vercel commit status and both domains' live HTTP/assets/actual OCR checks. It must match this source commit before deployment is reported as successful. This avoids embedding a self-referential commit hash or claiming a release based only on a local build.

The first release attempt (`0d109f76`) failed clean-install CI/resource preparation because the script resolved the transitive `tesseract.js-core` package from the project root, where pnpm's isolated install does not expose it. The local existing dependency tree had masked that assumption. Resource preparation now resolves core through `createRequire` anchored to Tesseract's own package. The generated asset bytes/hashes are unchanged; the hosted application/recognition implementation is unchanged by this packaging follow-up. The failed attempt is retained, and release success still requires the follow-up commit's remote status and live checks.

Clean CI subsequently passed the real OCR check and exposed two pre-existing V86 baseline tests that called `git show bc4a7f5f` despite CI's depth-one checkout. Calendar/contact and Cron historical function declarations are now stored as exact, SHA-256-verified fixtures with original commit/file/source hashes. Existing historical-bug reproduction and current-behavior assertions remain enabled; neither full Git history nor skipped baseline checks are required. This follow-up changes test portability, not application behavior.

## Mini Programs and server boundary

Both native build profiles compile/package successfully with the source unchanged, without copying credentials. Profile isolation, sharing, search-index source configuration, bounded public GET recovery and website/account handoff checks passed. Main AppID: `wxbf4ae90406e7e26b`; temporary-mail AppID: `wx3330b29f4613a08e`. The previous release recorded main version 5.5 and temporary-mail version 2.0; this audit has not freshly inspected their authenticated WeChat release pages or claimed a new native publication. Website changes are delivered through the deployed web-view content.

ECS read-only SSH attempt to the previously documented host was closed by port 22, so live ECS memory, converter availability and Nginx configuration were not certified. No server configuration was changed. Production hosting inspection via the Vercel connector returned scope 403; CLI fallback also failed with a saved-credential encoding error. GitHub's existing Vercel commit-status integration is available and verified for the baseline commit; release will use the repository's existing authorized Git deployment path and then check both real domains.

## Primary-source comparison and applied advantages

| Source inspected | Useful pattern and this release's application |
|---|---|
| [Tesseract 7 local installation](https://github.com/naptha/tesseract.js/blob/v7.0.0/docs/local-installation.md), [trained-data source](https://github.com/naptha/tessdata) | Explicit worker/core/language paths, matching engine versions and locally hosted data. Applied directly using pinned upstream packages, source links and license notices. No arbitrary website source scraping. |
| [Squoosh source/readme](https://github.com/GoogleChromeLabs/squoosh/blob/dev/README.md) | Browser-local image work. Retained local processing and added real downloaded-result checks instead of introducing server inference. No Squoosh source copied. |
| [CyberChef source](https://github.com/gchq/CyberChef) | Browser-local input transformations and independently checkable results. Revalidated text/structured-data/regex behavior and actual round trips. No CyberChef source copied. |
| [Stirling PDF OCR languages](https://docs.stirlingpdf.com/Configuration/Operations/OCR/), [process limits](https://docs.stirlingpdf.com/Configuration/Operations/Process-Limits/) | Language availability must follow installed data; work must have resource/time bounds. Packaged the displayed OCR language choices and bounded worker operations. Did not deploy another server conversion stack to the small ECS. |
| [FFmpeg.wasm usage](https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/apps/website/docs/getting-started/usage.md) | Explicit engine resources and actual media-output validation. Existing media resource/delivery checks are rerun; no claim of a new GPU/video generation service. |
| [PDF.js Webpack example](https://github.com/mozilla/pdf.js/blob/master/examples/webpack/README.md) | Ship the worker with the application and use an explicit worker path. Existing local PDF.js loading is retained; new scanned-PDF OCR exercises actual rendering plus recognition. |

This is a bounded comparison of relevant primary sources, not a claim to have surveyed every high-quality platform globally or reproduced their entire feature sets.

## Financial and acceptance limits

Read-only production database check (October 15, CST): the last 72 hours contained 60 `drama.plan` jobs in terminal `succeeded` state. Their corresponding `drama.episode` run payloads distinguish **56 `needs-connection`** from **4 `ready`**. A terminal job is not proof of a usable storyboard or video. The October 14 UTC provider ledger recorded 52 successful Cloudflare text responses and zero wire-level failures; the experience ledger had 24 used units and zero reserved units at its last update. These are existing aggregate records, not generation tests executed by this audit. The generic `needs-connection` outcome does not identify whether capacity, reservation, structured-answer validation or a user connection was the specific cause; that distinction cannot be recovered from these aggregate fields. No prompt, answer, user identifier, key or financial record was fetched or changed.

No model/video purchase, account recharge, real payment/refund transaction or paid supplier-quality run is authorized or performed by this audit. Payment/provider fixtures verify behavior without charging. The existing free script/PNG/ZIP/animatic preview remains a layout artifact, not a claim of an AI-generated finished film. A live authenticated model answer and a delivered paid short film require separate provider-capacity/account evidence and are not inferred from mocked routes.

The public inventory has 121 tools: 48 document, 26 utility, 25 image, 11 video, 7 privacy, 2 audio and 2 AI. The [complete inventory CSV](tool-runtime-20261015-inventory.csv) lists page source, local-processing declaration, declared capabilities and conservative literal test references; named-file matching is not a functional coverage percentage. Their capability registry and browser test matrices are auditable; finite examples do not prove every format, edge case, browser codec, third-party service or native device is fully accepted. Previously documented advisory/configuration findings are not erased by this reliability release.

Fresh production-dependency registry audit (`pnpm audit --prod --json`): 0 high/critical, 1 moderate advisory for `sprintf-js` (GHSA-hp3w-g68c-fv3c), with no patched upstream version. The previously documented local bounds patch remains applied and its compatibility/hostile-format tests pass. The registry finding is retained, not suppressed or presented as withdrawn. This production-only audit does not replace a development-tree or source security review.
