#!/usr/bin/env bash
# Prepare persistent exact-SHA 3191 release only; do not touch Nginx, 3188/3189, DNS or payments.
set -Eeuo pipefail
umask 077
die(){ echo "CN_PREPARE_ABORT:$*" >&2; exit 1; }
test "$(id -u)" -eq 0 || die ROOT_REQUIRED
for cmd in stat systemctl curl python3 grep awk df; do command -v "$cmd" >/dev/null || die "MISSING_COMMAND:$cmd"; done
SHA=86b956c9700ede4a537c021af3a0dc1df825fa9b
DIR="/opt/lingxifield/cn-staged-releases/$SHA"
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
SERVICE=lingxifield-cn-release-86b956c9700e
UNIT="/etc/systemd/system/$SERVICE.service"
OVERRIDE=/etc/lingxifield/cn-release-notice-86b956c9700e.env
PORT=3191
test -d "$DIR" && test ! -L "$DIR" || die EXACT_RELEASE_DIR_MISSING
test -s "$DIR/server.js" || die RELEASE_SERVER_MISSING
test "$(stat -c %u "$DIR")" = "$(id -u lingxifield)" || die RELEASE_OWNER_MISMATCH
test -x "$NODE" || die NODE24_BINARY_MISSING
"$NODE" --check "$DIR/server.js" || die RELEASE_SERVER_SYNTAX_ERROR
systemctl is-active --quiet lingxifield-ecs || die EXISTING_3188_INACTIVE
systemctl is-active --quiet lingxifield-cn-stage || die EXISTING_3189_INACTIVE
test ! -e "$UNIT" && test ! -e "$OVERRIDE" || die RELEASE_UNIT_ALREADY_EXISTS_NO_OVERWRITE
LIVE_ENV_CONFIG="$(systemctl show lingxifield-ecs -p EnvironmentFiles --value)"
PROD_ENV="$(printf '%s\n' "$LIVE_ENV_CONFIG" | grep -oE '/etc/lingxifield/[a-zA-Z0-9._-]+[.]env' | head -1 || true)"
case "$PROD_ENV" in /etc/lingxifield/*.env) ;; *) die PRODUCTION_ENV_FILE_BINDING_UNKNOWN;; esac
test "$PROD_ENV" != /etc/lingxifield/staging.env || die PRODUCTION_ENV_IS_STAGING
test -f "$PROD_ENV" && test ! -L "$PROD_ENV" || die PRODUCTION_ENV_MISSING_OR_LINK
test "$(stat -c %u "$PROD_ENV")" = 0 || die PRODUCTION_ENV_NOT_ROOT_OWNED
test "$(stat -c %a "$PROD_ENV")" = 600 || test "$(stat -c %a "$PROD_ENV")" = 400 || die PRODUCTION_ENV_PERMISSIONS_INSECURE
MEM="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
test "$MEM" -ge 450000 || die INSUFFICIENT_AVAILABLE_MEMORY
FREE="$(df -Pk /opt/lingxifield | awk 'NR==2 {print $4}')"
test "$FREE" -ge 500000 || die INSUFFICIENT_AVAILABLE_DISK
python3 - <<'PY'
import socket
s=socket.socket()
s.settimeout(1)
try:
    occupied=s.connect_ex(('127.0.0.1',3191)) == 0
finally: s.close()
if occupied: raise SystemExit('CN_PREPARE_ABORT:PORT_3191_OCCUPIED')
PY
made_unit=0
made_override=0
accepted=0
cleanup(){
 rc=$?
 trap - EXIT
 if test "$accepted" != 1; then
  if test "$made_unit" = 1; then
   systemctl stop "$SERVICE" >/dev/null 2>&1 || true
   systemctl disable "$SERVICE" >/dev/null 2>&1 || true
   rm -f -- "$UNIT"
   systemctl daemon-reload || true
  fi
  if test "$made_override" = 1; then rm -f -- "$OVERRIDE"; fi
  echo CN_PREPARE_ROLLED_BACK_OLD_SERVICES_UNTOUCHED
 fi
 exit "$rc"
}
trap cleanup EXIT
cat > "$OVERRIDE" <<'EOF'
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=3191
LINGXI_MAINTENANCE_NOTICE_ENABLED=1
LINGXI_MAINTENANCE_NOTICE_APPROVED=1
EOF
chmod 600 "$OVERRIDE"
made_override=1
cat > "$UNIT" <<EOF
[Unit]
Description=LINGXIFIELD .cn exact approved-announcement release 86b956c (independent canary)
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=lingxifield
Group=lingxifield
WorkingDirectory=$DIR
EnvironmentFile=$PROD_ENV
EnvironmentFile=$OVERRIDE
ExecStart=$NODE $DIR/server.js
Restart=on-failure
RestartSec=4
TimeoutStopSec=25
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF
chmod 600 "$UNIT"
made_unit=1
systemd-analyze verify "$UNIT" || die INVALID_SYSTEMD_UNIT
systemctl daemon-reload
systemctl start "$SERVICE" || die START_FAILED
ready=0
for i in $(seq 1 35); do
 code="$(curl --noproxy '*' -s --max-time 3 -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/api/health" || true)"
 if test "$code" = 200; then ready=1; break; fi
 sleep 2
done
test "$ready" = 1 || die HEALTH_CHECK_FAILED
probe(){
 path="$1"; expected="$2"
 got="$(curl --noproxy '*' -s --max-time 25 -o /dev/null -w '%{http_code}' -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$PORT$path" || true)"
 echo "CN_PERSISTENT_ROUTE:$path:$got"
 test "$got" = "$expected" || die "HTTP_GATE_FAILED:$path"
}
probe / 200
probe /tools 200
probe /siai 200
probe /api/site-release-announcement 200
probe /api/sasi/account 401
probe /api/tools/jobs 401
TMPJSON="$(mktemp)"
trap 'rm -f -- "$TMPJSON"; cleanup' EXIT
curl --noproxy '*' -fsS --max-time 15 -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$PORT/api/site-release-announcement" -o "$TMPJSON" || die NOTICE_JSON_FAILED
python3 - "$TMPJSON" <<'PY'
import sys,json
with open(sys.argv[1],'r') as f: data=json.load(f)
if data.get('enabled') is not True or data.get('phase') != 'maintenance' or data.get('site') != 'main':
 raise SystemExit('CN_PREPARE_ABORT:APPROVED_MAINTENANCE_NOTICE_NOT_ENABLED')
print('CN_APPROVED_MAINTENANCE_NOTICE_ENABLED')
PY
rm -f -- "$TMPJSON"
trap cleanup EXIT
systemctl is-active --quiet "$SERVICE" || die NEW_PERSISTENT_UNIT_INACTIVE
systemctl is-active --quiet lingxifield-ecs || die OLD_PRODUCTION_INACTIVE
systemctl is-active --quiet lingxifield-cn-stage || die OLD_STAGE_INACTIVE
systemctl enable "$SERVICE" >/dev/null || die PERSISTENT_ENABLE_FAILED
accepted=1
trap - EXIT
echo "CN_PERSISTENT_RELEASE_READY=1"
echo "CN_NEW_SERVICE=$SERVICE"
echo "CN_NEW_PORT=3191"
echo "CN_3188_3189_UNTOUCHED=true"
echo "CN_NGINX_UNTOUCHED=true"
echo "CN_PUBLIC_CUTOVER_NOT_DONE=true"
