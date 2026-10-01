# LINGXIFIELD V22 — Paid Task Recovery & Document Capability Closure

## Payment recovery
Paid export tasks now persist:
- original local file
- editing state
- PDF overlays / signature / stamp / cross-page stamp
- selected pages and export range
- task draft id
- quote id

The draft stays in browser IndexedDB for 7 days. Payment return includes `resumeDraft` + `resumeQuote`.
Orders recover the same draft when it still exists.

Critical order:
1. server confirms payment/grant
2. browser restores draft
3. browser generates the requested result
4. after successful generation, export completion is recorded

A local generation failure no longer burns the paid export entitlement before the user receives a file.

## ID photo
- editing and preview remain free
- HD export uses `PaidExportButton`
- the source photo and adjustment settings persist across payment navigation
- a successful payment resumes the same photo task

## Office documents in PDF editor
UI is capability-gated:
- without a real converter: PDF only
- with custom converter or ConvertAPI: DOC, DOCX, PPT, PPTX, XLS, XLSX, ODT, ODS, ODP also appear

Server providers:
1. LINGXIFIELD_DOCUMENT_CONVERTER_URL + LINGXIFIELD_DOCUMENT_CONVERTER_SECRET
2. LINGXIFIELD_CONVERTAPI_TOKEN (or CONVERTAPI_SECRET)

The browser never exposes provider tokens.

## Order discoverability
Advanced tool pages show a compact notice:
paid tasks remain in Account → Orders & usage and can be resumed without paying again.
