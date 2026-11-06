#!/usr/bin/env bash
# Migrates EXISTING Vercel production config to private ECS file.
# Requires one interactive Vercel account approval. Never prints secrets.
# Does NOT change Nginx, active Next.js process, DNS or payments.
set -Eeuo pipefail
umask 077
[ "$(id -u)" -eq 0 ] || { echo RUN_AS_ROOT; exit 1; }
N=/opt/lingxifield/runtime/node-24.19.0
[ -x "$N/bin/node" ] && [ -x "$N/bin/npx" ] || { echo NODE_NPX_MISSING; exit 2; }
export PATH="$N/bin:$PATH"
D=/opt/lingxifield/ops/vercel-cn
ENV=/etc/lingxifield/production.env
mkdir -p "$D/.vercel" /etc/lingxifield
chmod 700 "$D" "$D/.vercel" /etc/lingxifield
printf '%s\n' '{"orgId":"team_Bn6lqQau6e7MTvJ0JE4q8NkS","projectId":"prj_R2HMsUOG4DL0AK3kaHmOrcTpBT9f"}' > "$D/.vercel/project.json"
chmod 600 "$D/.vercel/project.json"
cd "$D"
echo "=== Vercel CLI authentication (official account flow) ==="
if ! npx --yes vercel whoami >/dev/null 2>&1; then
 echo "COMPLETE_VERCEL_ACCOUNT_LOGIN_IN_BROWSER"
 npx --yes vercel login
fi
echo "=== Pulling production environment, credentials never printed ==="
TMP=$(mktemp /etc/lingxifield/.production.XXXXXXXX)
trap 'rm -f "$TMP"' EXIT
npx --yes vercel env pull "$TMP" --environment=production --yes
test -s "$TMP" || { echo EMPTY_ENV_ABORT; exit 3; }
echo "=== Critical variable audit (names only) ==="
node /root/lingxifield-cn-env-audit.cjs "$TMP"
if [ -e "$ENV" ]; then
 cp -a "$ENV" "/etc/lingxifield/production.env.backup.$(date +%Y%m%d-%H%M%S)"
fi
chmod 600 "$TMP"
mv "$TMP" "$ENV"
trap - EXIT
echo 'ECS_PRODUCTION_ENV_IMPORTED_DO_NOT_PRINT_FILE'
echo 'ACTIVE_SITE_NOT_RESTARTED'
