#!/usr/bin/env bash
# Global SIAI release announcement canary, no public Nginx switch.
set -Eeuo pipefail
umask 077
if [ "$#" != 1 ] || [ "$1" != "--install-private-4290" ] || [ "$(id -u)" != 0 ]; then
  echo GLOBALSIAI_NOTICE_CANARY_USAGE
  exit 2
fi
RELEASE_TAG=globalsiai-announcement-candidate-20261106-d754cade
SHA256=3b3a3d597a65a2047ddfbc2fa70bf85892c0c193d9a8e74b63bfbf78a4877344
BYTES=28085353
DATA=/root/globalsiai-announcement-candidate-d754cade
ARCHIVE="$DATA/globalsiai-announcement-candidate.tar.gz"
ROOT=/opt/lingxifield/releases/globalsiai-market-notice-d754cade
UNIT=/etc/systemd/system/globalsiai-market-notice-canary.service
SERVICE=globalsiai-market-notice-canary
OLD=globalsiai-market-stage
USER_NAME=lingxifield
PORT=4290
BASE=https://github.com/3078024889/lingxi-quantum/releases/download/$RELEASE_TAG
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
exec 9>/run/lock/globalsiai-announcement-canary.lock
flock -n 9 || { echo GLOBALSIAI_NOTICE_CANARY_LOCKED_ABORT; exit 3; }
test -x "$NODE"
id "$USER_NAME" >/dev/null
for svc in "$OLD" lingxifield-ecs lingxifield-cn-stage nginx; do
  systemctl is-active --quiet "$svc" || { echo "GLOBALSIAI_NOTICE_REQUIRED_SERVICE_FAILED=$svc"; exit 3; }
done
for site in cn com; do
  config="/etc/nginx/conf.d/98-globalsiai-$site-only.conf"
  test -f "$config"
  grep -Fq 'proxy_pass http://127.0.0.1:4289;' "$config" || {
    echo "GLOBALSIAI_NOTICE_BASELINE_4289_ROUTING_MISMATCH=$site"; exit 3;
  }
done
test ! -e "$ROOT" && test ! -L "$ROOT" || { echo GLOBALSIAI_NOTICE_EXISTING_STAGE_ABORT; exit 3; }
test ! -e "$UNIT" && test ! -L "$UNIT" || { echo GLOBALSIAI_NOTICE_EXISTING_UNIT_ABORT; exit 3; }
if ss -H -lnt '( sport = :4290 )' | grep -q .; then
 echo GLOBALSIAI_NOTICE_4290_PORT_IN_USE_ABORT; exit 3
fi
if [ "$(df -Pk /opt/lingxifield | awk 'NR==2{print $4}')" -lt 500000 ]; then
 echo GLOBALSIAI_NOTICE_FREE_DISK_INSUFFICIENT; exit 3
fi
echo GLOBALSIAI_NOTICE_BASELINE_SERVICES_4289_PRESERVED

install -d -m 700 "$DATA"
if [ ! -s "$ARCHIVE" ]; then
  url="$BASE/globalsiai-announcement-candidate.tar.gz"
  if ! curl -4fLsS --retry 3 --max-time 800 -o "$ARCHIVE" "https://gh-proxy.com/$url"; then
    rm -f "$ARCHIVE"
    curl -4fLsS --retry 3 --max-time 800 -o "$ARCHIVE" "$url"
  fi
fi
test "$(stat -c %s "$ARCHIVE")" -eq "$BYTES" || { echo GLOBALSIAI_NOTICE_ARCHIVE_SIZE_BAD; exit 4; }
echo "$SHA256  $ARCHIVE" | sha256sum -c -
python3 - "$ARCHIVE" <<'PY'
import sys,tarfile,posixpath
with tarfile.open(sys.argv[1],"r:gz") as tar:
    members=tar.getmembers()
    if not members or len(members)>150000:raise SystemExit("INVALID_ARCHIVE_COUNT")
    paths=set()
    for member in members:
        name=posixpath.normpath(member.name)
        if member.name.startswith('/') or name=='..' or name.startswith('../') or '\\' in member.name:
            raise SystemExit("ARCHIVE_TRAVERSAL_ABORT")
        if member.isdev() or member.isfifo():raise SystemExit("ARCHIVE_SPECIAL_TYPE_ABORT")
        if member.issym() or member.islnk():
            target=member.linkname
            dest=posixpath.normpath(posixpath.join(posixpath.dirname(name),target))
            if target.startswith('/') or dest=='..' or dest.startswith('../'):
                raise SystemExit("ARCHIVE_ESCAPING_LINK_ABORT")
        paths.add(name)
    if 'server.js' not in paths or '.next' not in paths:
        raise SystemExit("INVALID_NEXT_STANDALONE")
print("GLOBALSIAI_NOTICE_ARCHIVE_PATHS_SAFE")
PY

stage_created=0
unit_created=0
success=0
rollback(){
 rc=$?
 trap - EXIT
 if [ "$success" -ne 1 ]; then
   if [ "$unit_created" -eq 1 ]; then
     systemctl disable --now "$SERVICE" >/dev/null 2>&1 || true
     rm -f -- "$UNIT"
     systemctl daemon-reload || true
   fi
   if [ "$stage_created" -eq 1 ]; then
     rm -rf -- "$ROOT"
   fi
   echo GLOBALSIAI_NOTICE_CANARY_ROLLBACK_4289_UNTOUCHED
 fi
 exit "$rc"
}
trap rollback EXIT
install -d -m 750 -o "$USER_NAME" -g "$USER_NAME" "$ROOT"
stage_created=1
tar --no-same-owner --no-same-permissions -xzf "$ARCHIVE" -C "$ROOT"
install -d -m 750 -o "$USER_NAME" -g "$USER_NAME" "$ROOT/.next/cache"
chown -R "$USER_NAME:$USER_NAME" "$ROOT"

cat > "$UNIT" <<EOF
[Unit]
Description=Global SIAI announcement release canary, localhost 4290
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$ROOT
Environment=NODE_ENV=production
Environment=HOSTNAME=127.0.0.1
Environment=PORT=4290
Environment=GLOBALSIAI_RELEASE_NOTICE_ENABLED=1
Environment=AI_MARKET_INDEX_READY=0
Environment=AI_MARKET_DOMAIN_VERIFIED=0
Environment=NODE_OPTIONS=--max-old-space-size=384
Environment=GLOBALSIAI_CN_ICP_NUMBER=湘ICP备2026031465号-4
ExecStart=$NODE $ROOT/server.js
MemoryMax=700M
Restart=on-failure
RestartSec=4
NoNewPrivileges=true
PrivateTmp=true
PrivateDevices=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$ROOT/.next/cache

[Install]
WantedBy=multi-user.target
EOF
unit_created=1
systemctl daemon-reload
systemctl enable --now "$SERVICE"
ready=0
for i in $(seq 1 50); do
  if curl --noproxy '*' -fsS --max-time 4 -o /dev/null \
    "http://127.0.0.1:4290/api/v1/health"; then ready=1; break; fi
  sleep 1
done
if [ "$ready" != 1 ]; then echo GLOBALSIAI_NOTICE_CANARY_HEALTH_FAILED; exit 5; fi
for path in / /zh/ai /en/ai /ja/ai /ko/ai /fr/ai /de/ai /es/ai /pt/ai /ar/ai /api/v1/health /api/v1/data-readiness; do
  code="$(curl --noproxy '*' -sS --max-time 20 -o /dev/null -w '%{http_code}' \
   "http://127.0.0.1:4290$path")"
  echo "GLOBALSIAI_NOTICE_4290_ROUTE=$path HTTP=$code"
  test "$code" = 200 || exit 6
done
curl --noproxy '*' -fsS --max-time 12 "http://127.0.0.1:4290/api/site-release-announcement" |
  grep -Fq '"enabled":true' || { echo GLOBALSIAI_NOTICE_RUNTIME_GATE_FAILED; exit 6; }
curl --noproxy '*' -fsS --max-time 12 "http://127.0.0.1:4290/robots.txt" |
  grep -qi 'Disallow: /' || { echo GLOBALSIAI_NOTICE_NOINDEX_GATE_FAILED; exit 6; }
for domain in globalsiai.cn globalsiai.com; do
 curl --noproxy '*' -fsS --max-time 15 -H "Host: $domain" \
  "http://127.0.0.1:4290/" >/tmp/globalsiai-announcement-$domain.html
done
grep -Fq '湘ICP备2026031465号-4' /tmp/globalsiai-announcement-globalsiai.cn.html
if grep -Fq '湘ICP备2026031465号-4' /tmp/globalsiai-announcement-globalsiai.com.html; then
  echo GLOBALSIAI_NOTICE_MAINLAND_ICP_LEAK_TO_COM_ABORT; exit 6
fi
rm -f /tmp/globalsiai-announcement-globalsiai.cn.html /tmp/globalsiai-announcement-globalsiai.com.html
systemctl is-active --quiet "$OLD"
systemctl is-active --quiet lingxifield-ecs
systemctl is-active --quiet lingxifield-cn-stage
success=1
trap - EXIT
echo GLOBALSIAI_NOTICE_4290_ACCEPTED_4289_AND_PUBLIC_NGINX_UNCHANGED
