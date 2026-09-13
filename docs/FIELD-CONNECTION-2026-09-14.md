# Field connection and report deletion — 2026-09-14

- Replaced account connection explanation and day/month/year cards using approved copy. Added four-part field relationship and a real how-it-works guide. Shared membership titles, descriptions and button labels now match.
- Invitation generation button uses white background and blue text.
- Nine report types have confirmation, pending/error feedback and immediate row removal after success. Payment records are not deleted. Removed account-read archetype creation side effect.
- New deletion API validates same origin, authentication, fixed product table allowlist, UUID, account ownership and archetype product scope.
- Validation: production build passed before final copy/style refinements; TypeScript and mocked API regression checks passed; actual membership component rendered in Edge at 1440 and 390 px without horizontal overflow. This isolated component check is not an authenticated account end-to-end test. No real customer report was deleted.
- ECS: https://lingxifield.cn returned HTTP 200 through nginx/1.24.0 on this check. Intermittent 502 root cause remains unconfirmed because server logs/session are unavailable. Do not represent this response as a server fix.
