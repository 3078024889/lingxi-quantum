# LINGXIFIELD V21 Resolution and Build Fix

SASI video product resolutions:
- 720p only: ¥0.20/output-second in CNY book, $0.20/output-second in USD book
- 1080p only: ¥0.40/output-second in CNY book, $0.40/output-second in USD book
- 480p: disabled / not offered

These are public floors, not a promise to use an upstream provider whose cost would violate the 45% gross-margin floor.
The routing kernel rejects the cheap tier whenever total provider + platform cost is too high and raises the quote rather than selling below margin.

Build regression fixed:
FFmpeg `readFile()` can return `Uint8Array<ArrayBufferLike>`. V21 copies that data into a fresh `Uint8Array` and passes its concrete `ArrayBuffer` to `File`, satisfying DOM `BlobPart` typing without unsafe casting.

The `<img>` messages seen in the V20 log are ESLint performance warnings, not the compile failure.
