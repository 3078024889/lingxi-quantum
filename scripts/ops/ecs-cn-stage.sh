#!/usr/bin/env bash
# Readiness staging: no DNS, Nginx, payments, or 3188 changes.
set -Eeuo pipefail
test "$(id -u)" = 0
test -s /opt/lingxifield/releases/cn-pr199/server.js || { echo 'NEW_RELEASE_MISSING'; exit 2; }
test -s /etc/lingxifield/production.env || { echo 'PRODUCTION_ENV_MISSING'; exit 3; }
test -s /opt/lingxifield/runtime/node-24.19.0/bin/node
id lingxifield >/dev/null 2>&1
chmod 600 /etc/lingxifield/production.env
install -d -m 750 -o lingxifield -g lingxifield /opt/lingxifield/releases/cn-pr199/.next/cache
if ss -ltn | grep -qE '127[.]0[.]0[.]1:3189[[:space:]]'; then
 echo 'STAGING_PORT_OCCUPIED'; exit 4
fi
install -m 644 /root/lingxifield-cn-stage.service /etc/systemd/system/lingxifield-cn-stage.service
systemctl daemon-reload
systemctl start lingxifield-cn-stage
ready=0
for i in $(seq 1 25); do
 if curl --noproxy '*' --silent --max-time 3 --fail http://127.0.0.1:3189/api/health | grep -q '"ok":true'; then
  ready=1; break
 fi
 sleep 1
done
if [ "$ready" != 1 ]; then
 echo 'STAGE_HEALTH_FAILED'; exit 5
fi
for route in / /tools /siai; do
 code=$(curl --noproxy '*' --silent --max-time 10 -o /dev/null -w '%{http_code}' "http://127.0.0.1:3189$route")
 echo "$route HTTP=$code"
 [ "$code" = 200 ] || exit 6
done
code=$(curl --noproxy '*' --silent --max-time 10 -o /dev/null -w '%{http_code}' 'http://127.0.0.1:3189/api/tools/jobs')
echo "UNAUTHENTICATED_JOBS_HTTP=$code"
[ "$code" = 401 ] || { echo 'AUTH_BOUNDARY_NOT_CONFIRMED'; exit 7; }
echo 'CN_STAGING_BASIC_TESTS_PASSED_NOT_FULL_FUNCTION_VERIFIED'
