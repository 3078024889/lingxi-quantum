# LINGXIFIELD V25 — PDF Editor Canonicalization

The V24 build exposed one more historical cumulative-mutation class:

```ts
const id = newPaidTaskDraftId();
setDraftId(id);
const id = newPaidTaskDraftId();
setDraftId(id);
```

The previous idempotency audit covered:
- duplicate state declarations
- duplicate export quote metadata queries

It did not cover repeated local `draftId` creation statements inside PDF file-open logic.

V25 adds a final canonicalization pass after every historical patch:
- collapses repeated `newPaidTaskDraftId()` + `setDraftId(id)` blocks
- normalizes whitespace variants
- preserves one canonical creation statement per path
- audits adjacent / nearby duplicate `const id` declarations before `next build`

No pricing, payment execution, withdrawal, food-calorie logic, support lifecycle or production data is modified.
