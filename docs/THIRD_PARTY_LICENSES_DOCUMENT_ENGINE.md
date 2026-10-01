# LINGXIFIELD Document Engine — Third-Party License Register

This register covers the document/PDF/image-processing layer changed by this package. It does not replace the repository-wide license inventory.

| Component | Role | License posture | Package rule |
|---|---|---|---|
| pdf-lib | PDF creation/editing | MIT | Permissive; retain notices when redistributed as required. |
| PDF.js / pdfjs-dist | PDF rendering | Apache-2.0 | Permissive with notice obligations. |
| Mammoth | DOCX text extraction only | BSD-2-Clause | Do not represent HTML/text extraction as layout-faithful Word rendering. |
| sharp | Server image processing | Apache-2.0 | Review underlying libvips obligations in deployed distribution. |
| libvips | sharp native image engine | LGPL family | Dynamic/system distribution and notices must be reviewed for release packaging. |
| Tesseract.js | OCR client integration | Apache-2.0 | Model/data licensing must be reviewed separately from software license. |
| jsQR | QR decoding | Apache-2.0 | Permissive with notice obligations. |
| JSZip | ZIP processing | MIT | Permissive. |
| ExcelJS | spreadsheet processing | MIT | Permissive. |
| Mozilla Readability | page extraction | Apache-2.0 | Permissive with notice obligations. |
| DOMPurify | sanitization | dual licensed upstream | Preserve upstream notice/license choice. |
| FFmpeg | media runtime | build-dependent LGPL/GPL | Never record one fixed license without inspecting actual build configuration. |

## Explicit exclusion

Stirling PDF is a product/research benchmark only for this build. Do not copy restricted/open-core engine code into LINGXIFIELD. Any future reuse requires file-level license review first.
