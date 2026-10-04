# V71 Global benchmark — PDF local advanced tools

Benchmarked product patterns before implementation:

- PDF24 exposes page size changes, document information editing, PDF image extraction, repair, PDF/A, protection/unlock, signature verification and viewer preferences as distinct task entrances.
- Sejda exposes grayscale, remove annotations, resize, bookmarks, split-by-bookmarks, repair and Bates numbering as separate task entrances.
- qpdf is the preferred structural engine candidate for future web optimization/linearization, encryption/decryption and repair-oriented rewriting.
- pdfcpu is the preferred server-side candidate for AES-256 encryption, permissions, signatures and other deep PDF operations.

V71 intentionally ships only capabilities that can be completed truthfully with the repository's existing browser stack: pdf-lib + pdfjs-dist.

Free in V71:
- remove annotations
- grayscale
- page size normalization
- metadata editor

Deferred to engine gate (no fake UI):
- password protection/unlock/permissions
- structural repair
- true linearization
- PDF/A compliance
- certificate/signature validation
- attachment/bookmark deep editing
