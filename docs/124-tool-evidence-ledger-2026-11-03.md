# LINGXIFIELD 124-tool evidence ledger (2026-11-03)

GitHub desktop and mobile real Chromium route smoke [#41639435553](https://github.com/3078024889/lingxi-quantum/actions/runs/41639435553) passed 248/248 on baseline `a8422028`. It was rerun [#41646554077](https://github.com/3078024889/lingxi-quantum/actions/runs/41646554077) on source feature SHA `a75745ea`: **248/248 passed**. These only check route response, visible content and heading, not actual tool results. The newer OCR fix `55d72677` still needs full end-to-end release gates.

Every row remains **UNVERIFIED for complete real task input→processing→download→reopen, corrupt input, nine-language functionality, and live external API** unless backed by a separate specific test. No classification or navigation pass is presented as a finished tool.

| Tool | Contract type | Desktop route | Mobile route | Real task E2E |
|---|---|---|---|---|
| `ai-image-check` | fixture (ai-provenance-image) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `ai-video-audio-check` | fixture (ai-provenance-video) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `audio-cleanup` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `audio-transcription` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `avif-to-jpg` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `base64-encode-decode` | fixture (text-unicode) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `batch-image` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `batch-image-watermark-remover` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `batch-pdf` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `bmp-to-png` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `burn-after-read` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `case-converter` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `compress-image` | fixture (image-png) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `compress-image-to-100kb` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `compress-image-to-200kb` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `compress-image-to-20kb` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `compress-image-to-500kb` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `compress-image-to-50kb` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `compress-pdf` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `cron-parser` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `csv-json` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `csv-to-xlsx` | fixture (table-csv) | pass @ a8422028 | pass @ a8422028 | Targeted CSV/TSV→real XLSX + downloaded ZIP/XML verified on desktop/mobile; #41652881127 (6 cases across two directions+error); **not full 9-locale proof** |
| `document-copy-layout` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `document-translate` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `docx-to-txt` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `e-sign-pdf` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `epub-to-txt` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `file-compare` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `file-type-detector` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `food-calorie` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `gif-to-jpg` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `handwriting-ocr` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `heic-local` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `heic-to-jpg` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `ico-to-png` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `ics-to-csv` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `id-photo-ai` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `image-to-pdf` | fixture (image-png) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `image-to-pdf-pro` | fixture (image-png) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `image-translator` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `image-watermark-remover` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `jfif-to-jpg` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `jpg-to-png` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `json-formatter` | fixture (json) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `jwt-decoder` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `long-image` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `loop-video` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `md5-sha256` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `merge-pdf` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `number-base-converter` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `ocr` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `odt-to-txt` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-attachments` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-bates-numbering` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-bookmarks` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-compare` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-compress` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-crop` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-editor` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | Targeted native text/image desktop/browser download and mobile drag/OCR; #41652212530 and #41652212393; **encrypted/signed/CJK/multi-locale E2E unproven** |
| `pdf-flatten` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-grayscale` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-halve-pages` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-header-footer` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-inspect` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-merge-split` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-metadata-editor` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-ocr` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-overlay` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-page-numbers` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-page-size` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-pages` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-pages-per-sheet` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-permissions` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-protect` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-rasterize` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-redact` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-remove-annotations` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-remove-metadata` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-search` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-to-jpg` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-to-markdown` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-to-text` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-to-word` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-to-xlsx` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-unlock` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-viewer-preferences` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-watermark` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pdf-web-optimize` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `png-to-jpg` | fixture (image-png) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `pptx-to-txt` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `privacy-cleaner` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `qr-code-generator` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `qr-code-reader` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `qr-safe-reader` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `regex-tester` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `remove-duplicate-lines` | fixture (text-unicode) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `remove-empty-lines` | fixture (text-unicode) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `remove-exif` | fixture (image-png) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `resize-image` | fixture (image-png) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `reverse-video` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `rotate-video` | local-contract | pass @ a8422028 | pass @ a8422028 | WebM→real MP4, 90° geometry and decode validated on desktop/mobile; #41640700174; **other codecs/settings unproven** |
| `screenshot-redact` | fixture (image-png) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `split-pdf` | fixture (pdf-basic) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `stop-motion-video` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `subtitle-tools` | fixture (subtitle-srt) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `subtitle-translate` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `svg-to-png` | fixture (image-svg) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `temp-mail` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `text-counter` | fixture (text-unicode) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `text-diff` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `timestamp-converter` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `url-encode-decode` | fixture (text-unicode) | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `url-parser` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `url-to-video` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `uuid-generator` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `vcf-to-csv` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `video-dubbing` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `video-toolkit` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `video-transcription` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `video-translate` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `video-watermark-remover` | online-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `webp-to-jpg` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |
| `xlsx-to-csv` | fixture (table-xlsx) | pass @ a8422028 | pass @ a8422028 | Targeted real XLSX→CSV roundtrip with Unicode/quotes and corrupted-workbook rejection; #41652881127; **not full 9-locale proof** |
| `xml-formatter` | local-contract | pass @ a8422028 | pass @ a8422028 | **not proven** |

## Per-tool release criteria

Real user input, deterministic output, actual file download and independent decoder validation; invalid, oversized and malformed files; timeout/cancel and recovery; physical desktop/mobile gestures; all nine locales and Arabic RTL; real external sandbox payments/provider receipts and refunds, when applicable.

Classification counts: {"fixture":30,"local-contract":78,"online-contract":16}. Baseline-specific evidence only. PDF native text/mobile #41638507350 (8 passed/1 skipped), video rotation real WebM→MP4 #41640700174 (2 passed), and original-image backend #41641565253 (5 passed) are targeted examples, not comprehensive 124-tool proof.


## Actual additional evidence, 2026-11-03

The 6 real browser cases in [#41652881127](https://github.com/3078024889/lingxi-quantum/actions/runs/41652881127) cover CSV→XLSX→CSV round-trip, TSV→XLSX and corrupt XLSX rejection on desktop and mobile. All output files were downloaded and a separate ZIP/XML parser validated generated workbook contents. A valid file roundtrip does not prove every supported spreadsheet feature or pricing provider.

Desktop original-image/OCR overlap failure in prior full gate #41645522546 was corrected on PR #136 at `55d72677`; focused desktop [#41652212530](https://github.com/3078024889/lingxi-quantum/actions/runs/41652212530) passed 11/11 with one intentional skip, matching mobile [#41652212393](https://github.com/3078024889/lingxi-quantum/actions/runs/41652212393) 11/11. The large full release gate and live payment/provider reconciliation remain mandatory.
