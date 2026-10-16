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
