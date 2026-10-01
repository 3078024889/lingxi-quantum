# LINGXIFIELD V24 — Idempotent Paid-Recovery Closure

V24 fixes the two production-build parse errors exposed after V23:

1. `PdfEditorWorkbench.tsx`
   - `draftId`, `officeReady`, `officeFormats` had been injected twice by cumulative patch reapplication.
2. `app/api/tools/export/consume/route.ts`
   - the payment-quote metadata query used `const q` twice after cumulative patch reapplication.

## Structural fix
V24 does not merely delete the duplicate lines once.
The patcher is now idempotent:
- normalizes duplicate state fragments before applying changes
- checks whether draft state already exists before inserting it
- checks whether `TASK_DRAFT_MISMATCH` logic already exists before inserting the quote query
- runs a final deduplication pass
- executes `audit:v24-idempotency` before `next build`

Repeated installation must keep:
- one PDF draft-state declaration
- one Office readiness declaration
- one Office format declaration
- one export quote metadata query
- one task-draft mismatch guard

V23 paid-tool recovery, V22 PDF/order recovery, dynamic public-tool-count tests, pricing and media work remain cumulative.
