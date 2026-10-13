# Archive-backed tools audit — 2026-10-14

Scope: DOCX/XLSX/ODS document intake, PPTX/EPUB knowledge intake, XLSX → CSV, PPTX → TXT, EPUB → TXT, ODT → TXT and ZIP-based file classification. This extends the V83 121-entry tool inventory and desktop/mobile numeric input audit; it is not proof that every supplier and every possible file format has been exercised.

## Findings and repair

1. ZIP-backed text readers previously used complete-entry `async("string")` inflation before checking decoded content. A common reader now rejects compressed inputs above 50 MiB, more than 4096 entries, declared expansion above 256 MiB, individual text above 16 MiB and cumulative decoded reads above 64 MiB. It counts actual decompressed bytes while streaming and pauses on violations; forged declared sizes cannot bypass the actual counter. ZIP CRC is not enabled during initial indexing because it would inflate all members. XML parsing still happens only after bounded reads.
2. XLSX CSV conversion previously trusted arbitrary column coordinates while padding arrays, collapsed skipped rows, and overwrote cells lacking coordinates. It now validates Excel row/column bounds before allocation, checks row/reference consistency and duplicate rows, limits allocated cells to two million, preserves missing rows and appends cells lacking coordinates. A reduce operation replaces argument spreading for large row counts.
3. Existing unchecked readers were replaced in all scoped paths rather than retained as fallbacks. No new dependencies or copied third-party implementation were introduced.

## Primary references

- [JSZip internalStream](https://stuk.github.io/jszip/documentation/api_zipobject/internal_stream.html) and [pause](https://stuk.github.io/jszip/documentation/api_streamhelper/pause.html): chunked reads and stopping consumption.
- [OWASP file upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html): ZIP bombs and post-decompression limits.
- [Microsoft Excel specifications](https://support.microsoft.com/en-us/excel/excel-specifications-and-limits): 1,048,576 rows and 16,384 columns.

## Verification

- `scripts/test-archive-bounds-v84.cjs`: PASS. Real compressed Unicode/empty members, input/count limits, oversized text, forged-size actual stream rejection, cumulative read budget, valid final column, malformed column/row references, duplicate rows, skipped rows and missing cell references. No network or production data.
- Full source gate: PASS (`_local/handoff/source-tools-v84.log`). Independent TypeScript check: PASS (`types-tools-v84.log`).
- Production build: PASS, 1305 pages (`build-tools-v84-retry.log`). The initial build failed because JSZip's typings omit its documented `internalStream` API; an explicit byte-stream type fixed the error. Existing image/hook lint warnings remain visible in the log.
- Desktop/mobile real file browser checks: **10/10 PASS** (`browser-archive-v84-retry.log`). They download and compare exact XLSX CSV/PPTX TXT/ODT TXT/EPUB ordered-text outputs, and verify invalid XLSX has a user-facing failure and no downloadable result. Initial 8/10 passed; two assertions expected internal error codes although the page intentionally presents friendly messages. Correcting the test locators produced the full pass, without weakening validation.
- Prior V83 browser evidence: baseline 874/876 initially passed; the two pre-action browser setup failures passed focused single-worker retry. Public entry numeric/language checks 244/244, real output/numeric checks 74/74, production file tests 14/14.

## WeChat status observed this session

- Main Mini Program `wxbf4ae90406e7e26b`: version management shows formal **5.5**, published **2026-10-13 18:53:18**. No duplicate submission or release was made.
- Temporary mailbox `wx3330b29f4613a08e`: **2.0 under review**, submitted **2026-10-13 18:29:39**, no online version. It cannot be reported as published before approval.
- Mailbox charging remains enabled at existing ¥0.05/item with daily IP and account allowances of 10 each.
- Paid video supplier tests remain simulated under the user's instruction; real supplier rendering has not been verified. No production user data or payment was created by these archive tests.
