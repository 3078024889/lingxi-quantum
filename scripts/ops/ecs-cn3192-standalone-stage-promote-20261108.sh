#!/usr/bin/env bash
# Offline-build, exact-SHA standalone candidate. Only ECS 3192 and (after explicit
# --promote) the already verified lingxifield.cn Nginx upstream may be modified.
# Never touch .com/Cloudflare/Vercel/globalsiai, money or Supabase rows.
set -Eeuo pipefail
MODE="${1:-}"; TAG="${2:-}"
case "$MODE" in --stage|--promote) ;; *) echo "USAGE: $0 --stage|--promote ecs-cn-admin-toolpass-20261108-<sha12>" >&2;exit 2;; esac
[[ "$TAG" =~ ^ecs-cn-admin-toolpass-20261108-([a-f0-9]{12})$ ]] || { echo "INVALID_RELEASE_TAG" >&2;exit 2; }
SHORT="${BASH_REMATCH[1]}"
[[ "$EUID" = 0 ]] || { echo "ROOT_REQUIRED" >&2;exit 2; }
exec 9>/run/lock/lingxifield-cn-standalone-release.lock
flock -n 9 || { echo "ANOTHER_CN_RELEASE_IS_RUNNING" >&2;exit 2; }
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
ENV=/etc/lingxifield/production.env
SVC=lingxifield-cn-release-86b956c9700e
NEW="lingxifield-cn-release-20261108-${SHORT}"
UNIT="/etc/systemd/system/${NEW}.service"
NGINX=/etc/nginx/conf.d/lingxifield.conf
BASE=/opt/lingxifield/cn-staged-releases
STAGE_ENV="/etc/lingxifield/staging-3192-${SHORT}.env"
FILE="cn-20261108-admin-toolpass-standalone.tar.gz"
CHECK="cn-20261108-admin-toolpass-standalone.sha256"
TAGURL="https://github.com/3078024889/lingxi-quantum/releases/download/${TAG}"
safe_env(){
  [[ -f "$ENV" && ! -L "$ENV" && "$(stat -c %u "$ENV")" = 0 ]] || { echo "ENV_NOT_ROOT_FILE" >&2;exit 1; }
  [[ "$(stat -c %a "$ENV")" = 600 ]] || { echo "ENV_NOT_MODE_600" >&2;exit 1; }
  grep -q '^SUPABASE_SECRET_KEY=sb_secret_' "$ENV" || { echo "VALIDATED_NEW_SECRET_NOT_PRESENT" >&2;exit 1; }
}
live_old(){
  systemctl is-active --quiet "$SVC" || { echo "ORIGINAL_3191_SERVICE_NOT_ACTIVE" >&2;exit 1; }
  systemctl show "$SVC" -p WorkingDirectory --value | grep -Fq 86b956c9700ede4a537c021af3a0dc1df825fa9b || {
    echo "ORIGINAL_3191_RELEASE_NOT_EXPECTED" >&2; exit 1;
  }
  [[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo "NGINX_FILE_NOT_REGULAR" >&2;exit 1; }
  grep -Fq "lingxifield.cn" "$NGINX" || { echo "CN_SERVER_NOT_PRESENT_IN_NGINX" >&2;exit 1; }
}
code(){
  local path="$1" expected="$2" found
  found="$(curl -s --noproxy '*' --max-time 15 -o /dev/null -w '%{http_code}' \
    -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:3192${path}" || true)"
  echo "CN3192_CHECK ${path} ${found}"
  [[ "$found" = "$expected" ]] || return 1
}
probe(){
  for i in $(seq 1 25); do
    if code /api/health 200 >/dev/null;then break;fi
    sleep 2
  done
  code /api/health 200
  code /tools 200
  code /siai 200
  code /sasi/pricing 200
  code /tools/pass 200
  code /api/sasi/account 401
  code /api/tools/jobs 401
  code /api/account/money-admin/access 200
  code /api/pay/providers 200
  curl --noproxy '*' -fsS --max-time 12 -H 'Host: lingxifield.cn' \
   http://127.0.0.1:3192/api/tools/pass | "$NODE" -e '
let data="";process.stdin.on("data",x=>data+=x).on("end",()=>{
const j=JSON.parse(data);
const p=j.offers||[];
if(p.length!==4||p.map(x=>x.price).join(",")!=="29,99,269,899")
process.exit(3);
console.log("CN3192_FOUR_TOOLPASS_OFFERS_PASS");
});'
}
safe_env; live_old
[[ -x "$NODE" ]] || { echo "NODE24_RUNTIME_NOT_FOUND" >&2;exit 1; }
mkdir -p "$BASE"
if [[ "$MODE" = --stage ]];then
  [[ ! -e "$UNIT" && ! -e "$STAGE_ENV" ]] || { echo "CANDIDATE_ALREADY_PREPARED_NO_OVERWRITE" >&2;exit 1; }
  test "$(df -PB1 "$BASE" | awk 'END{print $4}')" -gt 2500000000 || {
    echo "INSUFFICIENT_FREE_DISK" >&2;exit 1;
  }
  TEMP="$(mktemp -d "$BASE/.cn3192-XXXXXXXX")"
  trap 'rm -rf "$TEMP"' EXIT
  curl -4fLsS --retry 3 --max-time 900 -o "$TEMP/$FILE" "$TAGURL/$FILE"
  curl -4fLsS --retry 3 --max-time 90 -o "$TEMP/$CHECK" "$TAGURL/$CHECK"
  (cd "$TEMP" && sha256sum -c "$CHECK")
  bytes="$(stat -c %s "$TEMP/$FILE")"
  (( bytes>100000 && bytes<1300000000 )) || { echo "ARCHIVE_SIZE_INVALID" >&2;exit 1; }
  tar -tzf "$TEMP/$FILE" > "$TEMP/manifest"
  grep -Fxq './server.js' "$TEMP/manifest"
  grep -Fxq './RELEASE_SOURCE_SHA' "$TEMP/manifest"
  if grep -Eq '^/|(^|/)\.\.(/|$)' "$TEMP/manifest";then echo "UNSAFE_ARCHIVE_PATH" >&2;exit 1;fi
  SHA="$(tar -xOzf "$TEMP/$FILE" ./RELEASE_SOURCE_SHA | tr -d '\r\n')"
  [[ "$SHA" =~ ^[a-f0-9]{40}$ && "${SHA:0:12}" = "$SHORT" ]] || {
    echo "ARTIFACT_SOURCE_SHA_MISMATCH" >&2;exit 1;
  }
  DEST="$BASE/$SHA"
  [[ ! -e "$DEST" ]] || { echo "DESTINATION_ALREADY_EXISTS" >&2;exit 1; }
  mkdir -p "$TEMP/unpack"
  tar -xzf "$TEMP/$FILE" -C "$TEMP/unpack"
  test -s "$TEMP/unpack/server.js"
  mv "$TEMP/unpack" "$DEST"
  chmod -R go-w "$DEST"
  python3 - "$ENV" "$STAGE_ENV" <<'PY'
import os,sys
src,dst=sys.argv[1:3]
lines=open(src).read().splitlines()
disabled={"TOOL_PASS_COMMERCE_READY","ALIPAY_ENABLED","PAYPAL_ENABLED","WECHAT_ENABLED"}
out=[ln for ln in lines if ln.split("=",1)[0] not in disabled]
out.extend(k+"=false" for k in sorted(disabled))
fd=os.open(dst,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
with os.fdopen(fd,"w") as f:f.write("\n".join(out)+"\n")
PY
  cat > "$UNIT" <<EOF
[Unit]
Description=LINGXIFIELD CN verified 3192 admin/toolpass standalone ($SHORT)
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
WorkingDirectory=$DEST
EnvironmentFile=$STAGE_ENV
Environment=NODE_ENV=production
Environment=HOSTNAME=127.0.0.1
Environment=PORT=3192
Environment=NODE_OPTIONS=--max-old-space-size=500
ExecStart=$NODE server.js
Restart=on-failure
RestartSec=2
NoNewPrivileges=true
[Install]
WantedBy=multi-user.target
EOF
  chmod 644 "$UNIT"
  systemctl daemon-reload
  systemctl start "$NEW"
  probe || { echo "CN3192_STAGE_GATE_FAILED_PRODUCTION_3191_UNCHANGED" >&2;systemctl stop "$NEW" || true;exit 1; }
  echo "CN3192_STAGING_PASS_PRODUCTION_3191_UNCHANGED SOURCE_SHA=$SHA"
  exit 0
fi
# Do not switch the IP/account quota runtime until a stable HMAC key is present.
# The old service_role key is intentionally NOT used as a fallback in the new release.
grep -Eq '^LINGXIFIELD_PRIVACY_HASH_SECRET=.{32,} && ! -L "$UNIT" && -f "$STAGE_ENV" ]] || { echo "CN3192_STAGE_NOT_PREPARED" >&2;exit 1; }
systemctl is-active --quiet "$NEW" || { echo "CN3192_STAGE_NOT_ACTIVE" >&2;exit 1; }
PRODUCTION_ORIGINAL="$NGINX.before-cn3192-$SHORT-$(date -u +%Y%m%dT%H%M%SZ)"
grep -Fq '127.0.0.1:3191' "$NGINX" || { echo "CN_NGINX_UPSTREAM_CHANGED_ABORT" >&2;exit 1; }
cp -a "$NGINX" "$PRODUCTION_ORIGINAL"
cp -a "$UNIT" "$UNIT.rollback-$SHORT"
# Promote the candidate to use production env, with its already-validated sb_secret.
sed -i "s@EnvironmentFile=$STAGE_ENV@EnvironmentFile=$ENV@" "$UNIT"
grep -Fxq "EnvironmentFile=$ENV" "$UNIT" || { echo "SERVICE_PROMOTION_ENV_FAILED" >&2;exit 1; }
systemctl daemon-reload
systemctl restart "$NEW"
if ! probe;then
  echo "CN3192_PRODUCTION_ENV_GATE_FAILED_ROLLING_BACK" >&2
  cp -a "$UNIT.rollback-$SHORT" "$UNIT"
  systemctl daemon-reload
  systemctl restart "$NEW" || true
  exit 1
fi
python3 - "$NGINX" <<'PY'
import os,sys,tempfile
path=sys.argv[1];old=open(path,"rb").read()
if b"lingxifield.cn" not in old:raise SystemExit("CN_CONFIG_UNEXPECTED")
if old.count(b"127.0.0.1:3191")<1:raise SystemExit("CN_UPSTREAM_CHANGED")
next=old.replace(b"127.0.0.1:3191",b"127.0.0.1:3192")
fd,p=tempfile.mkstemp(prefix=".cn3192-",dir=os.path.dirname(path))
os.fchmod(fd,0o644)
with os.fdopen(fd,"wb") as f:f.write(next)
os.replace(p,path)
PY
rollback(){
  echo "CN_NGINX_POSTCUTOVER_FAILED_RESTORING_3191" >&2
  cp -a "$PRODUCTION_ORIGINAL" "$NGINX"
  nginx -t && systemctl reload nginx || true
}
if ! nginx -t || ! systemctl reload nginx;then rollback; exit 1;fi
for path in / /tools /siai /sasi/pricing /tools/pass;do
  result="$(curl -kfsS --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 \
    --max-time 15 -o /dev/null -w '%{http_code}' "https://lingxifield.cn$path" || true)"
  echo "CN_PUBLIC_NGINX_ROUTE:$path:$result"
  [[ "$result" = 200 ]] || { rollback;exit 1; }
done
systemctl enable "$NEW" >/dev/null
echo "CN_NEW_3192_NGINX_PROMOTION_PASS_ROLLBACK_FILE=$PRODUCTION_ORIGINAL"
echo "ADMIN_AUTHENTICATED_SESSION_AND_REAL_PAYMENT_CONFIRMATIONS_STILL_REQUIRED"
 "$ENV" || {
  echo "CN_TOOLPASS_STABLE_HMAC_KEY_MISSING_PROMOTION_ABORT" >&2; exit 1;
}
# Only promote after stage has been created and running.
[[ -f "$UNIT" && ! -L "$UNIT" && -f "$STAGE_ENV" ]] || { echo "CN3192_STAGE_NOT_PREPARED" >&2;exit 1; }
systemctl is-active --quiet "$NEW" || { echo "CN3192_STAGE_NOT_ACTIVE" >&2;exit 1; }
PRODUCTION_ORIGINAL="$NGINX.before-cn3192-$SHORT-$(date -u +%Y%m%dT%H%M%SZ)"
grep -Fq '127.0.0.1:3191' "$NGINX" || { echo "CN_NGINX_UPSTREAM_CHANGED_ABORT" >&2;exit 1; }
cp -a "$NGINX" "$PRODUCTION_ORIGINAL"
cp -a "$UNIT" "$UNIT.rollback-$SHORT"
# Promote the candidate to use production env, with its already-validated sb_secret.
sed -i "s@EnvironmentFile=$STAGE_ENV@EnvironmentFile=$ENV@" "$UNIT"
grep -Fxq "EnvironmentFile=$ENV" "$UNIT" || { echo "SERVICE_PROMOTION_ENV_FAILED" >&2;exit 1; }
systemctl daemon-reload
systemctl restart "$NEW"
if ! probe;then
  echo "CN3192_PRODUCTION_ENV_GATE_FAILED_ROLLING_BACK" >&2
  cp -a "$UNIT.rollback-$SHORT" "$UNIT"
  systemctl daemon-reload
  systemctl restart "$NEW" || true
  exit 1
fi
python3 - "$NGINX" <<'PY'
import os,sys,tempfile
path=sys.argv[1];old=open(path,"rb").read()
if b"lingxifield.cn" not in old:raise SystemExit("CN_CONFIG_UNEXPECTED")
if old.count(b"127.0.0.1:3191")<1:raise SystemExit("CN_UPSTREAM_CHANGED")
next=old.replace(b"127.0.0.1:3191",b"127.0.0.1:3192")
fd,p=tempfile.mkstemp(prefix=".cn3192-",dir=os.path.dirname(path))
os.fchmod(fd,0o644)
with os.fdopen(fd,"wb") as f:f.write(next)
os.replace(p,path)
PY
rollback(){
  echo "CN_NGINX_POSTCUTOVER_FAILED_RESTORING_3191" >&2
  cp -a "$PRODUCTION_ORIGINAL" "$NGINX"
  nginx -t && systemctl reload nginx || true
}
if ! nginx -t || ! systemctl reload nginx;then rollback; exit 1;fi
for path in / /tools /siai /sasi/pricing /tools/pass;do
  result="$(curl -kfsS --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 \
    --max-time 15 -o /dev/null -w '%{http_code}' "https://lingxifield.cn$path" || true)"
  echo "CN_PUBLIC_NGINX_ROUTE:$path:$result"
  [[ "$result" = 200 ]] || { rollback;exit 1; }
done
systemctl enable "$NEW" >/dev/null
echo "CN_NEW_3192_NGINX_PROMOTION_PASS_ROLLBACK_FILE=$PRODUCTION_ORIGINAL"
echo "ADMIN_AUTHENTICATED_SESSION_AND_REAL_PAYMENT_CONFIRMATIONS_STILL_REQUIRED"
