# Web real-file acceptance — 2026-10-16

This report supplements the older per-tool operation ledger; it does not promote its isolated/synthetic tests to full real-file acceptance. The older ledger contains 123 tools: 108 have some operation evidence, two translation tools isolate translation services, one promotional-video tool tests handoff without generation, and 12 have no recognized operation-output evidence. None of those labels establishes all options work.

The user will perform physical-phone checks. This pass focuses on actual web operations and output inspection in Google Chrome, one reused tool tab. Temporary inspection tabs are closed immediately. All supplied originals and outputs stay on the user's computer; no private media are committed or uploaded to public artifacts. Export allowance/payment interception is test-only and is never a real billing acceptance.

| Tool | Actual input and operations | Independent output checks | Result / remaining |
| --- | --- | --- | --- |
| Video toolkit | Supplied HEVC/AAC vertical clip; compression and MP3 extraction in production | Saved files reopened and fully decoded; video 241 frames through 10.10 seconds, audio through 10.10 seconds | Those operations passed for this sample; other modes/codecs remain separate checks |
| PDF metadata removal | Supplied 966-page PDF; production processing and download | Empty Info/XMP; all page content-stream hashes and page dimensions preserved | Passed for this file; page-visible author text intentionally remains |
| PDF merge/split | First two pages copied from supplied book; extract page 2, rotate only page 1, merge with extracted page | Saved outputs reopen with 1, 2 and 3 pages; rotation angles 90/0 | Normal paths passed; `1,garbage` incorrectly delivered a partial result. Patch reuses existing strict export-plan validation; browser retest pending |
| Image watermark removal | Supplied small image with credit in white footer; actual box selection and processing | Selection interrupted by native image dragging; first output had a dark gradient | Gesture patch adds scroll/select controls. Corrected boundary grouping alone did not solve quality. Flat-background repair and image-edge coverage require source-preview UI retest |

## Defects and next verification

- Public catalog reintroduced the retired image-to-PDF alias through a second catalog. Remove the alias after all catalog sources are assembled.
- Alias redirect dropped language/query parameters. Preserve parameters during redirect, including Arabic RTL acceptance.
- PDF basic range parser silently ignored invalid tokens and accepted fractional range endpoints. Reuse `createExportPlan`; reject the request without a downloadable result.
- Image-to-PDF exposed internal option keys in result details and raw exception tokens. Keep the page count and localized failure copy.
- Image watermark labels must cover the actual nine supported languages, including Arabic; the language-key type now checks this at compile time.
- Inpainting ignored the last row/column. Include selected boundary pixels; use existing mask diffusion for nonflat edge regions and a corroborated solid background for simple flat strips. Do not characterize this as reconstructing arbitrary textured photographs.

The ten desktop gate failures include obsolete test assumptions: folded FAQ content was expected visible without opening it; guide text was scoped to `main` although the guide is its sibling; an old permanent-free phrase was still asserted; a text locator matched both heading and summary; the image API fixture treated a GET as a POST; fit-page output was asserted while the test left A4 selected. Fix those fixtures to exercise the intended behavior explicitly. Catalog duplication and query loss are product defects, not fixture-only failures. Keep all actual privacy-dialog/no-upload and frozen-fee assertions.

## Official upstream research

- [OpenCV inpainting](https://docs.opencv.org/4.x/df/d3d/tutorial_py_inpainting.html) explains mask/neighborhood methods; [OpenCV license](https://github.com/opencv/opencv/blob/4.x/LICENSE) is Apache-2.0. The existing engine catalog already references OpenCV; no second image service or heavy browser runtime was added in this patch.
- [IOPaint](https://github.com/Sanster/IOPaint) is Apache-2.0 but its official repository is archived. Do not treat it as actively maintained or install its model stack onto the 2 GB host without measurement.
- [ffmpeg.wasm official FAQ](https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/apps/website/docs/faq.md) distinguishes wrapper licensing from bundled codecs and describes browser memory limits. Preserve the existing runtime rather than loading another FFmpeg copy for each tool.

Real translation accuracy, complex photo inpainting, AI generation quality, provider-connected paid operations and external-app delivery remain unaccepted until actually exercised. No production promotion follows from fixture or decoder counts alone.
