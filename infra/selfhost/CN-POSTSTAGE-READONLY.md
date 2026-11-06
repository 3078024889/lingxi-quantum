# CN 3189 poststage read-only checks

Script: `scripts/ops/ecs-cn-poststage-check.mjs`.
Run using Node 24 as root after `CN_STAGING_BASIC_TESTS_PASSED_NOT_FULL_FUNCTION_VERIFIED`.

- Does **not** read or write order data; Supabase admin probe requests zero result rows (`limit=0`). Uses the `apikey` header, not a bearer token, for new `sb_secret_...` keys.
- Validates the specific Supabase project and `lingxifield.cn` site value; prints only HTTP codes and readiness statuses.
- Checks original private doc gateway on localhost port 3100.
- Checks SASI worker reachability and the **actual** `SASI_COMPUTE_WORKER_URL` and `SASI_COMPUTE_WORKER_SECRET` keys, distinct from other SASI secrets. No generation jobs submitted.
- R2 test issues a short-lived, SigV4-signed HEAD against an unpredictable missing object. A 404 typically indicates authenticated bucket read access, **not** proof of upload/download/delete rights; 401/403 indicates additional access debugging is needed. No R2 objects are created or deleted.
- Optional `--engines` calls the server's tool engine probe. Avoid this on 2 GB ECS during production traffic unless resource budget permits.
- Do not log environment variables, signed R2 URLs, API tokens, session JWTs, or returned customer data.
- No payment/webhook tests or public 3188 switch are performed by this script.

Supabase API key docs: https://supabase.com/docs/guides/getting-started/api-keys
