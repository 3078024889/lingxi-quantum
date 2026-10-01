# LINGXIFIELD Continuous Tool Workspace

V18 introduces a browser-local handoff layer between tools.

## Privacy model
- Intermediate files are stored only in IndexedDB in the current browser.
- No upload is performed by the handoff layer.
- Handoffs expire after 30 minutes.
- A handoff is consumed once and then deleted.
- The URL contains only a random opaque token, never file bytes or filenames.

## User experience
A tool result can be passed directly to a compatible next tool:
- PDF -> compress / split / export images
- image -> compress / resize / remove metadata / create PDF
- XLSX -> CSV
- CSV -> XLSX

## Scope
V18 does not modify:
- food-calorie internals
- payment/withdrawal execution
- support mail lifecycle
- production data
- unrelated core/"本源" modules
