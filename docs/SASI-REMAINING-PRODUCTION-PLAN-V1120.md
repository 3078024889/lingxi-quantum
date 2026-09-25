# SASI Remaining Production Plan after V11.20

The first-generation conceptual architecture is sufficiently complete. Remaining work is production acceptance:

1. Reconcile every local SASI migration against production dependencies.
2. Apply missing migrations in timestamp order only after review.
3. Verify RLS, policies, foreign keys, repository column compatibility.
4. Run Book SASI end-to-end: reserve -> provider -> settle -> answer -> private learning event -> feedback.
5. Run evolution acceptance: failure -> hypothesis -> candidate -> sandbox -> dev -> sealed -> regression -> measured improvement -> human approval -> promotion snapshot -> observation -> rollback plan.
6. Review SECURITY DEFINER grants, same-origin guards, operator allowlist, Auth password protections, secret scan.
7. Full TypeScript/build/tests, exact-path staging, never `git add .`, deploy, live acceptance, then backup cleanup.
