# V70 Global PDF benchmark

V70 only ships capabilities that can be truthfully implemented with the current browser PDF engine.

Benchmarked product patterns:
- PDF24: Overlay, page information, bookmarks, extract images, web optimize, repair, rasterize, flatten, PDF/A, protect/unlock, signature verification, viewer preferences.
- Sejda: Bates numbering, headers/footers, grayscale, split by bookmarks/text/size, remove annotations, deskew, repair and workflows.
- qpdf/pdfcpu remain candidates for the next deep-core gate: true repair, encryption/permissions, web linearization, embedded attachments/images and signature inspection.

V70 ships free local entrances for Overlay, Header/Footer, Bates Numbering and Viewer Preferences. These are browser-local acquisition tools and do not consume server compute.
