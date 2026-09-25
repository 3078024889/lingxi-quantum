# V7 dependency note

New dependency:

| Package | Version | Purpose | License |
|---|---:|---|---|
| pdfjs-dist | 4.10.38 | Browser PDF rendering for PDF→image, OCR, redaction and raster compression | Apache-2.0 |

The apply script copies the matching `pdf.worker.min.mjs` from the installed npm package into `public/pdfjs/`.
No Stirling PDF, InkVault, Alatify, IMG.LY background-removal, MuPDF or Ghostscript source is copied.

`@imgly/background-removal` was reviewed for the planned ID-photo background-removal feature, but its current upstream license is AGPL. It is **not included** in V7 because Lingxifield should not silently introduce that license obligation into the closed commercial codebase.
