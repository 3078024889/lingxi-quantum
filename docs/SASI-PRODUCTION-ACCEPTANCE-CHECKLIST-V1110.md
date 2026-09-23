# SASI Production Acceptance Checklist — V11.10

Do not mark a row complete from local code alone.

## Database

- Confirm actual production migration history.
- Inspect dependencies before applying any SASI migration.
- Apply SASI migrations in timestamp order.
- Confirm RLS on all SASI persistence tables.
- Confirm authenticated users do not have direct writes to evaluation/evolution tables.
- Confirm service role remains server-only.

## User-triggered intelligence

- User must be authenticated.
- User action must be interactive.
- AI wallet reserve must occur before hosted provider call.
- Failed provider call must release reservation.
- Successful call must settle actual usage.
- Background/system-test paid-call guards remain active.

## Book SASI

- Local evidence retrieval still works.
- Only matched evidence snippets are sent to hosted AI.
- Successful answer returns normally even if learning-event persistence fails.
- Runtime learning event is user-private.
- Model output remains a hypothesis until reviewed/promoted.

## Evolution

- Protected paths remain blocked.
- Candidate code writes only in detached worktree.
- Candidate must pass TypeScript.
- Development + sealed + regression gates pass.
- Measured improvement exceeds anti-churn threshold.
- Human approval exists.
- Tested HEAD equals current HEAD at promotion.
- Rollback target is a known stable snapshot.

## Deployment

- Run TypeScript.
- Run project build/tests used by the repository.
- Run secret scan.
- Stage exact files only.
- Never `git add .`.
- Deploy.
- Perform live acceptance.
- Remove `.lingxi-backup-*` only after live acceptance.
