#!/usr/bin/env bash
# Lingxifield .cn: guarded recovery of two missing *public* Supabase runtime env vars.
# NO real credentials, service-role keys, payment settings, DNS or Nginx changes.
# --plan is completely read-only; --apply-auth-only preserves a rollback backup.
set -Eeuo pipefail
umask 077
if [[ "$#" -ne 1 || ( "$1" != "--plan" && "$1" != "--apply-auth-only" ) ]]; then
  echo "USAGE: bash cn-main-auth-public-env-repair.sh --plan|--apply-auth-only"
  exit 2
fi
MODE="$1"
if [[ "$(id -u)" != 0 ]]; then echo CN_AUTH_REPAIR_ROOT_REQUIRED; exit 2; fi
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
PROD=/etc/lingxifield/production.env
STAGE=/etc/lingxifield/staging.env
SERVICE=lingxifield-ecs
STAGE_SERVICE=lingxifield-cn-stage
test -x "$NODE" && test -s "$PROD" && test -s "$STAGE"
test ! -L "$PROD" && test ! -L "$STAGE"
for name in "$SERVICE" "$STAGE_SERVICE"; do
  systemctl is-active --quiet "$name" || { echo "CN_AUTH_SERVICE_INACTIVE=$name"; exit 3; }
done
p_env="$(systemctl show -p EnvironmentFiles --value "$SERVICE")"
s_env="$(systemctl show -p EnvironmentFiles --value "$STAGE_SERVICE")"
[[ "$p_env" == *"$PROD"* ]] || { echo CN_AUTH_PRODUCTION_FILE_NOT_REFERENCED; exit 3; }
[[ "$s_env" == *"$STAGE"* ]] || { echo CN_AUTH_STAGING_FILE_NOT_REFERENCED; exit 3; }
unit_env="$(systemctl show -p Environment --value "$SERVICE")"
if [[ "$unit_env" == *NEXT_PUBLIC_SUPABASE_URL* || "$unit_env" == *NEXT_PUBLIC_SUPABASE_ANON_KEY* ]]; then
  echo CN_AUTH_UNIT_OVERRIDE_REQUIRES_REVIEW
  exit 3
fi
prod_work="$(systemctl show -p WorkingDirectory --value "$SERVICE")"
stage_work="$(systemctl show -p WorkingDirectory --value "$STAGE_SERVICE")"
[[ -n "$prod_work" && -n "$stage_work" && "$prod_work" != "$stage_work" ]] ||
  { echo CN_AUTH_STAGE_PRODUCTION_COLLISION; exit 3; }

probe_code() {
  local port="$1" route="$2"
  curl --noproxy '*' --silent --show-error --max-time 15 \
    -H 'Host: lingxifield.cn' -H 'X-Forwarded-Host: lingxifield.cn' \
    -H 'X-Forwarded-Proto: https' -o /dev/null -w '%{http_code}' \
    "http://127.0.0.1:$port$route" || true
}
test "$(probe_code 3188 /api/health)" = 200 ||
  { echo CN_AUTH_PRODUCTION_UNHEALTHY_ABORT; exit 4; }
test "$(probe_code 3189 /api/health)" = 200 ||
  { echo CN_AUTH_STAGE_HEALTH_FAILED; exit 4; }
test "$(probe_code 3189 /api/sasi/account)" = 401 ||
  { echo CN_AUTH_STAGE_SASI_BOUNDARY_NOT_READY; exit 4; }
test "$(probe_code 3189 /api/tools/jobs)" = 401 ||
  { echo CN_AUTH_STAGE_TOOL_BOUNDARY_NOT_READY; exit 4; }
echo CN_AUTH_STAGING_ANONYMOUS_BOUNDARIES_PASS

edit_env() {
  "$NODE" - "$1" <<'NODEJS'
const fs=require("node:fs");
const {parseEnv}=require("node:util");
const stage="/etc/lingxifield/staging.env";
const prod="/etc/lingxifield/production.env";
const mode=process.argv[2];
const names=["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const st=fs.lstatSync(prod),sp=fs.lstatSync(stage);
if(!st.isFile()||!sp.isFile()||st.isSymbolicLink()||sp.isSymbolicLink()||
   st.uid!==0||sp.uid!==0||(st.mode&0o077)!==0||(sp.mode&0o077)!==0)
  throw Error("CN_AUTH_ENV_FILE_PERMISSIONS_INVALID");
const raw=fs.readFileSync(prod,"utf8");
const original=parseEnv(raw),source=parseEnv(fs.readFileSync(stage,"utf8"));
if(source.NEXT_PUBLIC_SUPABASE_URL!=="https://sxsgdpqojepgbbrxrzlq.supabase.co" ||
  typeof source.NEXT_PUBLIC_SUPABASE_ANON_KEY!=="string" ||
  !/^[A-Za-z0-9._-]{20,4096}$/.test(source.NEXT_PUBLIC_SUPABASE_ANON_KEY))
  throw Error("CN_AUTH_STAGING_PUBLIC_CONFIG_INVALID");
const missing=[];
for(const name of names) {
  if(original[name] && original[name]!==source[name])
    throw Error("CN_AUTH_PRODUCTION_VALUE_DIFFERS_REVIEW_REQUIRED:"+name);
  if(!original[name]) missing.push(name);
}
console.log("CN_AUTH_MISSING_PUBLIC_NAMES="+(missing.join(",")||"none"));
if(mode==="plan") {
  console.log("CN_AUTH_PLAN_ONLY_NO_PRODUCTION_CHANGE");
  process.exit(0);
}
if(mode!=="apply") throw Error("INVALID_MODE");
if(missing.length===0) throw Error("CN_AUTH_PUBLIC_ENV_ALREADY_PRESENT_CHECK_PROCESS_AND_BUILD");
const newText=raw.replace(/\s*$/,"")+"\n"+
  missing.map(name=>name+"="+source[name]).join("\n")+"\n";
const temp=prod+".auth-candidate-"+process.pid;
try {
  fs.writeFileSync(temp,newText,{flag:"wx",mode:0o600});
  fs.chownSync(temp,st.uid,st.gid);
  fs.renameSync(temp,prod);
} catch(e) {
  try{fs.unlinkSync(temp)}catch{}
  throw e;
}
console.log("CN_AUTH_PUBLIC_ENV_UPDATED_WITHOUT_VALUE_OUTPUT");
NODEJS
}
edit_env plan
if [[ "$MODE" == "--plan" ]]; then exit 0; fi

backup="/etc/lingxifield/production.env.auth-$(date -u +%Y%m%dT%H%M%SZ)-$$.bak"
cp -p -- "$PROD" "$backup"
chmod 600 "$backup"
restoring=1
completed=0
rollback() {
  rc="$?"
  trap - EXIT
  if [[ "$restoring" == 1 && "$completed" == 0 ]]; then
    echo CN_AUTH_REPAIR_FAILED_RESTORING_PRODUCTION_ENV
    cp -p -- "$backup" "$PROD" || true
    chmod 600 "$PROD" || true
    systemctl restart "$SERVICE" || true
    echo CN_AUTH_PRODUCTION_ENV_ROLLBACK_ATTEMPTED
  fi
  exit "$rc"
}
trap rollback EXIT
edit_env apply
systemctl restart "$SERVICE"
ready=0
for attempt in $(seq 1 35); do
  if [[ "$(probe_code 3188 /api/health)" == 200 ]] &&
     [[ "$(probe_code 3188 /api/sasi/account)" == 401 ]] &&
     [[ "$(probe_code 3188 /api/tools/jobs)" == 401 ]]; then
    ready=1
    break
  fi
  sleep 1
done
[[ "$ready" == 1 ]] || { echo CN_AUTH_PRODUCTION_ANONYMOUS_GATE_FAILED; exit 5; }
# One deliberately nonexistent account verifies the live server can reach
# Supabase using the restored public pair. No real user or password is used.
headers="$(curl --noproxy '*' --silent --show-error --max-time 25 -D - -o /dev/null \
  -X POST -H 'Host: lingxifield.cn' -H 'X-Forwarded-Host: lingxifield.cn' \
  -H 'X-Forwarded-Proto: https' -H 'Origin: https://lingxifield.cn' \
  -H 'Sec-Fetch-Site: same-origin' --data-urlencode 'mode=signin' \
  --data-urlencode 'email=auth-check-20261107@invalid.example' \
  --data-urlencode 'password=DeliberatelyInvalidPassword2026' \
  http://127.0.0.1:3188/account/auth || true)"
status="$(printf '%s\n' "$headers" | head -1 | tr -d '\r')"
location="$(printf '%s\n' "$headers" | grep -i '^location:' | head -1 | tr -d '\r' || true)"
[[ "$status" == *303* && "$location" == *auth_error=credentials* ]] ||
  { echo CN_AUTH_REAL_SUPABASE_NEGATIVE_LOGIN_FAILED; exit 6; }
systemctl is-active --quiet "$STAGE_SERVICE" ||
  { echo CN_AUTH_STAGING_WAS_DISTURBED; exit 7; }
completed=1
trap - EXIT
echo CN_AUTH_RUNTIME_PUBLIC_CONFIG_RECOVERED
echo "CN_AUTH_BACKUP_PATH=$backup"
echo CN_AUTH_REAL_USER_LOGIN_AND_BROWSER_BUILD_STILL_REQUIRE_VALIDATION
