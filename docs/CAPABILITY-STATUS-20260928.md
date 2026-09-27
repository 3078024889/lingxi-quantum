# Capability status — no supplier costs fronted by SASI

This is an implementation/acceptance inventory, not a declaration that all features work in production.

| Capability | Current execution | Acceptance / gaps |
|---|---|---|
| PDF, encodings, image format/size, archive and other deterministic tools | Browser or server libraries; no generative API needed | 59 discovered tool entries, 60 routes pass production-render smoke; this is not file-in/result-out acceptance for all tools |
| Text utility transformations | Deterministic JavaScript | Chinese/emoji roundtrips, invalid UTF-8/URL inputs, duplicate/empty lines and size limits tested |
| OCR | Tesseract.js OCR model | No paid model API; real files/languages require separate acceptance |
| Speech transcription | Browser WASM, local `onnx-community/whisper-tiny` q8 weights | Free model; speed/memory depend on visitor device; not a universal accuracy guarantee |
| Food photo | Browser WASM Swin Food-101 q4f16 | Closed-set classifier; never treated as general vision. User confirms foods and weight; image guesses are free |
| ID photo background | Canvas color-distance algorithm | Not AI portrait segmentation; suited only to simple uniform backgrounds, explicit warning added |
| Subtitle translation | Browser Translator API | Browser/language dependent; source language must be explicit; translate preview before charging export |
| Video dubbing | Whisper + browser translation + speechSynthesis preview | No downloadable dubbed soundtrack/video; paid readiness disabled, free experimental preview only |
| Seedance video | User-owned encrypted API connection; supplier charges user | Single-shot quote/confirm/task lookup exists. Profile permits 720p or 1080p, fixed by operator profile; duration maximum <=12s. No 480p/episode price selector or end-to-end automatic series acceptance |
| Image generation | Local SD1.5 CPU experiment; separate native worker interface | Owner-PC experiment is not a public cloud service. No accepted public BYOK image flow in this change |
| Book Q&A | Existing evidence retrieval/deterministic grounded fallback, optional native reasoning worker | Small Qwen3-0.6B local experiment is not wired into public service and is not GPT-level; BYOK text exists separately, not a completed book-Q&A integration |
| Website/app generation | Planning/project interfaces | User-funded inference, isolated code execution, build and deployment are separate capabilities; a fully accepted end-to-end build/deploy flow is not established |

## Sharing / cleanup

- Current remote main was verified at `7f1527ff73c09363e9023e0abb7e1b2b90e1e80f` before this follow-up; it already includes the earlier retirement/BYOK cleanup.
- Desktop `C:/Users/30780/Desktop/lingxi-quantum` contains only `miniapp/project.config.json`, no second Git checkout or retired product sources.
- Both live domains returned HTTP 200 and the September 27 share image before this update. This update versions the same user-approved artwork as September 28 and explicitly supplies images to overriding metadata on tool, localized and PayPal pages.
- Mini Program source uses the matching bundled image. Source changes do not equal Mini Program upload, review or public release.
- Git history and production customer/database records are not erased. Historical migration/retirement references are not active product surfaces.

## Operating rule

Use algorithms where sufficient; use local open models only after weights/runtime and output acceptance; use the user's own API for cloud generation. Never silently fall back to a platform-funded model. Successful page rendering or a model connection test is not proof of successful generation.
