#!/usr/bin/env bash
# Safe in-place CN upgrade: keep live 3193, stage exact __SHORT__ on 3194, then switch Nginx with rollback.
# No DNS, Cloudflare, Vercel, Supabase rows, orders, balances or payment flags are changed by staging.
set -Eeuo pipefail
MODE="${1:-}"; TAG="${2:-}"
case "$MODE" in --plan|--stage-local|--verify-stage|--promote|--rollback) ;; *) echo "USAGE: $0 --plan|--stage-local|--verify-stage|--promote|--rollback __TAG__" >&2;exit 2;; esac
[[ "$TAG" == "__TAG__" ]] || { echo "EXACT_RELEASE_TAG_REQUIRED" >&2;exit 2; }
SHORT="__SHORT__"
EXPECTED_SHA="__SOURCE_SHA__"
EXPECTED_ARCHIVE_SHA="__ARCHIVE_SHA__"
EXPECTED_ARCHIVE_BYTES="__ARCHIVE_BYTES__"
[[ "$EUID" == 0 ]] || { echo "ROOT_REQUIRED" >&2;exit 1; }
exec 9>/run/lock/lingxifield-cn-standalone-release.lock
flock -n 9 || { echo "ANOTHER_CN_RELEASE_IS_RUNNING" >&2;exit 1; }

NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
ENV=/etc/lingxifield/production.env
OLD_SVC=lingxifield-cn-release-20261108-8729bf958a56
NEW_SVC="lingxifield-cn-release-20261108-$SHORT"
UNIT="/etc/systemd/system/$NEW_SVC.service"
NGINX=/etc/nginx/conf.d/lingxifield.conf
BASE=/opt/lingxifield/cn-staged-releases
STAGE_ENV="/etc/lingxifield/staging-3194-$SHORT.env"
PROD_FLAGS="/etc/lingxifield/tool-pass-3194-$SHORT.env"
NGINX_BACKUP="$NGINX.before-cn3194-$SHORT"
UNIT_BACKUP="$UNIT.rollback-$SHORT"
PORT=3194
FILE=__ARCHIVE_FILE__
CHECK=__CHECK_FILE__

safe_env(){
  [[ -f "$ENV" && ! -L "$ENV" && "$(stat -c %u "$ENV")" == 0 && "$(stat -c %a "$ENV")" == 600 ]] || {
    echo "PRODUCTION_ENV_NOT_ROOT_MODE_600" >&2;exit 1;
  }
  grep -q '^SUPABASE_SECRET_KEY=sb_secret_' "$ENV" || {
    echo "VALIDATED_SUPABASE_SECRET_NOT_PRESENT" >&2;exit 1;
  }
}
old_live(){
  systemctl is-active --quiet "$OLD_SVC" || { echo "ORIGINAL_3193_SERVICE_NOT_ACTIVE" >&2;exit 1; }
  local old_dir old_sha
  old_dir="$(systemctl show "$OLD_SVC" -p WorkingDirectory --value)"
  [[ "$old_dir" =~ ^/opt/lingxifield/cn-staged-releases/[a-f0-9]{40}$ ]] || {
    echo "ORIGINAL_3193_WORKDIR_INVALID" >&2;exit 1;
  }
  test -s "$old_dir/RELEASE_SOURCE_SHA" || { echo "ORIGINAL_3193_SOURCE_SHA_MISSING" >&2;exit 1; }
  old_sha="$(tr -d '\r\n' < "$old_dir/RELEASE_SOURCE_SHA")"
  [[ "$old_sha" == "8729bf958a565ec1dbd2776082416c83170b1d73" ]] || {
    echo "ORIGINAL_3193_SOURCE_SHA_MISMATCH" >&2;exit 1;
  }
  [[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo "NGINX_CONFIG_NOT_REGULAR" >&2;exit 1; }
  python3 - "$NGINX" <<'PY'
import sys
b=open(sys.argv[1],"rb").read()
if b.count(b"127.0.0.1:3193")!=1: raise SystemExit("NGINX_MUST_POINT_TO_OLD_3193_EXACTLY_ONCE")
if b"127.0.0.1:3194" in b or b"127.0.0.1:3192" in b:
    raise SystemExit("NGINX_UPSTREAM_NOT_AT_EXPECTED_3193_BASELINE")
PY
}
load_env_files(){
  mapfile -t LIVE_ENV_FILES < <(
    systemctl show "$OLD_SVC" -p EnvironmentFiles --value |
      python3 -c 'import re,sys
s=sys.stdin.read()
for p in re.findall(r"(/[^\s()]+\.env)\s+\(ignore_errors=(?:yes|no)\)",s):
 print(p)'
  )
  (( ${#LIVE_ENV_FILES[@]} >= 1 && ${#LIVE_ENV_FILES[@]} <= 8 )) || {
    echo "ORIGINAL_3193_ENVFILE_COUNT_INVALID" >&2;exit 1;
  }
  for f in "${LIVE_ENV_FILES[@]}";do
    [[ "$f" =~ ^/etc/lingxifield/[a-zA-Z0-9_.-]+\.env$ && -f "$f" && ! -L "$f" &&
       "$(stat -c %u "$f")" == 0 ]] || { echo "ORIGINAL_3193_ENVFILE_UNSAFE" >&2;exit 1; }
  done
  echo "CN3194_ORIGINAL_ENVFILES_COUNT=${#LIVE_ENV_FILES[@]}"
}
code(){
  local path="$1" expected="$2" found
  found="$(curl -s --noproxy '*' --max-time 18 -o /dev/null -w '%{http_code}' \
    -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' \
    "http://127.0.0.1:$PORT$path" || true)"
  echo "CN3194_CHECK $path $found"
  [[ "$found" == "$expected" ]]
}
probe(){
  local ready=0
  for i in $(seq 1 25);do
    if code /api/health 200 >/dev/null;then ready=1;break;fi
    sleep 2
  done
  [[ "$ready" == 1 ]] || { echo "CN3194_HEALTH_NOT_READY" >&2;return 1; }
  code /api/health 200
  code / 200
  code /tools 200
  code /siai 200
  code /sasi 200
  code /sasi/pricing 307
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
  code /sasi/marketplace 200
  code /announcements 200
  local wallet_html tools_html
  wallet_html="$(curl --noproxy '*' -fsS --max-time 25 -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$PORT/ai-wallet")"
  grep -Fq 'lx26-wallet-page' <<<"$wallet_html" || { echo "CN3194_NEW_WALLET_UI_MISSING" >&2;return 1; }
  tools_html="$(curl --noproxy '*' -fsS --max-time 25 -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$PORT/tools")"
  grep -Fq 'lx26-tools-page' <<<"$tools_html" || { echo "CN3194_NEW_TOOLS_UI_MISSING" >&2;return 1; }
  curl --noproxy '*' -fsS --max-time 20 -H 'Host: lingxifield.cn' "http://127.0.0.1:$PORT/api/tools/pass" |
    "$NODE" -e '
let s="";process.stdin.on("data",x=>s+=x).on("end",()=>{
const j=JSON.parse(s),p=j.offers||[];
if(p.length!==4||p.map(x=>x.price).join(",")!=="29,99,269,899")process.exit(3);
console.log("CN3194_FOUR_TOOLPASS_OFFERS_PASS");
});'
}
safe_env

if [[ "$MODE" == "--rollback" ]];then
  systemctl is-active --quiet "$OLD_SVC" || { echo "ORIGINAL_3193_SERVICE_NOT_ACTIVE" >&2;exit 1; }
  [[ -f "$NGINX_BACKUP" && ! -L "$NGINX_BACKUP" ]] || { echo "CN3194_NGINX_ROLLBACK_FILE_MISSING" >&2;exit 1; }
  [[ -f "$UNIT_BACKUP" && ! -L "$UNIT_BACKUP" ]] || { echo "CN3194_UNIT_ROLLBACK_FILE_MISSING" >&2;exit 1; }
  cp -a "$NGINX_BACKUP" "$NGINX"
  nginx -t && systemctl reload nginx
  cp -a "$UNIT_BACKUP" "$UNIT"
  rm -f "$PROD_FLAGS"
  systemctl daemon-reload
  systemctl restart "$NEW_SVC" || true
  for path in / /tools /siai /sasi /tools/pass /ai-wallet;do
    status="$(curl -kfsS --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 --max-time 15 -o /dev/null -w '%{http_code}' "https://lingxifield.cn$path" || true)"
    echo "CN3194_ROLLBACK_PUBLIC:$path:$status"
    [[ "$status" == 200 ]] || { echo "CN3194_ROLLBACK_PUBLIC_CHECK_FAILED" >&2;exit 1; }
  done
  echo "CN3194_ROLLBACK_TO_3193_PASS OLD_3193_SERVICE_RETAINED"
  exit 0
fi

old_live
load_env_files
[[ -x "$NODE" ]] || { echo "NODE24_RUNTIME_NOT_FOUND" >&2;exit 1; }
if [[ "$MODE" == "--plan" ]];then
  [[ "$(curl -s --noproxy '*' --max-time 10 -o /dev/null -w '%{http_code}' -H 'Host: lingxifield.cn' "http://127.0.0.1:3193/api/health" || true)" == 200 ]] ||
    { echo "CN3193_BASELINE_HEALTH_UNAVAILABLE" >&2;exit 1; }
  if ss -lnt | grep -Eq '^LISTEN.*:3194[[:space:]]';then echo "CN3194_PORT_ALREADY_IN_USE";exit 1;fi
  echo "CN3194_DISK_AVAILABLE_BYTES=$(df -PB1 "$BASE" 2>/dev/null | awk 'END{print $4}')"
  free -h
  test "$(df -PB1 "$BASE" | awk 'END{print $4}')" -gt 2500000000 || {
    echo "CN3194_INSUFFICIENT_FREE_DISK" >&2;exit 1;
  }
  echo "CN3194_PLAN_READ_ONLY_3193_UNCHANGED"
  exit 0
fi

if [[ "$MODE" == "--verify-stage" ]];then
  [[ -f "$UNIT" && ! -L "$UNIT" && -f "$STAGE_ENV" && ! -L "$STAGE_ENV" ]] || {
    echo "CN3194_STAGE_FILES_MISSING" >&2;exit 1;
  }
  dir="$(systemctl show "$NEW_SVC" -p WorkingDirectory --value)"
  [[ "$dir" == "$BASE/$EXPECTED_SHA" ]] || { echo "CN3194_STAGE_WORKDIR_MISMATCH" >&2;exit 1; }
  test -s "$dir/RELEASE_SOURCE_SHA" || { echo "CN3194_SOURCE_SHA_MISSING" >&2;exit 1; }
  [[ "$(tr -d '\r\n' < "$dir/RELEASE_SOURCE_SHA")" == "$EXPECTED_SHA" ]] || {
    echo "CN3194_SOURCE_SHA_MISMATCH" >&2;exit 1;
  }
  grep -Fxq "EnvironmentFile=$STAGE_ENV" "$UNIT" || { echo "CN3194_STAGE_ENV_NOT_LAST" >&2;exit 1; }
  for src in "${LIVE_ENV_FILES[@]}";do grep -Fxq "EnvironmentFile=$src" "$UNIT" || {
    echo "CN3194_ORIGINAL_ENVFILE_MISSING" >&2;exit 1;
  };done
  if ! systemctl is-active --quiet "$NEW_SVC";then systemctl start "$NEW_SVC";fi
  probe || { echo "CN3194_VERIFY_FAILED_3193_UNCHANGED" >&2;systemctl stop "$NEW_SVC" || true;exit 1; }
  echo "CN3194_STAGING_PASS_3193_UNCHANGED SOURCE_SHA=$EXPECTED_SHA"
  exit 0
fi

if [[ "$MODE" == "--stage-local" ]];then
  [[ ! -e "$UNIT" && ! -e "$STAGE_ENV" && ! -e "$PROD_FLAGS" ]] || {
    echo "CN3194_CANDIDATE_ALREADY_EXISTS_NO_OVERWRITE" >&2;exit 1;
  }
  test "$(df -PB1 "$BASE" | awk 'END{print $4}')" -gt 2500000000 || {
    echo "CN3194_INSUFFICIENT_FREE_DISK" >&2;exit 1;
  }
  LOCAL="$BASE/.download-$TAG/$FILE"
  LOCAL_CHECK="$BASE/.download-$TAG/$CHECK"
  [[ -f "$LOCAL" && ! -L "$LOCAL" && "$(stat -c %u "$LOCAL")" == 0 ]] || {
    echo "CN3194_LOCAL_ARCHIVE_MISSING_OR_UNSAFE" >&2;exit 1;
  }
  [[ -f "$LOCAL_CHECK" && ! -L "$LOCAL_CHECK" && "$(stat -c %u "$LOCAL_CHECK")" == 0 ]] || {
    echo "CN3194_LOCAL_CHECKSUM_MISSING_OR_UNSAFE" >&2;exit 1;
  }
  [[ "$(stat -c %s "$LOCAL")" == "$EXPECTED_ARCHIVE_BYTES" ]] || {
    echo "CN3194_ARCHIVE_LENGTH_MISMATCH" >&2;exit 1;
  }
  (cd "$(dirname "$LOCAL")" && sha256sum -c "$CHECK")
  actual="$(sha256sum "$LOCAL" | awk '{print $1}')"
  [[ "$actual" == "$EXPECTED_ARCHIVE_SHA" ]] || { echo "CN3194_ARCHIVE_SHA256_MISMATCH" >&2;exit 1; }
  source_sha="$(tar -xOzf "$LOCAL" ./RELEASE_SOURCE_SHA | tr -d '\r\n')"
  [[ "$source_sha" == "$EXPECTED_SHA" ]] || { echo "CN3194_ARTIFACT_SOURCE_SHA_MISMATCH" >&2;exit 1; }
  tar -tzf "$LOCAL" > "$BASE/.cn3194-manifest-$SHORT"
  grep -Fxq './server.js' "$BASE/.cn3194-manifest-$SHORT"
  grep -Fxq './RELEASE_SOURCE_SHA' "$BASE/.cn3194-manifest-$SHORT"
  grep -Fxq './cn-payment-signed-live-probe.mjs' "$BASE/.cn3194-manifest-$SHORT"
  if grep -Eq '^/|(^|/)\.\.(/|$)' "$BASE/.cn3194-manifest-$SHORT";then
    echo "CN3194_UNSAFE_ARCHIVE_PATH" >&2;exit 1;
  fi
  [[ ! -e "$BASE/$EXPECTED_SHA" ]] || { echo "CN3194_DESTINATION_ALREADY_EXISTS_NO_OVERWRITE" >&2;exit 1; }
  TEMP="$(mktemp -d "$BASE/.cn3194-XXXXXXXX")"
  trap 'rm -rf "$TEMP"' EXIT
  mkdir -p "$TEMP/unpack"
  tar -xzf "$LOCAL" -C "$TEMP/unpack"
  test -s "$TEMP/unpack/server.js"
  mv "$TEMP/unpack" "$BASE/$EXPECTED_SHA"
  chmod -R go-w "$BASE/$EXPECTED_SHA"
  python3 - "$ENV" "$STAGE_ENV" <<'PY'
import os,sys
src,dst=sys.argv[1:3]
lines=open(src,encoding="utf8").read().splitlines()
disabled={
 "TOOL_PASS_COMMERCE_READY","ALIPAY_ENABLED","PAYPAL_ENABLED","WECHAT_ENABLED",
 "SASI_RMB_BALANCE_V1_ENABLED","SASI_MARKET_SALES_ENABLED","SASI_MARKET_UPLOADS_ENABLED",
 "SASI_MARKET_DELIVERY_ENABLED","SASI_MARKET_PAYOUTS_ENABLED","SASI_MARKETPLACE_COMMERCE_READY",
 "SOFTWARE_COMMERCE_READY"
}
overrides=disabled|{"TOOL_PASS_BACKEND_READY","NEXT_PUBLIC_TOOL_PASS_ENFORCED","NEXT_PUBLIC_SITE_URL","ALIPAY_SITE_URL","PORT","HOSTNAME"}
out=[ln for ln in lines if ln.split("=",1)[0] not in overrides]
out.extend(k+"=false" for k in sorted(disabled))
out.extend([
 "TOOL_PASS_BACKEND_READY=true","NEXT_PUBLIC_TOOL_PASS_ENFORCED=true",
 "NEXT_PUBLIC_SITE_URL=https://lingxifield.cn","ALIPAY_SITE_URL=https://lingxifield.cn",
 "PORT=3194","HOSTNAME=127.0.0.1"
])
fd=os.open(dst,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
with os.fdopen(fd,"w",encoding="utf8") as f:f.write("\n".join(out)+"\n")
PY
  {
    cat <<EOF
[Unit]
Description=LINGXIFIELD CN exact verified 3194 upgrade ($SHORT), old 3193 retained
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
Environment=PORT=3194
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
  probe || { echo "CN3194_STAGE_GATE_FAILED_3193_UNCHANGED" >&2;systemctl stop "$NEW_SVC" || true;exit 1; }
  echo "CN3194_STAGING_PASS_3193_UNCHANGED SOURCE_SHA=$EXPECTED_SHA"
  exit 0
fi

if [[ "$MODE" == "--promote" ]];then
  [[ -f "$UNIT" && ! -L "$UNIT" && -f "$STAGE_ENV" && ! -L "$STAGE_ENV" ]] || {
    echo "CN3194_STAGE_NOT_PREPARED" >&2;exit 1;
  }
  systemctl is-active --quiet "$NEW_SVC" || { echo "CN3194_STAGE_NOT_ACTIVE" >&2;exit 1; }
  probe || { echo "CN3194_PREPROMOTION_GATE_FAILED" >&2;exit 1; }
  python3 - "$ENV" <<'PY'
import sys
v={}
for line in open(sys.argv[1],encoding="utf8"):
 s=line.strip()
 if not s or s.startswith("#") or "=" not in s:continue
 k,x=s.split("=",1)
 if k in v:raise SystemExit("CN_DUPLICATE_PRODUCTION_SETTING:"+k)
 v[k]=x.strip().strip('"').strip("'")
if len(v.get("LINGXIFIELD_PRIVACY_HASH_SECRET",""))<32:
 raise SystemExit("CN_TOOLPASS_STABLE_HMAC_KEY_MISSING_PROMOTION_ABORT")
if v.get("TOOL_PASS_COMMERCE_READY","false").lower() in ("true","1"):
 raise SystemExit("CN_TOOLPASS_PAYMENT_GATE_MUST_REMAIN_CLOSED_BEFORE_PROMOTION")
print("CN3194_PRIVACY_HASH_AND_PAYMENT_GATE_VERIFIED")
PY
  [[ ! -e "$NGINX_BACKUP" && ! -e "$UNIT_BACKUP" && ! -e "$PROD_FLAGS" ]] || {
    echo "CN3194_ROLLBACK_OR_FLAGS_ALREADY_EXIST" >&2;exit 1;
  }
  cp -a "$NGINX" "$NGINX_BACKUP"
  cp -a "$UNIT" "$UNIT_BACKUP"
  rollback(){
    echo "CN3194_PROMOTION_FAILED_RESTORING_3193" >&2
    cp -a "$NGINX_BACKUP" "$NGINX" || true
    nginx -t && systemctl reload nginx || true
    cp -a "$UNIT_BACKUP" "$UNIT" || true
    rm -f "$PROD_FLAGS" || true
    systemctl daemon-reload || true
    systemctl restart "$NEW_SVC" || true
  }
  (
    umask 077
    printf '%s\n' 'NEXT_PUBLIC_TOOL_PASS_ENFORCED=true' 'TOOL_PASS_BACKEND_READY=true' \
      'TOOL_PASS_COMMERCE_READY=false' 'WECHAT_ENABLED=false' 'ALIPAY_ENABLED=false' \
      'PAYPAL_ENABLED=false' 'SASI_RMB_BALANCE_V1_ENABLED=false' \
      'SASI_MARKET_SALES_ENABLED=false' 'SASI_MARKET_UPLOADS_ENABLED=false' \
      'SASI_MARKET_DELIVERY_ENABLED=false' 'SASI_MARKET_PAYOUTS_ENABLED=false' \
      'SASI_MARKETPLACE_COMMERCE_READY=false' 'SOFTWARE_COMMERCE_READY=false' \
      'NEXT_PUBLIC_SITE_URL=https://lingxifield.cn' 'ALIPAY_SITE_URL=https://lingxifield.cn' \
      'PORT=3194' 'HOSTNAME=127.0.0.1' > "$PROD_FLAGS"
  )
  chmod 600 "$PROD_FLAGS"
  sed -i "s|^EnvironmentFile=$STAGE_ENV$|EnvironmentFile=$PROD_FLAGS|" "$UNIT"
  grep -Fxq "EnvironmentFile=$PROD_FLAGS" "$UNIT" || { rollback;exit 1; }
  if grep -Fxq "EnvironmentFile=$STAGE_ENV" "$UNIT";then rollback;exit 1;fi
  for src in "${LIVE_ENV_FILES[@]}";do grep -Fxq "EnvironmentFile=$src" "$UNIT" || { rollback;exit 1; };done
  systemctl daemon-reload
  systemctl restart "$NEW_SVC" || { rollback;exit 1; }
  probe || { rollback;exit 1; }
  python3 - "$NGINX" <<'PY'
import os,sys,tempfile
path=sys.argv[1]
old=open(path,"rb").read()
if old.count(b"127.0.0.1:3193")!=1 or b"127.0.0.1:3194" in old:
 raise SystemExit("CN3194_NGINX_UPSTREAM_CHANGED_ABORT")
new=old.replace(b"127.0.0.1:3193",b"127.0.0.1:3194",1)
st=os.stat(path)
fd,tmp=tempfile.mkstemp(prefix=".cn3194-",dir=os.path.dirname(path))
try:
 os.fchmod(fd,st.st_mode&0o777);os.fchown(fd,st.st_uid,st.st_gid)
 with os.fdopen(fd,"wb") as f:f.write(new);f.flush();os.fsync(f.fileno())
 os.replace(tmp,path)
finally:
 if os.path.exists(tmp):os.unlink(tmp)
PY
  if ! nginx -t || ! systemctl reload nginx;then rollback;exit 1;fi
  for path in / /tools /siai /sasi /sasi/marketplace /announcements /tools/pass /ai-wallet;do
    status="$(curl -kfsS --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 --max-time 18 -o /dev/null -w '%{http_code}' "https://lingxifield.cn$path" || true)"
    echo "CN3194_PUBLIC_NGINX_ROUTE:$path:$status"
    [[ "$status" == 200 ]] || { rollback;exit 1; }
  done
  systemctl enable "$NEW_SVC" >/dev/null || { rollback;exit 1; }
  echo "CN3194_NGINX_PROMOTION_PASS_ROLLBACK_FILE=$NGINX_BACKUP"
  echo "OLD_3193_SERVICE_RETAINED_ACTIVE_FOR_ROLLBACK"
  echo "PAYMENT_FLAGS_REMAIN_CLOSED_UNTIL_SIGNED_MERCHANT_AUDIT"
  exit 0
fi
