# LINGXIFIELD V23 — Universal Paid Task Recovery

## Invariant
A paid utility must never destroy its current task just to open payment.

Allowed strategies:
1. `persistent-draft`
   - local files + tool state are stored in browser IndexedDB for 7 days
   - quote stores `draftId` and return path
   - payment return restores the same task
2. `retain-tab`
   - payment is opened separately
   - the original tab/workbench remains alive
   - if a popup is blocked and no persistent draft exists, payment does NOT continue in the same tab
3. `server-job`
   - the work itself is stored server-side and can be resumed by order/job id

## Covered public paid tool families
Persistent draft:
- PDF editor / e-sign / cross-page stamp
- ID photo HD export
- image watermark single/batch
- audio/video transcription
- subtitle translation export
- image translation
- video dubbing
- video watermark removal

Retain-tab:
- food calorie paid calculation
  - food internals are not changed
  - payment opens separately; an unsafe same-tab redirect is blocked

Server job:
- temporary mail batch
- burn-after-read file
- SASI deep reasoning / image generation / video generation

## Export ordering
For paid local exports:
1. payment/grant confirmed
2. result generated
3. only after success is the export completion recorded

Generation failure never intentionally consumes a paid local export before the user receives the result.

## Tool-count tests
Final-closure tests no longer contain a literal `64`.
They compare catalog, recipes and fixture classifications dynamically, so adding the 66th, 80th or 100th tool will not require updating a magic number.
