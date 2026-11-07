#!/usr/bin/env bash
# .cn-only upgrade, never changes .com, lingxifield.cn, DB or payment.
set -Eeuo pipefail
umask 077
if [ "$(id -u)" != 0 ] || [ "$#" != 1 ] || [ "$1" != "--publish-cn-only-4290" ]; then
  echo GLOBALSIAI_CN_ONLY_USAGE; exit 2
fi
CN=/etc/nginx/conf.d/98-globalsiai-cn-only.conf
COM=/etc/nginx/conf.d/98-globalsiai-com-only.conf
exec 9>/run/lock/globalsiai-dual-domain-public.lock
flock -n 9 || { echo GLOBALSIAI_CN_LOCK_BUSY; exit 3; }
for s in nginx lingxifield-ecs lingxifield-cn-stage globalsiai-market-stage globalsiai-market-notice-canary; do
  systemctl is-active --quiet "$s" || { echo "GLOBALSIAI_CN_REQUIRED_SERVICE_FAILED=$s"; exit 3; }
done
test -f "$CN" && test ! -L "$CN"
test -d /opt/lingxifield/backups
test "$(grep -Fc 'proxy_pass http://127.0.0.1:4289;' "$CN" || true)" = 1 || {
  echo GLOBALSIAI_CN_BASELINE_UPSTREAM_INVALID; exit 3;
}
nginx -t
orig_pids="$(for s in lingxifield-ecs lingxifield-cn-stage globalsiai-market-stage; do systemctl show "$s" -p MainPID --value; done)"
com_hash=""
if [ -f "$COM" ] && [ ! -L "$COM" ]; then com_hash="$(sha256sum "$COM" | awk '{print $1}')"; fi
backup="$(mktemp -d /opt/lingxifield/backups/globalsiai-cn-only-4290-XXXXXXXX)"
cp -p "$CN" "$backup/cn.conf"
changed=0
accepted=0
cleanup(){
  code=$?
  trap - EXIT
  if [ "$accepted" != 1 ]; then
    if [ "$changed" = 1 ]; then
      cp -p "$backup/cn.conf" "$CN"
      if nginx -t >/dev/null 2>&1; then systemctl reload nginx || true; fi
    fi
    echo "GLOBALSIAI_CN_ONLY_ROLLED_BACK_TO_4289 BACKUP=$backup"
  fi
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

echo "GLOBALSIAI_CN_ONLY_ROLLBACK_BACKUP=$backup"
for path in / /zh/ai /en/ai /ja/ai /ko/ai /fr/ai /de/ai /es/ai /pt/ai /ar/ai /api/v1/health /api/v1/data-readiness; do
  code="$(curl --noproxy '*' -sS --max-time 18 -H 'Host: globalsiai.cn' -o /dev/null \
    -w '%{http_code}' "http://127.0.0.1:4290$path")"
  echo "GLOBALSIAI_CN_4290_PRECHECK=$path HTTP=$code"
  test "$code" = 200 || exit 4
done
curl --noproxy '*' -fsS --max-time 12 -H 'Host: globalsiai.cn' \
  http://127.0.0.1:4290/api/site-release-announcement |
  grep -Fq '"enabled":true' || exit 4
curl --noproxy '*' -fsS --max-time 12 -H 'Host: globalsiai.cn' \
  http://127.0.0.1:4290/robots.txt | grep -qi 'Disallow: /' || exit 4
page="$(curl --noproxy '*' -fsS --max-time 20 -H 'Host: globalsiai.cn' http://127.0.0.1:4290/)"
grep -Fq '湘ICP备2026031465号-4' <<<"$page" || { echo GLOBALSIAI_CN_ICP_MISSING; exit 4; }
unset page
changed=1
python3 - "$CN" <<'PY'
import os,sys,stat,tempfile
name=sys.argv[1]
old='proxy_pass http://127.0.0.1:4289;'
new='proxy_pass http://127.0.0.1:4290;'
with open(name,'r') as f:data=f.read()
if data.count(old)!=1 or new in data:raise SystemExit('CN_NGINX_UNEXPECTED_CONTENT')
mode=stat.S_IMODE(os.stat(name).st_mode)
fd,tmp=tempfile.mkstemp(prefix='.cn-4290-',dir=os.path.dirname(name))
try:
    with os.fdopen(fd,'w') as out:
        out.write(data.replace(old,new))
        out.flush()
        os.fsync(out.fileno())
    os.chmod(tmp,mode)
    os.replace(tmp,name)
except BaseException:
    if os.path.exists(tmp):os.unlink(tmp)
    raise
PY
nginx -t
systemctl reload nginx
for path in / /zh/ai /en/ai /ja/ai /ko/ai /fr/ai /de/ai /es/ai /pt/ai /ar/ai /api/v1/health /api/v1/data-readiness; do
  ready=0
  for attempt in 1 12; do
    code="$(curl --noproxy '*' -sS --max-time 12 \
      --resolve globalsiai.cn:443:127.0.0.1 \
      -o /dev/null -w '%{http_code}' "https://globalsiai.cn$path" 2>/dev/null)" && rc=0 || rc=$?
    if [ "$rc" = 0 ] && [ "$code" = 200 ]; then ready=1; break; fi
    sleep 1
  done
  echo "GLOBALSIAI_CN_SNI_TEST=$path HTTP=$code OK=$ready"
  test "$ready" = 1 || exit 5
done
curl --noproxy '*' -fsS --max-time 12 --resolve globalsiai.cn:443:127.0.0.1 \
  https://globalsiai.cn/api/site-release-announcement |
  grep -Fq '"enabled":true' || exit 5
cn_html="$(curl --noproxy '*' -fsS --max-time 20 --resolve globalsiai.cn:443:127.0.0.1 https://globalsiai.cn/)"
grep -Fq '湘ICP备2026031465号-4' <<<"$cn_html" || exit 5
headers="$(curl --noproxy '*' -sS -D - -o /dev/null --max-time 12 \
  --resolve www.globalsiai.cn:443:127.0.0.1 https://www.globalsiai.cn/)"
printf '%s\n' "$headers" | head -1 | grep -Eq '^HTTP/[^ ]+ 301' || exit 5
printf '%s\n' "$headers" | grep -Eiq '^location:[[:space:]]*https://globalsiai.cn/' || exit 5
new_pids="$(for s in lingxifield-ecs lingxifield-cn-stage globalsiai-market-stage; do systemctl show "$s" -p MainPID --value; done)"
test "$orig_pids" = "$new_pids" || exit 5
if [ -n "$com_hash" ]; then
  test "$(sha256sum "$COM" | awk '{print $1}')" = "$com_hash" || exit 5
fi
accepted=1
trap - EXIT
echo GLOBALSIAI_CN_ONLY_4290_HTTPS_RELEASE_ACCEPTED
echo "GLOBALSIAI_CN_ONLY_BACKUP=$backup"
