# SASI response and execution review — 2026-10-11

This is an implementation review, not a claim that all multimodal tasks or 121 tools have passed production acceptance.

## Actual repository architecture

`SasiOneSurface` is the current entry point. It hosts conversation and explicit task workspaces. Shared skill guidance, the experience-provider router, connected-service billing, durable runs, step leases and artifact delivery already exist. Knowledge used a separate buffered JSON response and evidence-only prompt; conversation used SSE. Sharing a launcher alone did not give those flows the same completion/recovery behavior.

The reported identity question with an attached book followed the knowledge prompt, so it asked the book for platform identity. Provider token-limit termination was not rejected. The router's twelve-second timeout also covered an entire streamed answer, rather than just waiting for it to start. These are concrete code findings; this review does not infer production response latency from a screenshot.

## Primary code compared

| Project/source | Mechanism considered | Existing SASI and change |
| --- | --- | --- |
| [LibreChat generation manager](https://github.com/LibreChat-AI/LibreChat/blob/main/packages/api/src/stream/GenerationJobManager.ts) | Durable terminal publication and reconnection; subscribers distinguish unfinished execution from completed output | Reuse existing durable steps; do not turn a busy step into failure; owner-scoped GET recovers a saved knowledge answer without supplier resubmission |
| [LiteLLM fallback handlers](https://github.com/BerriAI/litellm/blob/main/litellm/router_utils/fallback_event_handlers.py) and [routing documentation](https://docs.litellm.ai/docs/routing) | Bounded fallback, timeout and provider health decisions | Retain current provider scoring/cooldowns; distinguish first-token deadline from whole-stream deadline; clear partial output before retry; reject token-limit termination |
| [Dify RAG pipeline](https://github.com/langgenius/dify/blob/main/api/services/rag_pipeline/rag_pipeline.py) | RAG as a specific workflow, with explicit events and processing stages | Keep uploaded evidence for document questions; platform identity uses shared application facts; knowledge and conversation now share the response decoder |
| [Open WebUI license documentation](https://docs.openwebui.com/license/) | Deployment and branding requirements | Review only; no source copied or package installed |

LibreChat's repository license is MIT. [Dify's license](https://github.com/langgenius/dify/blob/main/LICENSE) adds conditions to Apache 2.0; Open WebUI also has additional terms. This change is written against the existing application and does not import those projects' code. No second workflow platform or AI SDK dependency was added.

## Implemented and verified locally

- Shared platform identity answers in nine languages, independent of uploaded book evidence.
- Knowledge SSE and common conversation/knowledge decoder: split UTF-8 and CRLF, retry resets, required terminal event, bounded input, interrupted-response failure.
- Provider token-limit termination is rejected before experience settlement or connected-service charge; failed partial knowledge turns cannot be exported as completed documents.
- Provider stream may finish beyond twelve seconds when it starts in time, within the existing shared route deadline.
- Conversation defaults now allow 2,560 output tokens; explicit detailed requests and task modes allow 4,096. Prompts require useful depth and a coherent first stage for oversized work. These limits do not establish a measured response-quality score or guarantee a full film in one response.
- Busy durable steps propagate without automatic retry/failure; owner-only recovery reads saved knowledge output rather than generating again.
- `scripts/test-sasi-response-transport.cjs` and `scripts/test-sasi-provider-stream.cjs` passed. They exercise actual transpiled modules with isolated provider/database boundaries; they are not a real supplier benchmark.

## Acceptance still required

The latest build passed (`reports/r64/build-sasi-acceptance.log`, 1,304 pages). Eight targeted desktop/mobile cases passed (`sasi-browser-retest.log`): real unauthenticated platform identity API, browser stream reset/completion/interruption and capability selection. Provider-stream cases use controlled boundaries; they are not a live-provider benchmark. Twelve separate desktop/mobile real-output cases passed for text encodings, image conversion and PDF merging (`tool-output-retest.log`). Full desktop/mobile suites each passed 374 selected cases without failures or skips; final TypeScript, source and Playwright contract checks also passed.

Measure actual first-token/total latency for configured providers in an isolated authenticated environment; validate long-form requests, citations and real artifacts. Verify AI drama's complete video pipeline, image/video/audio capability availability, persisted results and one-time billing. Free model availability and an installed Skill do not by themselves prove a task can run, nor does a textual production plan prove that a video was produced. The current patches do not establish those remaining claims.

Production environment metadata and runtime logs were denied by the connected Vercel account (403). The explicitly scoped CLI fallback also failed because there are no local credentials and its login flow failed. No production credentials were copied, no production configuration changed, and no live-provider validation is reported as passing.

## Additional delivery audit and fixes

Read-only production database aggregation on 2026-10-11 showed NVIDIA experience failures at 12–18 seconds and repeated fast Mistral failures; OpenRouter and Cloudflare also had successful calls. These are historical provider totals, not controlled first-token benchmarks. There were no video tasks in the queried video table and no recent rows in the intelligence-run table. No user data, credentials or production settings were changed.

Routing now ranks recent demonstrated reliability before share fairness, while retaining cooldowns and fallback. A controlled module test confirms a least-used failing service cannot outrank a healthy heavily used service, and that fallback remains available when the healthy service cools down.

Supplier video success without a usable HTTPS URL now fails before completion/billing. Authenticated OpenAI video downloads use the approved original connection to construct the endpoint, check the task owner/fingerprint and never send credentials to stored output URLs or follow redirects. Media range transport validates body length, interval boundaries and a shared DNS/redirect/download deadline; empty/truncated chunks fail.

[ComfyUI's API example](https://github.com/comfyorg/comfyui/blob/master/script_examples/websockets_api_example.py) retrieves execution history and output bytes after task completion. [MoneyPrinterTurbo's task service](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/app/services/task.py) separates production stages and final video delivery. These support the distinction between accepted job, produced clips and an assembled artifact. No code or model weights were copied from either repository.

Desktop/mobile real MP4 composition cases passed using two fixed four-second video fixtures: the result is approximately eight seconds, 720×1280 and decodes in the browser. Supplier submission/polling was mocked; this is an actual composition check, not proof of external AI video generation. New image/PDF output cases initially had an incorrect test expectation equating image pixels with PDF points; it was corrected to verify embedded pixel dimensions and page aspect ratio. Their corrected rerun is pending.

The CLI login failure was traced to a Unicode machine hostname in its User-Agent header. Normalizing only that CLI process's hostname allowed the device-authentication flow to start. This historical checkpoint was superseded on 2026-10-12: scoped CLI authorization succeeded through the existing Chrome session; environment metadata and deployment logs are accessible. Connector permission errors remain separate. The R77 follow-up now records actual free-model long-form output and file archive/transaction acceptance in `r77-delivery-acceptance-20261012.md`.
