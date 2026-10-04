# V72R1 Global Benchmark — PDF Structural Engine

## Adopted patterns

- qpdf 12.x: proven PDF encryption/decryption, permission flags, linearization and structural repair.
- qpdf-run 0.2.1: qpdf compiled to WebAssembly with a typed browser API and local-only file processing.
- pdfcpu: reference for permission semantics and owner/user-password separation.

## Lingxifield decisions

1. Protect / Unlock / Permissions / Web Optimize are free because they run locally and consume no server/API resources.
2. AES-256 is the default protection mode.
3. Unlock requires a password the user already knows. No password cracking or bypass capability is implemented.
4. Web Optimize means true PDF linearization / Fast Web View, not rasterization.
5. UI copy stays user-facing; engine/WASM/qpdf terminology remains internal.
6. 9 languages are included in the workbench.
7. Repair, PDF/A and formal signature validation remain quality-gated for later versions because they need distinct product/payment/compliance contracts.

## Dependency

- `qpdf-run` pinned exactly to `0.4.0` (Apache-2.0; qpdf-based WASM toolkit).
- Installer uses `npm install --ignore-scripts --save-exact` to avoid lifecycle-script execution and dependency drift.
