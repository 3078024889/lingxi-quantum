# SASI creation audit — 2026-09-28

Base audited: d01d8fc09f08de0c8e14b4e67acb86dc4f65bf47 (local main matched fetched origin/main).

## Implemented corrections

- First-request image references use the completed upload results, not an obsolete React state snapshot. Failed uploads block preparation.
- Material consent is explicit. Upload/removal/spec edits invalidate quotes; a confirmed quote disappears immediately and a synchronous lock prevents double submission.
- Managed quotes preserve square ratios, reject unsupported ratios/resolutions and do not silently substitute 720p for a requested 1080p. Reference-image requests use the existing reference-aware BYOK route.
- Website preparation reads only the signed-in owner's selected ready project documents through an authenticated, no-store endpoint. Bounded excerpts are included in the website request and local draft. No global training copy is created.
- Static website previews/downloads remove scripts, embedded frames/forms and use a restrictive CSP. A local draft is not a deployed application or working payment backend.
- Polling stops on HTTP failure and component unmount. Delivery is only displayed when an actual result URL is available; request errors do not silently schedule unlimited polling.
- Food-101's 101 display names are translated. Suggested names can populate a food search; tiny-score alternatives and confidence-like percentages are removed. New photos clear prior meal results. Loading failure can be retried. These are usability/reliability fixes, not proof of better recognition accuracy.
- Learning task-family validation now accepts the dotted names sent by the composer; the previous regex rejected them. Project ownership is checked; client observations cannot submit a validator score or task ID. Client observations remain distinct from server benchmark evidence.
- EPUB extraction follows the package spine. Office archive extraction rejects oversized input/expanded contents before parsing.

## Executed verification

- TypeScript: passed after corrections.
- SASI audit, V5 audit, V5.1 source audit, V5.2 source audit: passed. Source audits are not runtime acceptance.
- Browser fixtures: explicit consent, square format, 1080p request, consumed quote, mobile width, local website preview and ZIP, CSP and food-name selection passed. No supplier or payment request was made.
- Actual generated document fixtures: DOCX text, XLSX cells, PPTX slide order, EPUB spine order, oversized archive rejection passed.
- Real local PDF merge/page selection/PNG conversion and text Unicode/encoding tests passed.
- 59-tool source-graph coverage passed; this is not 59-tool end-to-end acceptance.
- Production database read-only inspection: authenticated asset text SELECT privilege and SELECT policy present. Existing drama.compose/website.compose outcome row count was zero before this change. No production migration applied.

## Remaining acceptance / unresolved scope

The consolidated specification is NOT fully accepted by these changes. In particular:

- No paid model generation, supplier price/permission validation, real video quality benchmark or payment callback was executed.
- No fresh authenticated production project/upload/learning-event journey has been verified in this session. Local API fixtures must not be described as production success.
- Food-101 remains a closed-set classifier. General mixed-plate, fruit, portion and ingredient understanding still needs a suitable vision model and representative real-image evaluation. Chinese names are display labels, not exact nutrient records; the user must select a matching food and weight.
- Continuous project conversation/history restoration, multi-episode orchestration within the new composer, rich logo/image use in website drafts, media transcription and automatic final assembly are not completed by this patch.
- Uploaded document excerpts are capped at 8,000 characters for this integration. This is not unlimited context or full-book comprehension.
- 2K/4K and unsupported ratios remain unavailable for generation. Listing them is an expression of intent, not a billable promise.
- The whole site's AI tools still require individual real-input/output acceptance. No claim of all tools being repaired is made.
- Autonomous model promotion and self-repair cannot be inferred from successful UI telemetry. Real benchmarks, failure analysis, shadow/canary tests and rollback evidence remain required.

Official references consulted:
- https://huggingface.co/onnx-community/swin-finetuned-food101-ONNX
- https://huggingface.co/docs/transformers.js/api/pipelines
- https://supabase.com/docs/reference/javascript/auth-getuser
