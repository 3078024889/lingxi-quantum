# Visitor feedback HMAC provisioning — 2026-11-01

## Why this setup exists

The public feedback API signs every submission with `AI_MARKET_FEEDBACK_HMAC_KEY`. PostgreSQL independently verifies that signature against `private.ai_market_feedback_signing_key`. These two values must match. The database migration intentionally creates a random initial value; setting only the application environment variable is not enough.

The new provisioning RPC is callable only with a Supabase `service_role` JWT. It validates a 32-byte lowercase hexadecimal key, updates the private table, and returns only `{"configured":true}`. Anonymous and authenticated users cannot execute it.

## One-time setup

1. Generate a fresh random key locally. PowerShell:

   ```powershell
   $FeedbackKey = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).ToLowerInvariant()
   ```

   Keep this value in the current terminal only. Do not paste it into chat, GitHub files, screenshots, SQL history or a public issue.

2. In the hosting provider's server-side environment variables, set:

   - `AI_MARKET_SUPABASE_URL`
   - `AI_MARKET_PUBLISHABLE_KEY`
   - `AI_MARKET_FEEDBACK_HMAC_KEY` = the generated value

   Do not use a `NEXT_PUBLIC_` prefix for the HMAC key.

3. From a trusted local terminal, set the same Supabase URL and key, plus the service-role key:

   ```powershell
   $env:AI_MARKET_SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
   $env:AI_MARKET_SERVICE_ROLE_KEY = "YOUR_SERVICE_ROLE_KEY"
   $env:AI_MARKET_FEEDBACK_HMAC_KEY = $FeedbackKey
   node .\scripts\provision-feedback-key.mjs
   ```

   The service-role key is used only by this one-time CLI request. Never add it to Vercel/Netlify public variables, frontend code, or Git.

4. Confirm the CLI prints `FEEDBACK_HMAC_KEY_PROVISIONED`. This confirms the restricted database RPC accepted the configuration; it does not by itself prove the public form works.

5. Redeploy the app with the same `AI_MARKET_FEEDBACK_HMAC_KEY` value. Submit a test comment from the public form, confirm it appears in the private moderation queue, approve it, and verify only the approved entry appears publicly.

## Security properties

- HMAC secret is 32 random bytes; only its lowercase hexadecimal representation is shared between server environment and private database.
- The provisioning RPC is `SECURITY DEFINER`, has an empty search path, checks the signed JWT role claim for `service_role`, and is not executable by `public`, `anon` or `authenticated`.
- Feedback signature verification uses a fixed 64-iteration comparison instead of exiting on the first mismatching character.
- The CLI never prints or persists the key. Its success response contains only the configured flag and endpoint host.
- Public feedback remains pending until an authorized moderator approves it. No review is fabricated.
- If either side is missing or mismatched, feedback submission fails closed with `FEEDBACK_NOT_AVAILABLE`; the public form must not claim the feedback was saved.

## Rotation

Generate a new key, update the hosting environment variable, run the CLI with that same new value, then redeploy. Coordinate the change in one maintenance window; the old and new keys are not accepted simultaneously.
