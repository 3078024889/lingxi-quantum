#!/usr/bin/env bash
# CN3194 production release. Port 3195 is temporary blue/green staging only;
# final production and payment activation stay on 3194; 3193 remains rollback baseline.
set -Eeuo pipefail
MODE="${1:-}"; TAG="${2:-}"
case "$MODE" in --plan|--stage-local|--verify-stage|--promote|--rollback) ;; *) echo "USAGE: $0 --plan|--stage-local|--verify-stage|--promote|--rollback __TAG__" >&2;exit 2;; esac
[[ "$TAG" == "__TAG__" ]] || { echo EXACT_RELEASE_TAG_REQUIRED >&2;exit 2; }
SHORT="__SHORT__"
EXPECTED_SHA="__SOURCE_SHA__"
EXPECTED_ARCHIVE_SHA="__ARCHIVE_SHA__"
EXPECTED_ARCHIVE_BYTES="__ARCHIVE_BYTES__"
[[ "$EUID" == 0 ]] || { echo ROOT_REQUIRED >&2;exit 1; }
exec 9>/run/lock/lingxifield-cn-standalone-release.lock
flock -n 9 || { echo ANOTHER_CN_RELEASE_IS_RUNNING >&2;exit 1; }

NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
ENV=/etc/lingxifield/production.env
NGINX=/etc/nginx/conf.d/lingxifield.conf
BASE=/opt/lingxifield/cn-staged-releases
PORT=3195
FINAL_PORT=3194
FILE="__ARCHIVE_FILE__"
CHECK="__CHECK_FILE__"
NEW_SVC="lingxifield-cn-release-20261110-$SHORT"
UNIT="/etc/systemd/system/$NEW_SVC.service"
FINAL_SVC="${NEW_SVC}-final"
FINAL_UNIT="/etc/systemd/system/$FINAL_SVC.service"
STAGE_ENV="/etc/lingxifield/staging-3195-$SHORT.env"
PROD_FLAGS="/etc/lingxifield/tool-pass-3194-$SHORT.env"
NGINX_BACKUP="$NGINX.before-cn3194-$SHORT"
UNIT_BACKUP="$UNIT.rollback-$SHORT"
ACTIVE_PORT=""
OLD_SVC=""
LIVE_ENV_FILES=()

safe_env(){
 [[ -f "$ENV" && ! -L "$ENV" && "$(stat -c %u "$ENV")" == 0 && "$(stat -c %a "$ENV")" == 600 ]] || {
  echo PRODUCTION_ENV_NOT_ROOT_MODE_600 >&2;exit 1;
 }
 grep -q '^SUPABASE_SECRET_KEY=sb_secret_' "$ENV" || { echo VALIDATED_SUPABASE_SECRET_NOT_PRESENT >&2;exit 1; }
}

active_port(){
 python3 - "$NGINX" <<'PY'
import re,sys
b=open(sys.argv[1],"rb").read()
p=re.findall(rb'(?m)^\s*(?:proxy_pass\s+http://|server\s+)127\.0\.0\.1:(3193|3194)(?:;|\s)',b)
u=set(p)
if len(p)!=1 or len(u)!=1: raise SystemExit("CN_ACTIVE_NGINX_UPSTREAM_NOT_EXACTLY_ONE_3193_OR_3194")
print(next(iter(u)).decode())
PY
}

set_nginx_upstream(){
 local target="$1"
 python3 - "$NGINX" "$target" <<'PY'
import os,re,sys,tempfile
path,target=sys.argv[1:3]
if target not in ("3193","3194","3195"):raise SystemExit("CN_NGINX_TARGET_PORT_INVALID")
old=open(path,"rb").read()
matches=list(re.finditer(rb'(?m)^\s*(?:proxy_pass\s+http://|server\s+)127\.0\.0\.1:(3193|3194|3195)(?:;|\s)',old))
if len(matches)!=1:raise SystemExit("CN_NGINX_UPSTREAM_NOT_EXACTLY_ONE")
old_port=matches[0].group(1)
new=old.replace(b"127.0.0.1:"+old_port,b"127.0.0.1:"+target.encode(),1)
st=os.stat(path)
fd,tmp=tempfile.mkstemp(prefix=".cn3194-upstream-",dir=os.path.dirname(path))
try:
 os.fchmod(fd,st.st_mode&0o777);os.fchown(fd,st.st_uid,st.st_gid)
 with os.fdopen(fd,"wb") as f:f.write(new);f.flush();os.fsync(f.fileno())
 os.replace(tmp,path)
finally:
 if os.path.exists(tmp):os.unlink(tmp)
PY
 nginx -t && systemctl reload nginx
}

find_service_for_port(){
 local port="$1" unit file
 while read -r unit;do
  [[ "$unit" == lingxifield-cn-release-* ]] || continue
  if systemctl cat "$unit" 2>/dev/null | grep -Eq "^[[:space:]]*Environment=PORT=$port([[:space:]]|$)";then
   systemctl is-active --quiet "$unit" && { printf '%s\n' "$unit";return 0; }
  fi
  while read -r file;do
   [[ -f "$file" && ! -L "$file" ]] || continue
   if grep -Fxq "PORT=$port" "$file";then
    systemctl is-active --quiet "$unit" && { printf '%s\n' "$unit";return 0; }
   fi
  done < <(systemctl show "$unit" -p EnvironmentFiles --value | python3 -c 'import re,sys;print("\n".join(re.findall(r"(/[^\s()]+\.env)\s+\(ignore_errors=(?:yes|no)\)",sys.stdin.read())))')
 done < <(systemctl list-units --type=service --state=active --no-legend | awk '{print $1}')
 return 1
}

old_live(){
 [[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo NGINX_CONFIG_NOT_REGULAR >&2;exit 1; }
 ACTIVE_PORT="$(active_port)"
 OLD_SVC="$(find_service_for_port "$ACTIVE_PORT")" || { echo "ACTIVE_OLD_SERVICE_NOT_FOUND_FOR_PORT:$ACTIVE_PORT" >&2;exit 1; }
 systemctl is-active --quiet "$OLD_SVC" || { echo ACTIVE_OLD_SERVICE_NOT_RUNNING >&2;exit 1; }
 local old_dir old_sha health
 old_dir="$(systemctl show "$OLD_SVC" -p WorkingDirectory --value)"
 [[ "$old_dir" =~ ^/opt/lingxifield/cn-staged-releases/[a-f0-9]{40}$ ]] || { echo ACTIVE_OLD_WORKDIR_INVALID >&2;exit 1; }
 test -s "$old_dir/RELEASE_SOURCE_SHA" || { echo ACTIVE_OLD_SOURCE_SHA_MISSING >&2;exit 1; }
 old_sha="$(tr -d '\r\n' < "$old_dir/RELEASE_SOURCE_SHA")"
 [[ "$old_sha" =~ ^[a-f0-9]{40}$ ]] || { echo ACTIVE_OLD_SOURCE_SHA_INVALID >&2;exit 1; }
 health="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 12 -o /dev/null -w '%{http_code}' -H 'Host: lingxifield.cn' "http://127.0.0.1:$ACTIVE_PORT/api/health" || true)"
 [[ "$health" == 200 ]] || { echo "ACTIVE_OLD_HEALTH_FAILED:$ACTIVE_PORT:$health" >&2;exit 1; }
 echo "CN3195_ACTIVE_BASELINE_PASS port=$ACTIVE_PORT service=$OLD_SVC source=$old_sha"
}

load_env_files(){
 SOURCE_ENV_SVC="$(find_service_for_port 3194 || true)"
 [[ -n "$SOURCE_ENV_SVC" ]] || { echo CN3194_SOURCE_SERVICE_NOT_ACTIVE >&2;exit 1; }
 mapfile -t LIVE_ENV_FILES < <(
  systemctl show "$SOURCE_ENV_SVC" -p EnvironmentFiles --value |
   python3 -c 'import re,sys
s=sys.stdin.read()
for p in re.findall(r"(/[^\s()]+\.env)\s+\(ignore_errors=(?:yes|no)\)",s): print(p)'
 )
 (( ${#LIVE_ENV_FILES[@]} >= 1 && ${#LIVE_ENV_FILES[@]} <= 16 )) || { echo CN3194_SOURCE_ENVFILE_COUNT_INVALID >&2;exit 1; }
 [[ "${#LIVE_ENV_FILES[@]}" -eq "$(printf '%s\n' "${LIVE_ENV_FILES[@]}" | sort -u | wc -l)" ]] || { echo CN3194_SOURCE_ENVFILE_DUPLICATE >&2;exit 1; }
 for f in "${LIVE_ENV_FILES[@]}";do
  [[ "$f" =~ ^/etc/lingxifield/[a-zA-Z0-9_.-]+\.env$ && -f "$f" && ! -L "$f" && "$(stat -c %u "$f")" == 0 ]] || {
   echo CN3194_SOURCE_ENVFILE_UNSAFE >&2;exit 1;
  }
 done
 echo "CN3194_SOURCE_ENVFILES_COUNT=${#LIVE_ENV_FILES[@]} SOURCE_SERVICE=$SOURCE_ENV_SVC"
}

code(){
 local path="$1" expected="$2" found
 found="$(curl -sS --noproxy '*' --max-time 18 -o /dev/null -w '%{http_code}' -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$PORT$path" || true)"
 echo "CN3195_CHECK $path $found"
 [[ "$found" == "$expected" ]]
}

redirect(){
 local path="$1" expected="$2" target="$3" headers status location
 headers="$(mktemp /run/cn3195-redirect-XXXXXX)"
 status="$(curl -sS --noproxy '*' --max-time 18 -D "$headers" -o /dev/null -w '%{http_code}' \
  -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$PORT$path" || true)"
 location="$(awk 'tolower($1)=="location:" {sub(/\r$/,"");sub(/^[^:]*:[[:space:]]*/,"");print}' "$headers" | tail -n1)"
 rm -f "$headers"
 echo "CN3195_REDIRECT_CHECK $path $status $location"
 [[ "$status" == "$expected" && "$location" == "$target" ]]
}

probe(){
 local ready=0
 for i in $(seq 1 25);do
  if code /api/health 200 >/dev/null;then ready=1;break;fi
  sleep 2
 done
 [[ "$ready" == 1 ]] || { echo CN3195_HEALTH_NOT_READY >&2;return 1; }
 code /api/health 200
 code / 200
 code /tools 200
 code /siai 200
 code /sasi 200
 code /discover/sasi-software-marketplace 200
 code /en/discover/mt5-ea-source-code 200
 code /ja/discover/software-licensing-delivery 200
 code /ko/discover/developer-software-publishing 200
 code /fr/discover/sasi-software-marketplace 200
 code /de/discover/mt5-ea-source-code 200
 code /es/discover/software-licensing-delivery 200
 code /pt/discover/developer-software-publishing 200
 code /ar/discover/sasi-software-marketplace 200
 code /llms.txt 200
 code /sitemap.xml 200
 code /robots.txt 200
 redirect /sasi/marketplace 308 /sasi
 redirect /sasi/assemble 308 /sasi
 redirect /sasi/build 308 /sasi
 redirect /sasi/chat 308 /sasi
 redirect /sasi/connections 308 /sasi
 redirect /sasi/director 308 /sasi
 redirect /sasi/drama 308 /sasi
 redirect /sasi/image 308 /sasi
 redirect /sasi/operator 308 /sasi
 redirect /sasi/operator/v5 308 /sasi
 redirect /sasi/project-dna 308 /sasi
 redirect /sasi/series 308 /sasi
 redirect /sasi/variants 308 /sasi
 redirect /ai-knowledge 308 /sasi
 redirect /ai-learning 308 /sasi
 redirect /ai-research 308 /sasi
 redirect /sasi/pricing 308 /ai-wallet
 code /api/sasi/generation/submit 410
 code /api/cron/sasi-v5-radar 410
 code /tools/pass 200
 code /ai-wallet 200
 code /account 200
 code /api/sasi/account 401
 code /api/tools/jobs 401
 code '/api/tools/access?toolSlug=compress-image' 401
 code /api/account/money-admin/access 200
 code /api/pay/providers 200
 code /api/site-announcements 200
 local wallet_html tools_html
 wallet_html="$(curl --noproxy '*' -fsS --max-time 25 -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$PORT/ai-wallet")"
 grep -Fq 'lx26-wallet-page' <<<"$wallet_html" || { echo CN3195_NEW_WALLET_UI_MISSING >&2;return 1; }
 tools_html="$(curl --noproxy '*' -fsS --max-time 25 -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$PORT/tools")"
 grep -Fq 'lx26-tools-page' <<<"$tools_html" || { echo CN3195_NEW_TOOLS_UI_MISSING >&2;return 1; }
 curl --noproxy '*' -fsS --max-time 20 -H 'Host: lingxifield.cn' "http://127.0.0.1:$PORT/api/tools/pass" |
  "$NODE" -e 'let s="";process.stdin.on("data",x=>s+=x).on("end",()=>{const j=JSON.parse(s),p=j.offers||[];if(p.length!==4||p.map(x=>x.price).join(",")!=="29,99,269,899")process.exit(3);console.log("CN3195_FOUR_TOOLPASS_OFFERS_PASS")})'
}


rollback_to_3193(){
 local reason="$1" health path status
 FALLBACK_SVC="$(find_service_for_port 3193 || true)"
 [[ -n "$FALLBACK_SVC" ]] || { echo CN3193_AUTOMATIC_ROLLBACK_SERVICE_NOT_FOUND >&2;return 1; }
 systemctl is-active --quiet "$FALLBACK_SVC" || { echo CN3193_AUTOMATIC_ROLLBACK_SERVICE_NOT_ACTIVE >&2;return 1; }
 health="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 12 -o /dev/null -w '%{http_code}' -H 'Host: lingxifield.cn' http://127.0.0.1:3193/api/health || true)"
 [[ "$health" == 200 ]] || { echo "CN3193_AUTOMATIC_ROLLBACK_HEALTH_FAILED:$health" >&2;return 1; }
 set_nginx_upstream 3193 || { echo CN3193_AUTOMATIC_ROLLBACK_NGINX_SWITCH_FAILED >&2;return 1; }
 for path in / /tools /siai /sasi /sasi/marketplace /tools/pass /ai-wallet /api/health;do
  status="$(curl -kfsSL --max-redirs 3 --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 --max-time 18 -o /dev/null -w '%{http_code}' "https://lingxifield.cn$path" || true)"
  echo "CN3193_AUTOMATIC_ROLLBACK_PUBLIC:$path:$status"
  [[ "$status" == 200 ]] || { echo CN3193_AUTOMATIC_ROLLBACK_PUBLIC_CHECK_FAILED >&2;return 1; }
 done
 systemctl stop "$FINAL_SVC" 2>/dev/null || true
 systemctl disable "$FINAL_SVC" 2>/dev/null || true
 systemctl stop "$NEW_SVC" 2>/dev/null || true
 systemctl disable "$NEW_SVC" 2>/dev/null || true
 if systemctl is-active --quiet "$FINAL_SVC" || systemctl is-active --quiet "$NEW_SVC" || systemctl is-enabled --quiet "$FINAL_SVC" || systemctl is-enabled --quiet "$NEW_SVC" || ss -lnt | grep -Eq '^LISTEN.*:3195[[:space:]]';then
  echo CN3193_AUTOMATIC_ROLLBACK_CANDIDATE_STOP_FAILED >&2;return 1
 fi
 echo "CN3193_AUTOMATIC_ROLLBACK_PASS reason=$reason service=$FALLBACK_SVC"
}

safe_env
if [[ "$MODE" == --rollback ]];then
 FALLBACK_SVC="$(find_service_for_port 3193)" || { echo CN3193_ROLLBACK_BASELINE_SERVICE_NOT_ACTIVE >&2;exit 1; }
 systemctl is-active --quiet "$FALLBACK_SVC" || { echo CN3193_ROLLBACK_BASELINE_NOT_ACTIVE >&2;exit 1; }
 health="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 12 -o /dev/null -w '%{http_code}' -H 'Host: lingxifield.cn' http://127.0.0.1:3193/api/health || true)"
 [[ "$health" == 200 ]] || { echo "CN3193_ROLLBACK_BASELINE_HEALTH_FAILED:$health" >&2;exit 1; }
 set_nginx_upstream 3193
 for path in / /tools /siai /sasi /sasi/marketplace /tools/pass /ai-wallet /api/health;do
  status="$(curl -kfsSL --max-redirs 3 --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 --max-time 18 -o /dev/null -w '%{http_code}' "https://lingxifield.cn$path" || true)"
  echo "CN3193_ROLLBACK_PUBLIC:$path:$status"
  [[ "$status" == 200 ]] || { echo CN3193_ROLLBACK_PUBLIC_CHECK_FAILED >&2;exit 1; }
 done
 OLD_3194_SVC="$(find_service_for_port 3194 || true)"
 if [[ -n "$OLD_3194_SVC" && "$OLD_3194_SVC" != "$FINAL_SVC" ]];then
  if systemctl is-enabled --quiet "$OLD_3194_SVC";then systemctl disable "$OLD_3194_SVC" >/dev/null || { echo CN3194_OLD_SERVICE_DISABLE_FAILED_DURING_ROLLBACK >&2;exit 1; };fi
  systemctl stop "$OLD_3194_SVC" || { echo CN3194_OLD_SERVICE_STOP_FAILED_DURING_ROLLBACK >&2;exit 1; }
 fi
 systemctl stop "$FINAL_SVC" 2>/dev/null || true
 systemctl disable "$FINAL_SVC" 2>/dev/null || true
 systemctl stop "$NEW_SVC" 2>/dev/null || true
 systemctl disable "$NEW_SVC" 2>/dev/null || true
 if systemctl is-active --quiet "$FINAL_SVC" || systemctl is-active --quiet "$NEW_SVC" || systemctl is-enabled --quiet "$FINAL_SVC" || systemctl is-enabled --quiet "$NEW_SVC" || ss -lnt | grep -Eq '^LISTEN.*:(3194|3195)[[:space:]]';then
  echo CN3193_ROLLBACK_CANDIDATE_STOP_FAILED >&2;exit 1
 fi
 echo "CN3193_ROLLBACK_BASELINE_ACTIVE service=$FALLBACK_SVC"
 echo "3194_CANDIDATE_STOPPED_FLAGS_AND_HISTORICAL_DATA_PRESERVED"
 exit 0
fi
old_live
load_env_files
[[ -x "$NODE" ]] || { echo NODE24_RUNTIME_NOT_FOUND >&2;exit 1; }

if [[ "$MODE" == --plan ]];then
 FALLBACK_SVC="$(find_service_for_port 3193)" || { echo CN3193_ROLLBACK_BASELINE_SERVICE_NOT_ACTIVE >&2;exit 1; }
 fallback_health="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 12 -o /dev/null -w '%{http_code}' -H 'Host: lingxifield.cn' http://127.0.0.1:3193/api/health || true)"
 [[ "$fallback_health" == 200 ]] || { echo CN3193_ROLLBACK_BASELINE_HEALTH_FAILED >&2;exit 1; }
 if ss -lnt | grep -Eq '^LISTEN.*:3195[[:space:]]';then echo CN3195_STAGE_PORT_ALREADY_IN_USE >&2;exit 1;fi
 [[ ! -e "$UNIT" && ! -e "$FINAL_UNIT" && ! -e "$STAGE_ENV" && ! -e "$PROD_FLAGS" ]] || { echo CN3194_CANDIDATE_ALREADY_EXISTS_NO_OVERWRITE >&2;exit 1; }
 echo "CN3194_DISK_AVAILABLE_BYTES=$(df -PB1 "$BASE" 2>/dev/null | awk 'END{print $4}')"
 free -h
 test "$(df -PB1 "$BASE" | awk 'END{print $4}')" -gt 2500000000 || { echo CN3194_INSUFFICIENT_FREE_DISK >&2;exit 1; }
 echo "CN3194_PLAN_READ_ONLY_ACTIVE_PORT=$ACTIVE_PORT ACTIVE_SERVICE=$OLD_SVC SOURCE_3194_SERVICE=$SOURCE_ENV_SVC FALLBACK_3193_SERVICE=$FALLBACK_SVC"
 exit 0
fi

if [[ "$MODE" == --verify-stage ]];then
 [[ -f "$UNIT" && ! -L "$UNIT" && -f "$STAGE_ENV" && ! -L "$STAGE_ENV" ]] || { echo CN3195_STAGE_FILES_MISSING >&2;exit 1; }
 grep -Fxq "Environment=PORT=3195" "$UNIT" || { echo CN3195_STAGE_PORT_MISMATCH >&2;exit 1; }
 dir="$(systemctl show "$NEW_SVC" -p WorkingDirectory --value)"
 [[ "$dir" == "$BASE/$EXPECTED_SHA" ]] || { echo CN3195_STAGE_WORKDIR_MISMATCH >&2;exit 1; }
 test -s "$dir/RELEASE_SOURCE_SHA" || { echo CN3195_SOURCE_SHA_MISSING >&2;exit 1; }
 [[ "$(tr -d '\r\n' < "$dir/RELEASE_SOURCE_SHA")" == "$EXPECTED_SHA" ]] || { echo CN3195_SOURCE_SHA_MISMATCH >&2;exit 1; }
 grep -Fxq "EnvironmentFile=$STAGE_ENV" "$UNIT" || { echo CN3195_STAGE_ENV_NOT_LAST >&2;exit 1; }
 for src in "${LIVE_ENV_FILES[@]}";do grep -Fxq "EnvironmentFile=$src" "$UNIT" || { echo CN3195_ORIGINAL_ENVFILE_MISSING >&2;exit 1;};done
 systemctl is-active --quiet "$NEW_SVC" || { echo CN3195_STAGE_NOT_ACTIVE >&2;exit 1; }
 probe || { echo CN3195_VERIFY_FAILED_PREVIOUS_UPSTREAM_UNCHANGED >&2;systemctl stop "$NEW_SVC" || true;exit 1; }
 echo "CN3195_STAGING_PASS_ACTIVE_UPSTREAM=$ACTIVE_PORT SOURCE_SHA=$EXPECTED_SHA"
 exit 0
fi

if [[ "$MODE" == --stage-local ]];then
 [[ ! -e "$UNIT" && ! -e "$FINAL_UNIT" && ! -e "$STAGE_ENV" && ! -e "$PROD_FLAGS" ]] || { echo CN3194_CANDIDATE_ALREADY_EXISTS_NO_OVERWRITE >&2;exit 1; }
 if ss -lnt | grep -Eq '^LISTEN.*:3195[[:space:]]';then echo CN3195_PORT_ALREADY_IN_USE >&2;exit 1;fi
 test "$(df -PB1 "$BASE" | awk 'END{print $4}')" -gt 2500000000 || { echo CN3195_INSUFFICIENT_FREE_DISK >&2;exit 1; }
 LOCAL="$BASE/.download-$TAG/$FILE"
 LOCAL_CHECK="$BASE/.download-$TAG/$CHECK"
 [[ -f "$LOCAL" && ! -L "$LOCAL" && "$(stat -c %u "$LOCAL")" == 0 ]] || { echo CN3195_LOCAL_ARCHIVE_MISSING_OR_UNSAFE >&2;exit 1; }
 [[ -f "$LOCAL_CHECK" && ! -L "$LOCAL_CHECK" && "$(stat -c %u "$LOCAL_CHECK")" == 0 ]] || { echo CN3195_LOCAL_CHECKSUM_MISSING_OR_UNSAFE >&2;exit 1; }
 [[ "$(stat -c %s "$LOCAL")" == "$EXPECTED_ARCHIVE_BYTES" ]] || { echo CN3195_ARCHIVE_LENGTH_MISMATCH >&2;exit 1; }
 (cd "$(dirname "$LOCAL")" && sha256sum -c "$CHECK")
 [[ "$(sha256sum "$LOCAL" | awk '{print $1}')" == "$EXPECTED_ARCHIVE_SHA" ]] || { echo CN3195_ARCHIVE_SHA256_MISMATCH >&2;exit 1; }
 [[ "$(tar -xOzf "$LOCAL" ./RELEASE_SOURCE_SHA | tr -d '\r\n')" == "$EXPECTED_SHA" ]] || { echo CN3195_ARTIFACT_SOURCE_SHA_MISMATCH >&2;exit 1; }
 tar -tzf "$LOCAL" > "$BASE/.cn3195-manifest-$SHORT"
 grep -Fxq './server.js' "$BASE/.cn3195-manifest-$SHORT"
 grep -Fxq './RELEASE_SOURCE_SHA' "$BASE/.cn3195-manifest-$SHORT"
 grep -Fxq './cn-payment-signed-live-probe.mjs' "$BASE/.cn3195-manifest-$SHORT"
 if grep -Eq '(^/|(^|/)\.\.(/|$))' "$BASE/.cn3195-manifest-$SHORT";then echo CN3195_UNSAFE_ARCHIVE_PATH >&2;exit 1;fi
 [[ ! -e "$BASE/$EXPECTED_SHA" ]] || { echo CN3195_DESTINATION_ALREADY_EXISTS_NO_OVERWRITE >&2;exit 1; }
 TEMP="$(mktemp -d "$BASE/.cn3195-XXXXXXXX")"
 trap 'rm -rf "$TEMP"' EXIT
 mkdir -p "$TEMP/unpack"
 tar -xzf "$LOCAL" -C "$TEMP/unpack"
 test -s "$TEMP/unpack/server.js"
 mv "$TEMP/unpack" "$BASE/$EXPECTED_SHA"
 chmod -R go-w "$BASE/$EXPECTED_SHA"
 python3 - "$ENV" "$STAGE_ENV" <<'PY'
import os,sys,tempfile
src,dst=sys.argv[1:3]
lines=open(src,encoding="utf8").read().splitlines()
disabled={
 "TOOL_PASS_COMMERCE_READY","ALIPAY_ENABLED","PAYPAL_ENABLED","WECHAT_ENABLED",
 "SASI_RMB_BALANCE_V1_ENABLED","USD_BALANCE_TOPUP_ENABLED","SASI_REFUND_FLOW_TESTED",
 "SASI_MARKET_SALES_ENABLED","SASI_MARKET_UPLOADS_ENABLED","SASI_MARKET_DELIVERY_ENABLED",
 "SASI_MARKET_PAYOUTS_ENABLED","SASI_MARKETPLACE_COMMERCE_READY","SOFTWARE_COMMERCE_READY"
}
overrides=disabled|{"TOOL_PASS_BACKEND_READY","NEXT_PUBLIC_TOOL_PASS_ENFORCED","NEXT_PUBLIC_SITE_URL","ALIPAY_SITE_URL","PORT","HOSTNAME"}
out=[ln for ln in lines if ln.split("=",1)[0] not in overrides]
out.extend(k+"=false" for k in sorted(disabled))
out.extend(["TOOL_PASS_BACKEND_READY=true","NEXT_PUBLIC_TOOL_PASS_ENFORCED=true",
 "NEXT_PUBLIC_SITE_URL=https://lingxifield.cn","ALIPAY_SITE_URL=https://lingxifield.cn",
 "PORT=3195","HOSTNAME=127.0.0.1"])
fd,tmp=tempfile.mkstemp(prefix=".cn3195-stage-",dir=os.path.dirname(dst))
try:
 os.fchmod(fd,0o600)
 with os.fdopen(fd,"w",encoding="utf8") as f:f.write("\n".join(out)+"\n");f.flush();os.fsync(f.fileno())
 os.replace(tmp,dst)
finally:
 if os.path.exists(tmp):os.unlink(tmp)
PY
 {
  cat <<EOF
[Unit]
Description=LINGXIFIELD CN exact verified 3195 release ($SHORT), prior upstream retained
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
WorkingDirectory=$BASE/$EXPECTED_SHA
EOF
  for src in "${LIVE_ENV_FILES[@]}";do printf 'EnvironmentFile=%s\n' "$src";done
  cat <<EOF
EnvironmentFile=$STAGE_ENV
Environment=NODE_ENV=production
Environment=HOSTNAME=127.0.0.1
Environment=PORT=3195
Environment=NODE_OPTIONS=--max-old-space-size=500
ExecStart=$NODE server.js
Restart=on-failure
RestartSec=2
NoNewPrivileges=true
[Install]
WantedBy=multi-user.target
EOF
 } > "$UNIT"
 chmod 644 "$UNIT"
 systemctl daemon-reload
 systemctl start "$NEW_SVC"
 probe || { echo CN3195_STAGE_GATE_FAILED_PREVIOUS_UPSTREAM_UNCHANGED >&2;systemctl stop "$NEW_SVC" || true;exit 1; }
 echo "CN3195_STAGING_PASS_PREVIOUS_UPSTREAM_UNCHANGED SOURCE_SHA=$EXPECTED_SHA"
 exit 0
fi

if [[ "$MODE" == --promote ]];then
 [[ -f "$UNIT" && ! -L "$UNIT" && -f "$STAGE_ENV" && ! -L "$STAGE_ENV" ]] || { echo CN3195_STAGE_NOT_PREPARED >&2;exit 1; }
 [[ ! -e "$FINAL_UNIT" && ! -e "$PROD_FLAGS" ]] || { echo CN3194_FINAL_CANDIDATE_ALREADY_EXISTS_NO_OVERWRITE >&2;exit 1; }
 grep -Fxq "Environment=PORT=3195" "$UNIT" || { echo CN3195_STAGE_PORT_MISMATCH >&2;exit 1; }
 systemctl is-active --quiet "$NEW_SVC" || { echo CN3195_STAGE_NOT_ACTIVE >&2;exit 1; }
 PORT=3195
 probe || { echo CN3195_PREPROMOTION_GATE_FAILED >&2;exit 1; }
 FALLBACK_SVC="$(find_service_for_port 3193)" || { echo CN3193_ROLLBACK_BASELINE_SERVICE_NOT_ACTIVE >&2;exit 1; }
 fallback_health="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 12 -o /dev/null -w '%{http_code}' -H 'Host: lingxifield.cn' http://127.0.0.1:3193/api/health || true)"
 [[ "$fallback_health" == 200 ]] || { echo CN3193_ROLLBACK_BASELINE_HEALTH_FAILED >&2;exit 1; }
 python3 - "$ENV" <<'PY'
import sys
v={}
for line in open(sys.argv[1],encoding="utf8"):
 s=line.strip()
 if not s or s.startswith("#") or "=" not in s:continue
 k,x=s.split("=",1)
 if k in v:raise SystemExit("CN_DUPLICATE_PRODUCTION_SETTING:"+k)
 v[k]=x.strip().strip('"').strip("'")
if len(v.get("LINGXIFIELD_PRIVACY_HASH_SECRET",""))<32:raise SystemExit("CN_TOOLPASS_STABLE_HMAC_KEY_MISSING_PROMOTION_ABORT")
print("CN3194_PRIVACY_HASH_AND_PAYMENT_GATE_VERIFIED")
PY
 [[ ! -e "$NGINX_BACKUP" && ! -e "$UNIT_BACKUP" ]] || { echo CN3194_ROLLBACK_BACKUP_ALREADY_EXISTS >&2;exit 1; }
 cp -a "$NGINX" "$NGINX_BACKUP"
 cp -a "$UNIT" "$UNIT_BACKUP"
 (
  umask 077
  # Preserve merchant and wallet flags from the existing live EnvironmentFiles.
  # Keep first-party software sales fail-closed until a package has a verified digest, scan and sale-ready record.
  # Keep seller payouts fail-closed until the payout transfer worker is independently verified.
  printf '%s\n' 'NEXT_PUBLIC_TOOL_PASS_ENFORCED=true' 'TOOL_PASS_BACKEND_READY=true' \
    'SASI_MARKET_PAYOUTS_ENABLED=false' 'SOFTWARE_COMMERCE_READY=false' 'NEXT_PUBLIC_SITE_URL=https://lingxifield.cn' \
    'ALIPAY_SITE_URL=https://lingxifield.cn' 'PORT=3194' 'HOSTNAME=127.0.0.1' > "$PROD_FLAGS"
 )
 chmod 600 "$PROD_FLAGS"
 {
  cat <<EOF
[Unit]
Description=LINGXIFIELD CN exact verified 3194 release ($SHORT), 3193 retained as rollback
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
WorkingDirectory=$BASE/$EXPECTED_SHA
EOF
  for src in "${LIVE_ENV_FILES[@]}";do printf 'EnvironmentFile=%s\n' "$src";done
  cat <<EOF
EnvironmentFile=$PROD_FLAGS
Environment=NODE_ENV=production
Environment=HOSTNAME=127.0.0.1
Environment=PORT=3194
Environment=NODE_OPTIONS=--max-old-space-size=500
ExecStart=$NODE server.js
Restart=on-failure
RestartSec=2
NoNewPrivileges=true
[Install]
WantedBy=multi-user.target
EOF
 } > "$FINAL_UNIT"
 chmod 644 "$FINAL_UNIT"
 systemctl daemon-reload

 # First move traffic to the verified new code on the isolated stage port.
 # This keeps old 3194 free for the final 3194 process without exposing 3193 pages.
 OLD_3194_SVC="$(find_service_for_port 3194 || true)"
 [[ -n "$OLD_3194_SVC" && "$OLD_3194_SVC" != "$FINAL_SVC" ]] || { echo CN3194_OLD_SERVICE_NOT_FOUND_FOR_SAFE_REBIND >&2;exit 1; }
 if ! set_nginx_upstream 3195;then set_nginx_upstream "$ACTIVE_PORT" || true;echo CN3195_TEMPORARY_UPSTREAM_SWITCH_FAILED_OLD_SERVICE_RETAINED >&2;exit 1;fi
 for path in / /tools /siai /sasi /sasi/marketplace /announcements /tools/pass /ai-wallet /account /api/health /discover/sasi-software-marketplace /en/discover/mt5-ea-source-code /ja/discover/software-licensing-delivery /ko/discover/developer-software-publishing /fr/discover/sasi-software-marketplace /de/discover/mt5-ea-source-code /es/discover/software-licensing-delivery /pt/discover/developer-software-publishing /ar/discover/sasi-software-marketplace /llms.txt /sitemap.xml /robots.txt;do
  expected=200
  [[ "$path" == "/sasi/marketplace" ]] && expected=308
  status="$(curl -kfsS --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 --max-time 18 -o /dev/null -w '%{http_code}' "https://lingxifield.cn$path" || true)"
  echo "CN3195_TEMPORARY_NEW_RELEASE_ROUTE:$path:$status expected=$expected"
  if [[ "$status" != "$expected" ]];then set_nginx_upstream "$ACTIVE_PORT" || true;echo CN3195_TEMPORARY_ROUTE_FAILED_OLD_SERVICE_RETAINED >&2;exit 1;fi
 done

 if systemctl is-enabled --quiet "$OLD_3194_SVC";then systemctl disable "$OLD_3194_SVC" >/dev/null || { set_nginx_upstream "$ACTIVE_PORT" || true;echo CN3194_OLD_SERVICE_DISABLE_FAILED_OLD_UPSTREAM_RESTORED >&2;exit 1; };fi
 systemctl stop "$OLD_3194_SVC" || { set_nginx_upstream "$ACTIVE_PORT" || true;echo CN3194_OLD_SERVICE_STOP_FAILED_OLD_UPSTREAM_RESTORED >&2;exit 1; }
 if ss -lnt | grep -Eq '^LISTEN.*:3194[[:space:]]';then rollback_to_3193 "CN3194_PORT_NOT_RELEASED" || echo CN3193_AUTOMATIC_ROLLBACK_FAILED_SERVERS_RETAINED >&2;exit 1;fi

 systemctl start "$FINAL_SVC" || { rollback_to_3193 "CN3194_FINAL_SERVICE_START_FAILED" || echo CN3193_AUTOMATIC_ROLLBACK_FAILED_SERVERS_RETAINED >&2;exit 1; }
 PORT=3194
 if ! probe;then
  systemctl stop "$FINAL_SVC" || true
  rollback_to_3193 "CN3194_FINAL_PORT_PROBE_FAILED" || echo CN3193_AUTOMATIC_ROLLBACK_FAILED_SERVERS_RETAINED >&2
  exit 1
 fi

 if ! set_nginx_upstream 3194;then rollback_to_3193 "CN3194_FINAL_UPSTREAM_SWITCH_FAILED" || echo CN3193_AUTOMATIC_ROLLBACK_FAILED_SERVERS_RETAINED >&2;exit 1;fi
 for path in / /tools /siai /sasi /sasi/marketplace /announcements /tools/pass /ai-wallet /account /api/health /discover/sasi-software-marketplace /en/discover/mt5-ea-source-code /ja/discover/software-licensing-delivery /ko/discover/developer-software-publishing /fr/discover/sasi-software-marketplace /de/discover/mt5-ea-source-code /es/discover/software-licensing-delivery /pt/discover/developer-software-publishing /ar/discover/sasi-software-marketplace /llms.txt /sitemap.xml /robots.txt;do
  expected=200
  [[ "$path" == "/sasi/marketplace" ]] && expected=308
  status="$(curl -kfsS --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 --max-time 18 -o /dev/null -w '%{http_code}' "https://lingxifield.cn$path" || true)"
  echo "CN3194_PUBLIC_NGINX_ROUTE:$path:$status expected=$expected"
  if [[ "$status" != "$expected" ]];then
   rollback_to_3193 "CN3194_PUBLIC_ROUTE_FAILED" || echo CN3193_AUTOMATIC_ROLLBACK_FAILED_SERVERS_RETAINED >&2
   exit 1
  fi
 done
 systemctl enable "$FINAL_SVC" >/dev/null || { rollback_to_3193 "CN3194_FINAL_SERVICE_ENABLE_FAILED" || echo CN3193_AUTOMATIC_ROLLBACK_FAILED_SERVERS_RETAINED >&2;exit 1; }
 systemctl stop "$NEW_SVC" || { rollback_to_3193 "CN3195_STAGE_STOP_FAILED" || echo CN3193_AUTOMATIC_ROLLBACK_FAILED_SERVERS_RETAINED >&2;exit 1; }
 systemctl disable "$NEW_SVC" >/dev/null || { rollback_to_3193 "CN3195_STAGE_DISABLE_FAILED" || echo CN3193_AUTOMATIC_ROLLBACK_FAILED_SERVERS_RETAINED >&2;exit 1; }
 if ss -lnt | grep -Eq '^LISTEN.*:3195[[:space:]]';then rollback_to_3193 "CN3195_STAGE_PORT_STILL_LISTENING" || echo CN3193_AUTOMATIC_ROLLBACK_FAILED_SERVERS_RETAINED >&2;exit 1;fi
 echo "CN3194_NGINX_PROMOTION_PASS FINAL_SERVICE=$FINAL_SVC"
 echo "CN3193_ROLLBACK_BASELINE_RETAINED service=$FALLBACK_SVC"
 echo "3195_ISOLATED_STAGE_STOPPED_AFTER_3194_PUBLIC_ACCEPTANCE"
 echo "EXISTING_PAYMENT_AND_WALLET_FLAGS_PRESERVED_FROM_LIVE_ENVFILES"
 exit 0
fi
