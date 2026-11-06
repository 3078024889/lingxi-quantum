#!/usr/bin/env bash
# Isolated CN 3189 restart to load verified R2 staging.env changes.
# No Nginx, DNS, database or 3188 changes. Fails closed on unexpected config.
set -Eeuo pipefail
umask 077
if [ "$(id -u)" != "0" ] || [ "$#" != 1 ] || [ "$1" != "--restart-3189-only" ]; then
  echo 'USE: bash ecs-cn-stage-r2-reload.sh --restart-3189-only (root)'
  exit 2
fi
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
STAGE=lingxifield-cn-stage
PROD=lingxifield-ecs
test -x "$NODE"
test -s /etc/lingxifield/staging.env
systemctl is-active --quiet "$PROD" || { echo CN_3188_INACTIVE_ABORT; exit 3; }
systemctl is-active --quiet "$STAGE" || { echo CN_3189_INACTIVE_ABORT; exit 3; }
test "$(systemctl show -p WorkingDirectory --value "$STAGE")" = /opt/lingxifield/releases/cn-pr199 || {
 echo CN_3189_PATH_MISMATCH_ABORT; exit 3;
}
case "$(systemctl show -p EnvironmentFiles --value "$STAGE")" in
 *"/etc/lingxifield/staging.env"*) ;;
 *) echo CN_3189_ENV_ISOLATION_ABORT; exit 3;;
esac
prod_pid="$(systemctl show -p MainPID --value "$PROD")"
test "$prod_pid" -gt 1 || { echo CN_3188_PID_INVALID_ABORT; exit 3; }
"$NODE" -e '
const {readFileSync}=require("node:fs"),{parseEnv}=require("node:util");
const e=parseEnv(readFileSync("/etc/lingxifield/staging.env","utf8"));
const url=new URL(e.R2_ENDPOINT||"");
const id=(e.R2_ACCOUNT_ID||"").trim().toLowerCase();
const hosts=[id+".r2.cloudflarestorage.com",...["eu","us","fedramp"].map(x=>id+"."+x+".r2.cloudflarestorage.com")];
if(e.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.cn"||
 e.NEXT_PUBLIC_SUPABASE_URL!=="https://sxsgdpqojepgbbrxrzlq.supabase.co"||
 ["ALIPAY_ENABLED","WECHAT_MINI_VPAY_TOPUPS_ENABLED","WECHAT_MINI_VPAY_TOOLS_ENABLED"].some(x=>e[x]!=="false")||
 !/^[a-f0-9]{32}$/.test(id)||!hosts.includes(url.hostname)||
 url.protocol!=="https:"||url.pathname!=="/"||url.search||url.hash||
 !e.R2_ACCESS_KEY_ID||!e.R2_SECRET_ACCESS_KEY||!e.R2_BUCKET_PRIVATE_BURN){
 console.log("CN_3189_R2_AND_ISOLATION_CHECK_FAILED");process.exit(3);
}
console.log("CN_3189_R2_AND_ISOLATION_CHECK_PASS");
'
echo CN_3189_RESTART_RELOAD_R2_BEGIN
systemctl restart "$STAGE"
healthy=0
for _ in $(seq 1 45); do
  code="$(curl --noproxy '*' -sS --max-time 3 -o /dev/null -w '%{http_code}' http://127.0.0.1:3189/api/health 2>/dev/null || true)"
  if [ "$code" = 200 ]; then healthy=1; break; fi
  sleep 1
done
if [ "$healthy" != 1 ]; then echo CN_3189_HEALTH_AFTER_RESTART_FAILED; exit 5; fi
for route in / /tools /siai; do
  code="$(curl --noproxy '*' -sS --max-time 15 -o /dev/null -w '%{http_code}' "http://127.0.0.1:3189$route" 2>/dev/null || true)"
  if [ "$code" != 200 ]; then echo "CN_3189_ROUTE_AFTER_RESTART_FAILED_$route"; exit 5; fi
done
auth="$(curl --noproxy '*' -sS --max-time 10 -o /dev/null -w '%{http_code}' http://127.0.0.1:3189/api/tools/jobs 2>/dev/null || true)"
if [ "$auth" != 401 ]; then echo CN_3189_NOAUTH_BOUNDARY_FAILED; exit 5; fi
if ! systemctl is-active --quiet "$PROD" || [ "$(systemctl show -p MainPID --value "$PROD")" != "$prod_pid" ]; then
 echo CN_3188_PRODUCTION_STATUS_CHANGED_ALERT;exit 6
fi
systemctl is-active --quiet "$STAGE" || { echo CN_3189_INACTIVE_AFTER_RESTART; exit 5; }
echo CN_3189_R2_ENV_RELOADED_ROUTES_AND_AUTH_PASS_PRODUCTION_3188_UNCHANGED
