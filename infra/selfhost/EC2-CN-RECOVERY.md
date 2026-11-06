# Chinese mainland site recovery: secure production-config import

Only after the new ec4edd package is unpacked. Never paste tokens, service keys, dotenv text, or Vercel credentials into ChatGPT.

The recovery source is the user's existing production Vercel project, not GitHub secrets or a fresh Supabase project.

1. Upload or fetch the checked-in scripts to /root, verify Git blob SHA before executing.
2. Run the secure environment import script interactively as root on the ECS. The script uses the official Vercel CLI, links to a known project ID, triggers account verification if required, and pulls production variables into a 0600 file with a backup. It never prints values, changes DNS, or restarts the public service.
3. Use env audit to verify browser auth, Supabase admin, private R2, SASI worker and document gateway names. Presence does NOT confirm validity or provider response.
4. Staging systemd service on 127.0.0.1:3189 runs new release with the private EnvironmentFile. It probes local /api/health, pages and expects /api/tools/jobs to reject unauthenticated requests with 401.
5. Do NOT switch public 3188 or payments until a true authenticated sign-in/out, file upload-export-reopen, R2 private access, SASI vendor job, production callback signature and idempotent order reconciliation have been checked.
6. Disable unnecessary old staging port 3187 after parity verified to conserve memory. Don't interrupt /etc/nginx/conf.d/document-gateway or its localhost:3100 process.
7. Supabase keys and webhook secrets must remain on ECS only; credential leaks require rotation.

Vercel CLI: https://vercel.com/docs/cli/env
