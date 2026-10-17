# Web acceptance continuation — 2026-10-17

Continue the 2026-10-16 real-file evidence and independent branch; no main push or production promotion. Physical-phone testing is assigned to the user. Keep one reusable Chrome tool tab, close temporary inspectors, retain private originals locally and make no paid provider/payment calls.

## Previous commit receipts

Source `363fa72f`: media run `38908795004` succeeded (native and browser jobs); delivery run `38908795040` succeeded. Full gate `38908794427` built successfully but desktop closure ended at 890 passed, 59 skipped, one failure. These are test cases, not fully accepted tool counts. The failure was real: the newly curated result-summary formatter inadvertently hid ISO/Unix time outputs because its field list did not include them. Restore meaningful time outputs with nine-language labels, retaining timestamp strings exactly rather than converting large integers to floating point. Internal diagnostic keys remain hidden.

## Actual timestamp/date exploration

Production webpage Excel/Sheets mode was used with serials 1, 59, 60, 61, 25569, 40729 and 40729.5. Observed outputs were one day early; for example 25569 produced 1969-12-31 and 40729 produced 2011-07-04. Evidence is saved locally as `时间转换-真实网页基线-20261017.json`.

The component used a 1899-12-30 base and also subtracted the fictitious 1900 leap day, shifting dates twice. Use 1899-12-31 with the post-60 adjustment; keep 1904-01-01 for the 1904 system. Reject serials 60≤x<61 because their day does not exist in the Gregorian calendar. Empty input must be invalid rather than implicitly converted to zero.

An isolated test of the actual component function passed for 1/59/61/25569/40729 and the 1904 example 39267. Browser regressions additionally verify all four Unix units, ISO/RFC visibility, fractional days, both date systems, empty input and the fictitious leap-day interval. Patched full-web verification runs remotely; production still has the old behavior until release acceptance.

Primary references: [Microsoft Excel date systems and examples](https://support.microsoft.com/en-us/excel/date-systems-in-excel), [Microsoft's explanation of the fictitious 1900 leap day](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/wrongly-assumes-1900-is-leap-year). No new date library or third-party code was copied for this correction.

## Real rare-format and metadata operations

Actual production Chrome operations used derivatives of the supplied food photo: a valid 24-bit BMP, a PNG-backed ICO and a JPEG/JFIF. All completed upload → convert → save → independent decode. BMP output was 222×148 and ICO output 128×128; decoded pixels exactly matched their respective inputs. JFIF output was JPEG 222×148, 11,139 bytes; its downloaded picture was visually inspected, retaining the same content (including the existing footer). These are specific format paths, not acceptance of every format option, animated frame or image-quality claim. Export quotas were isolated; no payment or external-app sending was tested.

A JPEG derivative containing known author/copyright EXIF fields was processed through `remove-exif` and saved. Independent inspection found no EXIF, XMP or IPTC block and no author marker bytes; dimensions remained 222×148. Private inputs, outputs and structured evidence remain on the desktop, outside the repository.

A corrupt GIF exposed a real failure-path leak in the shared rare-format converter. The FileDropzone preview legitimately held one object URL, but decoder failure left a second URL active and displayed `IMAGE_DECODE_UNSUPPORTED`. The fallback decoder now revokes its URL before rethrowing. The same actual decoder function was exercised in Chrome with three failed decodes and one valid decode: zero decoder URLs remained. An extracted-function regression fails against the previous commit (one URL remains) and passes against the patch, including successful fallback and bitmap cleanup.

Production also reproduced a stale save button after changing the output format. Format/quality edits now clear the preceding result; controls are disabled during conversion. Errors use nine-language actionable copy and an alert, without raw exception details. New remote browser regressions cover corrupt input, repeated retry, cleanup after removal, recovery with a valid image, saved-file decoding and invalidation after each output-setting change across the five pages sharing this component. Those patched-page checks are pending the new remote run, not already accepted by the isolated decoder result.

Reference: [MDN object URL lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static). No extra image runtime was introduced. A narrow reference scan found the shared converter's unhandled fallback-load rejection; FileDropzone and image-watermark previews already revoke in effect cleanup, and the video-metadata helper has explicit failure cleanup. This is not a whole-repository memory-leak clearance.

The existing `retired-code-cleanup.mjs` audit passed again. No additional modules were deleted without a reference/dependency justification. Vercel authorization remains unresolved; no preview, production deployment, main push or live billing changes occurred.

## Privacy cleaner format mismatch and reuse

Production `privacy-cleaner` was actually used to scan, clean and save a WebP photo derivative. Its downloaded name ended in `.webp`, but independent Sharp decoding identified JPEG bytes. The component duplicated canvas re-encoding, converted every non-PNG input to JPEG, and retained the original filename. This can mislead consumers that infer media type from the extension, including the shared file-delivery helper.

Remove that duplicate image path and reuse `stripImageMetadata`, already used by `remove-exif`. Keep PNG/WebP transparency, flatten JPEG onto white, derive the filename from the actual encoder MIME (including PNG fallback), and release the canvas on export completion/failure. PDF cleaning continues through the existing verified metadata helper. Scan/clean failures now show actionable nine-language copy instead of raw exceptions. This change introduces no new dependency or heavy server runtime.

The patched shared helper ran in real Chrome on a transparent 29×19 WebP. The output was named `.webp`, independently decoded as WebP, retained alpha (89/255), and preserved its dimensions. This is patched-engine evidence, not full patched-page acceptance. New remote UI checks cover PNG/WebP/JPEG/GIF, simulated unsupported-WebP-encoder PNG fallback, author metadata removal, PDF page retention and corrupt-file rejection. Real external-app file delivery still needs separate acceptance.

Production `privacy-cleaner` additionally scanned and saved the real two-page Copernicus copy. Independent PDF loading found two unchanged page boxes, no Info dictionary and no catalog metadata stream. Page-content visual verification from earlier PDF operations remains separate; this specific output has not yet been independently rendered.

## CSV / Excel real round trip

The actual CSV→JSON webpage preserved Chinese text, quoted commas/quotes, an embedded newline, a 16-digit integer as text, leading zeros and empty fields. A row with more values than headers was rejected and its old result removed. This text-only tool provides an output textarea; it was not counted as a downloadable-file operation.

The actual CSV→XLSX webpage accepted a UTF-8 BOM input with those same values. Its downloaded workbook was read independently with ExcelJS; the same values were retained. That saved workbook was then uploaded to the actual XLSX→CSV webpage, exported and read back: quoted fields/newlines, the large integer, leading zeros and trailing empty cells survived. Private inputs/outputs and the structured round-trip report remain on the desktop. This does not establish formula, multi-sheet or every encoding behavior.

## AiFreeForever source check

The discovered [Aifreeforever-2api](https://github.com/lza6/Aifreeforever-2api) repository describes a browser-automation/protocol proxy for the upstream chat site, not the official full source for a 700-tool platform. Its README requires at least 2 GB **available** memory and persistent browser management. It was not installed on the existing 2 GB host or made a provider dependency. The official chat page returned 403 during the repeat fetch; an official full-platform open-source release remains unconfirmed. Existing FFmpeg/PDF.js/Tesseract/canvas implementations remain the integration basis; no unsupported claim of having reviewed every platform or imported their private code is made.

## Actual PDF redaction and search continuation

The actual production redaction page processed the supplied two-page book copy. A real mouse-drag region rendered opaque black, and drawing returned to scroll mode. Quote and payment-status responses were explicitly simulated; two document pages were requested, no payment writes occurred, and the pay button was not clicked. The saved PDF retained both page sizes, no Info dictionary, no page annotations and one rebuilt image per page. Independent Flate/RGB image-stream decoding and visual inspection confirmed the black region; 117,500 interior pixels had RGB minima/maxima of exactly zero. This specific sample passes the opaque rebuilt-page check; it is not all-region/all-page-mode or external-app delivery acceptance.

The production PDF search page found the actual Chinese title on the book's second page and saved a CSV containing page 2 and one match. Despite the scanned cover, the second page has a searchable text layer; do not label the entire input as textless. Changing the keyword then exposed another stale-result bug: old matches and their save button remained visible. Query and case/regex option edits now invalidate results; controls are locked while searching. A separate completed-search flag prevents claiming “no matches” before a search has actually run.

The PDF search implementation also executed arbitrary regular expressions on the UI thread. It now reuses the existing bounded `runRegexSafely` worker, with unmount cancellation and friendly errors. The existing helper enforces input/result bounds and terminates expensive matches. Actual Chrome execution of the patched search function returned the expected plain/case-sensitive counts; a pathological expression timed out in 1,621 ms while 81 main-page heartbeat ticks ran. This is patched-engine evidence. New remote full-page checks cover actual match CSVs, changed inputs/flags, no-match completion, invalid patterns and responsiveness during timeout. No duplicate regex runtime or new dependency was added.

Latest source checks passed for syntax, decoder baseline-versus-patch behavior, whitespace and the existing retired-code audit. Remote native media checks on `653e61d5` passed; its browser delivery checks reached execution after a successful build. Subsequent PDF search changes require their own new remote build and regression run. No latest-head full-site pass or deployment is claimed.

## Actual text exports and filled-form flattening

The supplied two-page book copy completed actual PDF→TXT and PDF→Markdown operations, save/download and independent UTF-8 reading. Both outputs included the Chinese title and second-page marker. These extract the existing text layer; the cover image is not transcribed by this operation and layout preservation is not claimed.

A locally prepared filled PDF form containing a text field, a checked checkbox and a selected dropdown completed actual webpage flattening and saving. Independent PDF.js rendering showed all three filled appearances, with text `AUDIT CUSTOMER PREMIUM` and no interactive annotations reported by that reader. PDF-lib inspection nevertheless found three dangling references in the page's Annots array: the flattened widget objects had been removed but their references remained.

Introduce one shared `flattenPdfForm` helper for the single and batch PDF workbenches. It retains appearances, verifies zero fields and removes only unresolved annotation references. Resolved annotations such as valid links remain. A real-library regression verifies saved/reopened form output, retained appearance text and preserved valid links. The same filled-form input was processed with the patched helper locally, then independently rendered with PDF.js: field text remained, no annotation dictionary remained, and the reader reported zero interactive annotations. Full patched-page single/batch acceptance is pending remote CI; batch output was not manually exercised in this round.

Actual page-number operation also exposed stale output after editing the bottom margin. The common extra-PDF workbench now clears previous outputs on watermark text/size/opacity, page-number margin and crop-margin changes, and locks those controls while processing. Browser regressions cover each change and re-download updated crop dimensions. This does not imply every parameter in every other workbench is already checked.

## Completed remote baseline and new continuation

Source `6ee4ba52`: production gate [38982469665](https://github.com/3078024889/lingxi-quantum/actions/runs/38982469665) succeeded: desktop 911 passed / 59 skipped, mobile-emulation 912 passed / 58 skipped. The dedicated [delivery run](https://github.com/3078024889/lingxi-quantum/actions/runs/38982469799) succeeded with 311 passed / one skipped; [media run](https://github.com/3078024889/lingxi-quantum/actions/runs/38982469549) succeeded with 140 browser checks plus the native job. These are test cases, not accepted-tool totals. Payment/provider isolation and unavailable production services in the test environment remain limitations. These receipts do not cover the newer continuation below.

### Supplied videos: actual web operations and independent saved-file decoding

Real HEVC and H.264 files supplied by the user were operated on through the production website. Files were downloaded, re-read, independently decoded with FFmpeg (`-xerror`, every stream to null), and their boundaries were decoded to real PNGs. The first browser-canvas capture attempt produced transparent images; it was discarded and replaced with independently decoded first/actual-last video frames, checked for opaque nonempty content. No blank capture is treated as a successful visual check.

| Operation | Saved duration (s) | Dimensions | Decoded video frames | Audio streams |
|---|---:|---|---:|---:|
| Rotate 90°, HEVC source | 10.08 | 1280×720 | 241 | 1 |
| Rotate 180°, HEVC source | 10.08 | 720×1280 | 241 | 1 |
| Rotate 270°, supplied H.264 copy | 10.10 | 1080×608 | 241 | 1 |
| Mute, selected 480p | 10.041667 | 270×480 | 241 | 0 |
| Trim 2–5 seconds, 480p | 3.00 | 270×480 | 72 | 1 |
| Speed 2×, 480p | 5.125 | 270×480 | 123 | 1 |
| Speed 0.5×, 480p | 20.151995 | 270×480 | 481 | 1 |
| Convert MP4, 480p | 10.10 | 270×480 | 241 | 1 |
| Extract MP3 | 10.10068 | audio only | — | 1 |

All listed saved files completed independent decoding without detected decode errors. Rotation directions were visually inspected. This verifies these actual inputs/options, not every codec, resolution, long clip or subjective audiovisual-sync condition.

Using the already verified 5.125-second 480p derivative, actual reverse/loop/stop-motion exports also completed:

| Effect | Saved duration (s) | Frames | Audio streams |
|---|---:|---:|---:|
| Reverse | 5.125 | 123 | 1 |
| Loop twice | 10.25 | 246 | 1 |
| Stop-motion, 0.4 s sampling / 12 fps | 5.166667 | 62 | 0 |
| Stop-motion with reverse pass | 10.333333 | 124 | 0 |

Independent first/last-frame comparison supported the intended ordering: reverse first versus source last RGB MAE 2.007, reverse last versus source first 2.688, loop endpoints 1.558/2.677, and back-and-forth first versus last 1.424. Lossy re-encoding is not claimed to be pixel-identical. Timing differences from sampling/frame quantization are recorded rather than hidden. Inputs, outputs, full decode receipts and valid boundary PNGs remain private on the desktop.

Actual video operations exposed retained old downloads after changing rotation/effect settings, and controls remained editable while encoding. All toolkit/effect parameters now invalidate previous results and lock during processing. The toolkit also assigns each run an identity: cancelled work cannot launch a late runtime, overwrite progress/delivery, clear the next run's busy state or terminate its runtime. Component unmount terminates its owned work. Actual callback regressions fail against the previous code and pass against the patch, including cancellation during metadata preparation and a late old-worker failure after a new job starts. Engine scheduling is isolated in these race regressions; they are not extra real-encoding cases. The existing saved-file matrix now checks control locking and result invalidation after each relevant setting change.

Reference: [official ffmpeg.wasm FAQ](https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/apps/website/docs/faq.md) and [progress API limitations](https://ffmpegwasm.netlify.app/docs/api/ffmpeg/classes/ffmpeg/). Progress percentage is not used as export-integrity proof. No additional media library, heavy local build or paid model invocation was introduced.

### Actual batch PDF processing and paid-context fixes

The first browser visit moved to the products page, but direct inspection returned HTTP 200 with the proper workbench, and subsequent browser navigation remained on the correct batch route. This intermittent observation is not classified as a permanently missing tool and still requires broader navigation reproduction.

The production workbench actually processed the two-page book copy and a filled form together: metadata removal, rotation 90°, bilingual watermark, page numbers and flattening. Separate downloads independently reopened with page counts 2 and 1, rotations 90°, no Info dictionary and zero form fields. A fresh run with merge enabled produced one three-page PDF with the same properties. Independent PDF.js rendering of all three pages retained book content and filled form appearances; the Chinese/English watermark and page number were visually inspected. Quote/payment status were simulated throughout; payment writes remained zero. An inconsistent completion badge in a merge run is not accepted as proof of payment-state correctness merely because the file was produced.

Changing watermark opacity after completion left both old files and the completed action in place. Every batch input/option edit now clears output, creates a new draft identity and resets the paid context. Before price/payment preparation, files and exact options are saved through the existing local paid-draft store; storage failure blocks price/payment entry. Explicit resume URLs restore the file set and options. The existing seven-day draft expiry is disclosed in nine-language user copy; no physical-deletion claim is made. Original prices and server billing/database data are unchanged.

The shared paid-action component now ignores asynchronous quote/status/persistence completions belonging to a replaced or unmounted context. A changed draft cannot open the previous draft's payment window, and a late response cannot unlock or overwrite a newer request. Separate baseline-versus-patch tests reproduced old quote, paid-status and delayed-persistence failures; all patched cases pass with mocked network/payment. New full-page tests verify actual local draft storage before quoting, new IDs after edits, restored files/options, failed storage, completion state and stale quote rejection. These newer patched-page checks require the new remote run; real payment is still untested.

### Per-route status and deployment access

[The per-route matrix](./real-web-tool-matrix-20261017.csv) retains the legacy route inventory, marks the retired image-to-PDF alias, and separates actual-file evidence, known defects and remaining checks. It does not infer an accepted-tool total from test counts or from merely having a record.

Vercel connector team listing returned an empty list. A cached CLI/login record was found, but CLI inspection failed; a scoped read-only REST check using that existing login returned 403 `Not authorized` for the intended existing project. No credentials were printed or changed. Reconnection to an authorized project account was requested asynchronously while testing continued. No preview/production deployment, main push, live payment, pricing change or important database mutation occurred.

### Complete book and basic PDF continuation

The complete 966-page book was uploaded locally to the production metadata tool, processed and saved. Independent reopening retained 966 pages, found no trailer Info and no Metadata reference/stream; the output was 4,121,323 bytes. The original author property was removed. Author names printed on the cover are page content and remain intentionally. This is structural verification, not visual acceptance of all 966 pages or a guarantee that attachments, annotations or embedded-image EXIF are anonymized.

Actual basic merge saved three pages from the two-page book sample plus a filled form. Extraction with `2,1` saved two pages; visual ordering remains pending. Editing the range kept the old download visible. Copied form widgets also lacked a document-level form directory. Basic merge/extract now reuse the existing flatten helper before copying, retaining filled text/checkbox appearances without orphan widgets; nine-language copy explains that these forms become fixed page content. Rotation keeps editable forms. Range edits clear old output/errors and are disabled during work. Late metadata inspection from an older file selection cannot overwrite the new selection's page count. The real-method regression fails on the previous source and passes on the patch; browser regressions cover saved contents, orphan removal, editable rotation and result invalidation. Patched full-page verification remains a separate remote gate. Reference: [pdf-lib flatten guidance](https://pdf-lib.js.org/docs/api/classes/pdfform#flatten).

Source `27945ad3` was pushed and started three remote runs. Its native lane failed because the newly added task-ownership test requires TypeScript while that lane deliberately does not install dependencies. The test was moved to the existing browser lane after the locked dependency installation; no test was removed or weakened. A fresh run is required for this correction and the basic-PDF continuation.

After the user reported reconnecting Vercel, this session's connector calls returned `Unknown tool`; the existing CLI login still returned 403 with an invalid-token flag. No credential values were logged, account/project settings changed or deployment attempted through a different project. Restored access is not claimed.

### Supplied images: PDF and batch exports

Both supplied PNGs were actually converted and saved together as PDFs: fit/auto/no-margin yielded page sizes 193×148 and 222×148; A4 landscape/large-margin yielded two 841.89×595.28 pages; Letter portrait/small-margin yielded two 612×792 pages. Embedded image dimensions remained 193×148 and 222×148. After reordering, a new fit-size download independently reopened with widths 222 then 193. These are real saved-file structure/order checks, not final visual acceptance of every image/option.

Batch PNGs at maximum width 100 independently decoded as 100×77 and 100×67. Reprocessing at width 150 and downloading the real ZIP yielded both images at 150×115 and 150×100. Changing width retained old outputs even after waiting for renderer updates. Width/quality/format edits now clear old files/errors, and those controls lock during processing; the browser regression verifies all three invalidations and independently reads the new PNG header/dimensions. PR #36's current BatchImageWorkbench diff was reviewed first: its exact/contain/cover resizing functionality is separate and is not reimplemented here. That PR touches the same option rows, so integration must retain both sets of behavior rather than overwrite either implementation. No blind merge was performed.

### Accepted remote source aede36c6 and subsequent PDF security work

For exact source `aede36c62918d04b34c82cce6e7c4d48013978df`, [production run 38986544488](https://github.com/3078024889/lingxi-quantum/actions/runs/38986544488) succeeded with desktop 919 passed / 59 skipped and mobile emulation 920 passed / 58 skipped. [Delivery run 38986544503](https://github.com/3078024889/lingxi-quantum/actions/runs/38986544503) succeeded: 333 passed / one skipped. [Media run 38986544528](https://github.com/3078024889/lingxi-quantum/actions/runs/38986544528) succeeded in both native and browser jobs; browser 140 passed. Builds and scoped regressions therefore cover the prior PDF, batch-image and task-context patches. Actual provider/payment isolation, missing Supabase environment configurations in CI, skipped tests and physical-device limitations remain explicit. These are not fully accepted-tool totals, nor receipts for the newer changes below.

Independent PDF.js comparison of the complete book's pages 1, 2, 500 and 966 found identical rendered PNGs and extracted text before/after metadata cleanup. For the basic range `2,1`, the actual extracted file retains original source order `1,2`, matching the shared range planner's deliberate sorting behavior; both pages render identically in that order. It is not accepted as custom reordering.

Actual protect/unlock/web-optimize operations used the two-page book copy. PDF.js rejected absent and wrong passwords, opened both correct credentials, reported two pages and retained the Chinese title. With printing/modification/copy disabled, permissions contained only accessibility reading (512). Wrong-password unlock produced no download; correct-password unlock independently reopened unencrypted with two pages (2,172,507 bytes). Web optimization saved two pages (2,174,013 bytes), a real Linearized header, identical page boxes and the same nine image-dimension entries. These structural checks do not establish every password/permission combination or every page's visual quality.

The complete book's read-only inspection showed 966 pages and 154 bookmarks. Independent traversal confirmed both counts. This tool displays a report and has no file-export button; its missing Save button is not classified as a processing failure.

A further real production defect was reproduced after password protection: changing printing permission retained the previous file after waiting for renderer updates. The structural workbench now clears prior result/errors for every password/permission change and disables its parameter fieldset while processing. Its old unconditional Free label is replaced by the existing nine-language save-price guidance; no pricing, quota, server billing or database mutation is introduced. Browser regressions exercise all password/permission fields, lock controls while the actual qpdf engine loads, save new encrypted files, and assert selected permission bits. These subsequent changes require their own remote build/browser receipts.

### QR generation/recognition closed loop and a reproduced SVG failure

Actual production generation covered all nine types: URL, Wi-Fi, vCard, email (including Chinese subject/body), SMS, phone, location, calendar event and Unicode text. Both PNG and SVG were downloaded for every type. All 18 saved files independently decoded to the exact expected payload. The site's reader also recognized all nine PNGs exactly. However, its own URL SVG failed in the production reader despite independent decoding succeeding. In the same real Chrome, direct `createImageBitmap(svgBlob)` reproduced `InvalidStateError`; this is a real input-decoding incompatibility rather than a missing QR code.

The existing shared bitmap loader now falls back only for SVG: load as an image, rasterize to a bounded canvas, then create the bitmap. It does not insert SVG markup into the DOM. Raster fast paths remain unchanged. Temporary URLs/timers/canvases are released on success or error; missing/drawing-failed canvases release source bitmaps. Actual patched functions were run in Chrome against all nine downloaded SVGs: all decoded exactly, each left zero temporary URLs. A malformed SVG rejected and left no temporary URL. These are actual helper/browser results, not patched production-page acceptance. The new full-page regression requires the next remote run and covers PNG/SVG payloads, malformed-file recovery and truthful text-only result labels.

The real-method unit fails on the previous source and passes on the patch, including malformed input, timeout, oversize, missing context, drawing failure and bitmap failure cleanup. Full-repository import/export, API/CI/build configuration and manifest searches found no consumer of the duplicate `lib/tools/shared/qr-reader.ts`; it was removed, both historical manifest entries were removed precisely, and the retired-code audit now guards against its return. The active reader continues through `readQrCode` and the shared image canvas; no parallel decoder/library was introduced.

### Attachment and anonymous delivery evidence

On the real two-page book, adding a Chinese-named text attachment, downloading, independently extracting and decoding the embedded stream preserved both the exact filename and payload bytes. Removing it and downloading again left an empty EmbeddedFiles Names array and retained two pages.

A separate self-created public test PDF, containing no user material, exercised desktop file actions. Native share returned the truthful system-handoff notice; actual destination delivery was not established. Opening the WeChat/save tutorial made zero temporary-upload requests. Only after explicitly clicking the upload button did the anonymous session request the temporary-file API, which returned 401 `AUTH_REQUIRED`; the UI showed sign-in/save guidance, and no file bytes were uploaded. This does not verify logged-in storage, link expiry or cleanup. All receipts remain private. Latest security source `7ba496c4` was building/testing remotely at this stage; the earlier complete green baseline remains `aede36c6`.
