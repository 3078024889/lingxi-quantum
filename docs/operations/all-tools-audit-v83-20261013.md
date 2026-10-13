# Public tool functional audit V83

The public tool surface contains 121 distinct tools, merged from the registry, advanced routes and SEO catalog. `scripts/audit/tool-function-inventory-v83.cjs` generates JSON/CSV records in `_local/handoff/tool-audit-v83`, with page sources, declared capabilities and explicitly named tests. Static inventory and HTTP 200 do not prove all functional paths.

## Confirmed findings and corrections

| Finding | Change | Required result check |
| --- | --- | --- |
| The shared image canvas painted white for alpha-capable output. PNG metadata removal lost transparency. | Select background by output type; PNG/WebP metadata output keeps its format and alpha. | Decode downloaded output and inspect transparent/semitransparent pixels and dimensions. |
| The catalog advertised WebP to JPG/PNG, but the dedicated route offered only JPG. | Add localized JPG/PNG selection and reuse the shared image converter. Remove the duplicate conversion implementation. | Download and decode both modes; verify JPEG white background and PNG alpha. |
| Batch selection replaced earlier selected images. Extremely thin resized images could have zero height. | Append batch selections and clamp scaled dimensions to at least one pixel. | Add files in separate selections; resize 2000×1 fixtures to 356×1. |
| Many workbenches said ZIP download was available, but ResultPanel exposed individual downloads only. The unused ZIP helper could overwrite generated duplicate names. | Add shared lazy-loaded ZIP export, sanitize archive names, allocate collision-free names, cap total input at 256 MiB / 1000 files. | Extract an actual downloaded ZIP and validate every payload, including case and generated-suffix collisions. |
| ULIDs were not ordered within the same millisecond, and identifier results could only be copied. | Implement monotonic ULID suffix carry and clock rollback handling; add TXT export, bounded integer counts, clipboard-denial feedback and nine-language controls. | Check 10,000 IDs, overflow rejection, repeated batches, 356 UUIDs and exact TXT bytes. |

## Mature implementation comparison

| Area | Primary reference | Applied principle / current limit |
| --- | --- | --- |
| Numeric editing | [React Aria NumberField](https://react-spectrum.adobe.com/react-aria/NumberField.html) | Keep unfinished text separate from committed numbers. Existing shared input is retained; all initial public numeric controls plus upload-dependent PDF/video/food controls are tested. |
| Image tools | [Squoosh](https://github.com/GoogleChromeLabs/squoosh) | Inspect actual output format, dimensions and alpha. No claim of codec parity with every Squoosh encoder. |
| PDF tools | [Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF) | Distinguish page manipulation, rebuilding, OCR and document conversion. Real PDF fixtures are covered; supplier conversion acceptance is classified separately. No wholesale copied implementation or licensing change. |
| Text/developer tools | [CyberChef](https://github.com/gchq/CyberChef) | Unicode and lossless parsing/round-trip contracts; input preserved independently of output. Existing source-formatting and developer tests are retained. |
| Video/audio tools | [LosslessCut](https://github.com/mifi/lossless-cut), [FFmpeg filters](https://ffmpeg.org/ffmpeg-filters.html) | Compare real duration, dimensions, sync and stream behavior. Real local fixture processing is covered; real paid model generation remains excluded at the owner's instruction. |
| Identifiers | [ULID specification](https://github.com/ulid/spec) | Monotonic order, overflow and timestamp encoding. Independently implemented from the specification; no copied third-party source. |

## Verification record

Before these runtime changes: 876 browser cases, 874 passed initially. Two desktop cases timed out creating browser pages; both passed a single-worker focused rerun. This is recorded as initial failure plus successful rerun, not an uninterrupted 876/876 pass.

New source gate and production build (1305 pages): PASS. New actual-output and numeric browser regressions: 74/74 PASS across desktop and mobile (`_local/handoff/output-browser-v83.log`). Unit tests check 10,000 real IDs and actual ZIP extraction. The 121-route test checks rendering and initial controls, not every hidden mode. Numeric tests additionally upload real documents and exercise trim/nutrition modes. No real user balances, paid supplier generation or production user files are modified by test fixtures.

All 121 public routes and their editable initial numeric/decimal controls passed on desktop and mobile: 244/244 cases, including the two nine-language hub checks (`_local/handoff/public-controls-v83.log`). Upload-dependent and alternate-mode controls are additionally covered by the 74-case output/numeric run. This counts tested cases, not distinct features or all possible file formats.

All tools are inventoried. This report does not claim every supported file format, every external supplier or every production payment has been fully exercised. Named test inventory is a conservative source index, not a coverage percentage. The corrections above must pass actual output tests before release.
