# LINGXIFIELD Media Production V19

## Why this exists

Route rendering is not functional validation. A media tool is production-ready only when:
1. its runtime loads,
2. a real fixture is accepted,
3. processing produces non-empty output,
4. the output MIME/extension is correct,
5. failure is explicit rather than a fake success,
6. desktop and mobile paths are covered.

## Runtime decisions

### Speech recognition
Use official `@huggingface/transformers` with its matched ONNX Runtime dependency.
Backend order:
1. WebGPU when available,
2. WASM fallback,
3. paid server transcription fallback for full paid dubbing.

The old hand-copied `/vendor/transformers` + `/onnxruntime` pairing is retired.

### FFmpeg
Keep single-thread `@ffmpeg/core 0.12.10`, copied from the installed package during build. Single-thread avoids SharedArrayBuffer/cross-origin-isolation requirements. Runtime assets are validated before media E2E.

### Video dubbing
Production path:
speech -> translation -> TTS -> FFmpeg mux -> downloadable MP4.
No claim of lip-sync or voice cloning in this version.

### Image translation
Tesseract returns layout blocks and bounding boxes. Each detected line is translated, its source text region is covered using surrounding color sampling, and translated text is drawn back into the original region.

### Watermark cleanup
- Image: manual-area local inpaint, single and batch.
- Video: fixed-area FFmpeg `delogo`, single and batch.
These tools do not claim automatic moving-object reconstruction. Moving watermarks need a separate frame-aware model pipeline.

## External design references absorbed
Feature organization was benchmarked against current VEED, CapCut, Canva, Google Translate/Lens-style image translation, WatermarkRemover.io and AniEraser behavior. No proprietary code is copied.

## Protection
No changes to:
- food-calorie internals
- payment execution / withdrawal execution
- support mail lifecycle
- production user data
- unrelated core/"本源" modules
