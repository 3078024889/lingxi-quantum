# Local media model sources

Document, subtitle, image and video text is processed in the device browser.
Model assets download from their publishers; no paid inference fallback is used.

- Transformers.js: https://github.com/huggingface/transformers.js (Apache-2.0).
- SpeechT5 base model: https://huggingface.co/microsoft/speecht5_tts (MIT).
- Browser-compatible SpeechT5 assets: https://huggingface.co/Xenova/speecht5_tts,
  pinned revision 1723781b8ce2d02f0400c8337be04ae8ee3d6d56.
- Public example speaker embedding: https://huggingface.co/datasets/Xenova/transformers.js-docs.
- Browser speech synthesis example: https://huggingface.co/Xenova/speecht5_tts#usage-transformersjs.

Local downloadable dubbing currently supports English. This does not imply voice cloning,
lip synchronization, professional translation accuracy, or mobile device acceptance.
The output and runtime memory use still require browser and real-device acceptance.

Old server inference endpoints return HTTP 410. Account and payment APIs are separate.
Hosting, storage and bandwidth can still incur infrastructure costs.
