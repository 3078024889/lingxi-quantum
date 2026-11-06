#!/usr/bin/env bash
# Global SIAI independent ECS STAGING ONLY. No nginx, DNS, production or .com changes.
set -Eeuo pipefail
umask 077
if [[ "$(id -u)" != 0 || "$#" != 1 || "$1" != "--install-private-stage-only" ]]; then
  echo "GLOBALSIAI_STAGE_USAGE: bash script --install-private-stage-only (root)"
  exit 2
fi

NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
USER_NAME=lingxifield
SERVICE=globalsiai-market-stage
UNIT=/etc/systemd/system/globalsiai-market-stage.service
PORT=4289
STAGE=/opt/lingxifield/releases/globalsiai-ecs-stage-cd7b8b2c
DATA=/root/globalsiai-ecs-candidate-20261106-cd7b8b2c
ARCHIVE="$DATA/globalsiai-ecs-candidate.tar.gz"
SHA256=c22b9ccb7976dbc174dc529aca9067a0138f5bde5475f57254eb965c279d688c
BYTES=25976655
BASE=https://github.com/3078024889/lingxi-quantum/releases/download/globalsiai-ecs-candidate-20261106-cd7b8b2c

command -v flock >/dev/null
exec 9>/run/lock/globalsiai-ecs-stage-install.lock
flock -n 9 || { echo GLOBALSIAI_STAGE_CONCURRENT_OPERATION_ABORT; exit 3; }
test -x "$NODE"
id "$USER_NAME" >/dev/null
systemctl is-active --quiet lingxifield-ecs
systemctl is-active --quiet lingxifield-cn-stage
test ! -e "$UNIT" && test ! -L "$UNIT" || { echo GLOBALSIAI_STAGE_EXISTING_UNIT_ABORT; exit 3; }
test ! -e "$STAGE" && test ! -L "$STAGE" || { echo GLOBALSIAI_STAGE_EXISTING_PATH_ABORT; exit 3; }
if ss -H -lnt '( sport = :4289 )' | grep -q .; then
  echo GLOBALSIAI_STAGE_PORT_IN_USE_ABORT
  exit 3
fi
available="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
space="$(df -Pk /opt/lingxifield | awk 'NR==2 {print $4}')"
if (( available < 600000 || space < 900000 )); then
  echo GLOBALSIAI_STAGE_RESOURCE_BUDGET_ABORT
  exit 3
fi
echo GLOBALSIAI_PRECHECK_3188_3189_AND_PORT_PASS

install -d -m 700 "$DATA"
if [ -s "$ARCHIVE" ]; then
  echo "$SHA256  $ARCHIVE" | sha256sum -c --status || {
    echo GLOBALSIAI_EXISTING_ARCHIVE_HASH_MISMATCH_ABORT
    exit 4
  }
  echo GLOBALSIAI_CANDIDATE_ARCHIVE_ALREADY_VERIFIED
else
  URL="$BASE/globalsiai-ecs-candidate.tar.gz"
  echo GLOBALSIAI_DOWNLOAD_VERIFIED_PUBLIC_PRERELEASE_BEGIN
  if ! curl -4fL --retry 4 --retry-delay 3 --connect-timeout 20 \
      --max-time 900 -o "$ARCHIVE" "https://gh-proxy.com/$URL"; then
    rm -f "$ARCHIVE"
    curl -4fL --retry 4 --retry-delay 3 --connect-timeout 20 \
      --max-time 900 -o "$ARCHIVE" "$URL"
  fi
fi
test "$(stat -c %s "$ARCHIVE")" -eq "$BYTES" || {
  echo GLOBALSIAI_CANDIDATE_SIZE_MISMATCH
  exit 4
}
echo "$SHA256  $ARCHIVE" | sha256sum -c -
python3 - "$ARCHIVE" <<'PY'
import sys,tarfile,posixpath
with tarfile.open(sys.argv[1],"r:gz") as archive:
  items=archive.getmembers()
  if not items or len(items)>150000:raise SystemExit("GLOBALSIAI_ARCHIVE_COUNT_INVALID")
  names=set()
  for item in items:
    raw=item.name
    name=posixpath.normpath(raw)
    if raw.startswith("/") or name in ("..",) or name.startswith("../") or "\\" in raw:
      raise SystemExit("GLOBALSIAI_ARCHIVE_PATH_INVALID")
    if item.isdev() or item.isfifo():raise SystemExit("GLOBALSIAI_ARCHIVE_SPECIAL_FILE")
    if item.issym() or item.islnk():
      target=item.linkname
      dest=posixpath.normpath(posixpath.join(posixpath.dirname(name),target))
      if target.startswith("/") or dest in ("..",) or dest.startswith("../"):
        raise SystemExit("GLOBALSIAI_ARCHIVE_ESCAPING_LINK")
    names.add(name)
  if "server.js" not in names or ".next" not in names:
    raise SystemExit("GLOBALSIAI_ARCHIVE_STANDALONE_INVALID")
print("GLOBALSIAI_STANDALONE_ARCHIVE_SAFE=PASS")
PY

stage_created=0
unit_created=0
complete=0
cleanup(){
  rc=$?
  trap - EXIT
  if [ "$complete" -ne 1 ]; then
    if [ "$unit_created" -eq 1 ]; then
      systemctl disable --now "$SERVICE" >/dev/null 2>&1 || true
      rm -f -- "$UNIT"
      systemctl daemon-reload || true
    fi
    if [ "$stage_created" -eq 1 ]; then
      case "$STAGE" in
        /opt/lingxifield/releases/globalsiai-ecs-stage-cd7b8b2c)
          rm -rf -- "$STAGE";;
      esac
    fi
    echo GLOBALSIAI_STAGE_INSTALL_ROLLED_BACK_EXISTING_SITES_UNTOUCHED
  fi
  exit "$rc"
}
trap cleanup EXIT

install -d -m 750 -o "$USER_NAME" -g "$USER_NAME" "$STAGE"
stage_created=1
tar --no-same-owner --no-same-permissions -xzf "$ARCHIVE" -C "$STAGE"
install -d -m 750 -o "$USER_NAME" -g "$USER_NAME" "$STAGE/.next/cache"
chown -R "$USER_NAME:$USER_NAME" "$STAGE"
test -s "$STAGE/server.js"
cat > "$UNIT" <<EOF
[Unit]
Description=Global SIAI Rankings ECS standalone staging on localhost:4289
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$STAGE
Environment=NODE_ENV=production
Environment=HOSTNAME=127.0.0.1
Environment=PORT=$PORT
Environment=AI_MARKET_INDEX_READY=0
Environment=AI_MARKET_DOMAIN_VERIFIED=0
Environment=GLOBALSIAI_CN_ICP_NUMBER=湘ICP备2026031465号-4
Environment=NODE_OPTIONS=--max-old-space-size=384
ExecStart=$NODE $STAGE/server.js
MemoryMax=700M
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
PrivateDevices=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=$STAGE/.next/cache

[Install]
WantedBy=multi-user.target
EOF
unit_created=1
systemctl daemon-reload
systemctl enable --now "$SERVICE"

ready=0
for i in $(seq 1 40); do
  if curl --noproxy '*' -fsS --max-time 4 -o /dev/null \
    "http://127.0.0.1:$PORT/api/v1/health"; then
    ready=1
    break
  fi
  systemctl is-active --quiet "$SERVICE" || true
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  echo GLOBALSIAI_STAGE_STARTUP_NOT_READY
  systemctl status "$SERVICE" --no-pager -l | tail -25 || true
  exit 5
fi

for page in / /zh/ai /en/ai /ja/ai /ko/ai /fr/ai /de/ai /es/ai /pt/ai /ar/ai /api/v1/health /api/v1/data-readiness; do
  code="$(curl --noproxy '*' --silent --max-time 20 -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT$page")"
  echo "GLOBALSIAI_STAGE_ROUTE=$page HTTP=$code"
  [ "$code" = 200 ] || { echo GLOBALSIAI_STAGE_ROUTE_GATE_FAILED; exit 6; }
done

curl --noproxy '*' -fsS --max-time 15 "http://127.0.0.1:$PORT/robots.txt" |
  grep -qi 'Disallow: /' || { echo GLOBALSIAI_STAGE_NOINDEX_FAILED; exit 6; }

cn_file="$(mktemp /tmp/globalsiai-cn-host-XXXXXX)"
com_file="$(mktemp /tmp/globalsiai-com-host-XXXXXX)"
trap 'rm -f "$cn_file" "$com_file"' RETURN
curl --noproxy '*' -fsS --max-time 20 -H "Host: globalsiai.cn" \
  -o "$cn_file" "http://127.0.0.1:$PORT/"
curl --noproxy '*' -fsS --max-time 20 -H "Host: globalsiai.com" \
  -o "$com_file" "http://127.0.0.1:$PORT/"
grep -Fq '湘ICP备2026031465号-4' "$cn_file" || {
 echo GLOBALSIAI_CN_ICP_DISPLAY_GATE_FAILED; exit 6;
}
if grep -Fq '湘ICP备2026031465号-4' "$com_file"; then
 echo GLOBALSIAI_COM_ICP_LEAK_ABORT; exit 6
fi
rm -f "$cn_file" "$com_file"
trap - RETURN

systemctl is-active --quiet lingxifield-ecs
systemctl is-active --quiet lingxifield-cn-stage
systemctl is-active --quiet "$SERVICE"
complete=1
trap - EXIT
echo GLOBALSIAI_STAGE_NINE_LOCALES_ICPLINK_AND_API_PASS
echo GLOBALSIAI_STAGING_ACCEPTED_NO_NGINX_OR_DNS_OR_PRODUCTION_SWITCH
