#!/usr/bin/env bash
# Atomic dual-site public switchover from vetted 4289 to announcement 4290.
# Does not touch lingxifield.cn main 3188/3189, payment, DB or Vercel.
set -Eeuo pipefail
umask 077
if [ "$#" -ne 1 ] || [ "$1" != "--promote-market-4290-two-domains" ] || [ "$(id -u)" != 0 ]; then
 echo GLOBALSIAI_NOTICE_PROMOTION_USAGE; exit 2
fi
OLD_PORT=4289
NEW_PORT=4290
VHOST_CN=/etc/nginx/conf.d/98-globalsiai-cn-only.conf
VHOST_COM=/etc/nginx/conf.d/98-globalsiai-com-only.conf
BACKUP="$(mktemp -d /opt/lingxifield/backups/globalsiai-notice-switch-XXXXXX)"
changed=0
accepted=0
rollback(){
 code=$?
 trap - EXIT
 if [ "$accepted" -ne 1 ]; then
  if [ "$changed" -eq 1 ]; then
   for site in cn com; do
    source="$BACKUP/98-globalsiai-$site-only.conf"
    destination="/etc/nginx/conf.d/98-globalsiai-$site-only.conf"
    if [ -s "$source" ]; then cp -p -- "$source" "$destination"; fi
   done
   if nginx -t >/dev/null 2>&1; then
      systemctl reload nginx || true
   else
      echo GLOBALSIAI_NOTICE_RESTORED_CONFIG_NEEDS_NGINX_REVIEW
   fi
  fi
  echo GLOBALSIAI_NOTICE_PROMOTION_REVERTED_TO_4289
 fi
 exit "$code"
}
trap rollback EXIT
exec 9>/run/lock/globalsiai-dual-domain-public.lock
flock -n 9 || { echo GLOBALSIAI_NOTICE_NGINX_RELEASE_LOCKED; exit 3; }
for svc in nginx globalsiai-market-stage globalsiai-market-notice-canary lingxifield-ecs lingxifield-cn-stage; do
  systemctl is-active --quiet "$svc" || {
    echo "GLOBALSIAI_NOTICE_REQUIRED_SERVICE_INACTIVE=$svc"; exit 3;
  }
done
for site in cn com; do
  file="/etc/nginx/conf.d/98-globalsiai-$site-only.conf"
  if [ ! -f "$file" ] || [ -L "$file" ]; then
    echo "GLOBALSIAI_NOTICE_VHOST_MISSING_OR_SYMLINK=$site"; exit 3;
  fi
  count="$(grep -Fc 'proxy_pass http://127.0.0.1:4289;' "$file" || true)"
  if [ "$count" -ne 1 ]; then
    echo "GLOBALSIAI_NOTICE_UNEXPECTED_UPSTREAM=$site COUNT=$count"; exit 3;
  fi
  cp -p -- "$file" "$BACKUP/98-globalsiai-$site-only.conf"
done
nginx -t
echo "GLOBALSIAI_NOTICE_ROLLBACK_CONFIG_DIR=$BACKUP"
for path in / /zh/ai /en/ai /ja/ai /ko/ai /fr/ai /de/ai /es/ai /pt/ai /ar/ai /api/v1/health /api/v1/data-readiness; do
  code="$(curl --noproxy '*' -sS --max-time 15 -o /dev/null -w '%{http_code}' \
    "http://127.0.0.1:$NEW_PORT$path")"
  echo "GLOBALSIAI_NOTICE_CANDIDATE_PATH=$path HTTP=$code"
  test "$code" = 200 || { echo GLOBALSIAI_NOTICE_CANDIDATE_ROUTE_FAILED; exit 4; }
done
curl --noproxy '*' -fsS --max-time 10 \
  "http://127.0.0.1:$NEW_PORT/api/site-release-announcement" |
  grep -Fq '"enabled":true' || {
    echo GLOBALSIAI_NOTICE_CANDIDATE_POPUP_NOT_ENABLED; exit 4;
  }
curl --noproxy '*' -fsS --max-time 10 "http://127.0.0.1:$NEW_PORT/robots.txt" |
  grep -qi 'Disallow: /' || { echo GLOBALSIAI_NOTICE_NOINDEX_FAILED; exit 4; }

PID_3188="$(systemctl show -p MainPID --value lingxifield-ecs)"
PID_3189="$(systemctl show -p MainPID --value lingxifield-cn-stage)"
PID_4289="$(systemctl show -p MainPID --value globalsiai-market-stage)"
echo "=== Move only both Global SIAI Nginx upstreams to 4290 ==="
python3 - "$VHOST_CN" "$VHOST_COM" <<'PY'
import pathlib,sys,os,tempfile
old="proxy_pass http://127.0.0.1:4289;"
new="proxy_pass http://127.0.0.1:4290;"
for path in map(pathlib.Path,sys.argv[1:]):
    text=path.read_text()
    if text.count(old)!=1:raise SystemExit("GLOBALSIAI_UPSTREAM_COUNT_MISMATCH")
    stat=path.stat()
    tmp=path.with_name(path.name+".tmp-announcement")
    if tmp.exists():raise SystemExit("GLOBALSIAI_TEMP_CONFIG_COLLISION")
    tmp.write_text(text.replace(old,new))
    os.chmod(tmp,stat.st_mode&0o777)
    os.replace(tmp,path)
print("GLOBALSIAI_BOTH_CONFIGS_PATCHED_TO_4290")
PY
changed=1
nginx -t
systemctl reload nginx
echo "=== Real local TLS SNI routes for CN and COM on new 4290 ==="
for domain in globalsiai.cn globalsiai.com; do
 for path in / /zh/ai /en/ai /ja/ai /ko/ai /fr/ai /de/ai /es/ai /pt/ai /ar/ai /api/v1/health /api/v1/data-readiness; do
   expected=200; ready=0; code=000
   for attempt in 1 15; do
     code="$(curl --noproxy '*' -sS --max-time 12 \
       --resolve "$domain:443:127.0.0.1" \
       -o /dev/null -w '%{http_code}' "https://$domain$path" 2>/dev/null)" && rc=0 || rc=$?
     if [ "$rc" = 0 ] && [ "$code" = "$expected" ]; then ready=1; break; fi
     if [ "$attempt" -lt 15 ]; then sleep 1; fi
   done
   echo "GLOBALSIAI_NOTICE_TLS_HOST=$domain PATH=$path HTTP=$code RESULT=$ready"
   test "$ready" = 1 || { echo GLOBALSIAI_NOTICE_PRODUCTION_ROUTE_GATE_FAILED; exit 5; }
 done
 if ! curl --noproxy '*' -fsS --max-time 12 \
  --resolve "$domain:443:127.0.0.1" \
  "https://$domain/api/site-release-announcement" |
  grep -Fq '"enabled":true'; then
    echo "GLOBALSIAI_NOTICE_PRODUCTION_POPUP_GATE_FAILED=$domain"; exit 5;
 fi
done
for domain in www.globalsiai.cn www.globalsiai.com; do
 headers="$(curl --noproxy '*' -sS -D - -o /dev/null --max-time 12 \
   --resolve "$domain:443:127.0.0.1" "https://$domain/")"
 code="$(printf '%s\n' "$headers" | head -1)"
 echo "GLOBALSIAI_NOTICE_WWW=$domain STATUS=$code"
 printf '%s\n' "$code" | grep -Eq '^HTTP/[^ ]+ 301' || exit 5
done
cn_page="$(curl --noproxy '*' -fsS --max-time 15 --resolve 'globalsiai.cn:443:127.0.0.1' https://globalsiai.cn/)"
com_page="$(curl --noproxy '*' -fsS --max-time 15 --resolve 'globalsiai.com:443:127.0.0.1' https://globalsiai.com/)"
grep -Fq '湘ICP备2026031465号-4' <<<"$cn_page" || exit 5
if grep -Fq '湘ICP备2026031465号-4' <<<"$com_page"; then
 echo GLOBALSIAI_NOTICE_COM_ICP_LEAK_FAILED; exit 5
fi
test "$(systemctl show -p MainPID --value lingxifield-ecs)" = "$PID_3188"
test "$(systemctl show -p MainPID --value lingxifield-cn-stage)" = "$PID_3189"
test "$(systemctl show -p MainPID --value globalsiai-market-stage)" = "$PID_4289"
systemctl is-active --quiet globalsiai-market-notice-canary
accepted=1
trap - EXIT
echo GLOBALSIAI_BOTH_MARKET_DOMAINS_NOTICE_4290_LIVE_ACCEPTED
echo "GLOBALSIAI_NOTICE_BACKUP_FOR_MANUAL_ROLLBACK=$BACKUP"
