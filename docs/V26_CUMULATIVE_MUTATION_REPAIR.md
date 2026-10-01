# LINGXIFIELD V26 — Full Cumulative Mutation Repair

V25 exposed a third class of cumulative patch duplication:
`metadata?:Record<string,unknown>|null;` in `lib/tools/payment-recovery.ts`
was inserted repeatedly by V22–V25 partial installs.

V26 changes the repair strategy from "fix the latest duplicate" to "canonicalize every historically patched paid-recovery source before build".

Key invariant:
- payment-recovery metadata type field: exactly 1
- quote select metadata field: exactly 1
- recovery return metadata assignment: exactly 1
- PDF draft state declarations: exactly 1
- PDF nearby draft-id redeclaration: 0
- export quote query: exactly 1
- task-draft mismatch guard: exactly 1
- hard-coded public tool count 64: 0

`audit:v26-cumulative` runs before `next build`.

Warnings from Next.js `no-img-element` or React exhaustive-deps remain warnings and do not cause the build failure described here.
Food-calorie internals are not modified.
