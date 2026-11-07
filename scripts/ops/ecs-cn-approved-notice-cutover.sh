#!/usr/bin/env bash
# Strict .cn public cutover from 3188 to already-tested persistent exact-SHA 3191.
# Keeps production 3188 + staging 3189 intact; atomic nginx.conf rollback on any failure.
set -Eeuo pipefail
umask 077
die(){ echo "CN_PUBLIC_ABORT:$*" >&2; exit 1; }
test "$(id -u)" = 0 || die ROOT_REQUIRED
test "$#" = 1 && test "$1" = --promote-cn-exact-approved-notice || die EXPLICIT_OPERATOR_OPT_IN_REQUIRED
for cmd in systemctl nginx awk grep curl python3 cp chmod stat sort; do command -v "$cmd" >/dev/null || die "MISSING_COMMAND:$cmd"; done
SVC=lingxifield-cn-release-86b956c9700e
DIR=/opt/lingxifield/cn-staged-releases/86b956c9700ede4a537c021af3a0dc1df825fa9b
for svc in "$SVC" lingxifield-ecs lingxifield-cn-stage; do systemctl is-active --quiet "$svc" || die "SERVICE_NOT_ACTIVE:$svc"; done
test "$(systemctl show "$SVC" -p WorkingDirectory --value)" = "$DIR" || die SOURCE_SHA_WORKDIR_MISMATCH
test "$(systemctl show lingxifield-ecs -p WorkingDirectory --value)" != "$DIR" || die PRODUCTION_ALREADY_ON_CANDIDATE
test "$(systemctl show lingxifield-cn-stage -p WorkingDirectory --value)" != "$DIR" || die STAGING_COLLISION
probe(){
 port="$1"; path="$2"; expected="$3"
 got="$(curl --noproxy '*' -sS --max-time 20 -o /dev/null -w '%{http_code}' -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$port$path" 2>/dev/null || true)"
 echo "CN_LOCAL_CUTOVER_GATE:$port:$path:$got"
 test "$got" = "$expected" || die "LOCAL_HTTP_MISMATCH:$port:$path"
}
probe 3191 /api/health 200
probe 3191 / 200
probe 3191 /tools 200
probe 3191 /siai 200
probe 3191 /api/site-release-announcement 200
probe 3191 /api/sasi/account 401
probe 3191 /api/tools/jobs 401
probe 3188 /api/health 200
probe 3189 /api/health 200
notice="$(curl --noproxy '*' -fsS --max-time 12 -H 'Host: lingxifield.cn' http://127.0.0.1:3191/api/site-release-announcement)"
printf '%s' "$notice" | python3 -c 'import json,sys; j=json.load(sys.stdin); assert j.get("enabled") is True and j.get("phase")=="maintenance" and j.get("site")=="main", "NOTICE_NOT_ACTIVE"'
# The actual anonymous document engine health gate must report >=6 working adapters.
ENGINE_REPORT="$(mktemp)"
trap 'rm -f -- "$ENGINE_REPORT"' EXIT
curl --noproxy '*' -fsS --max-time 25 -H 'Host: lingxifield.cn' http://127.0.0.1:3191/api/tools/engine/health -o "$ENGINE_REPORT" || die DOCUMENT_ENGINES_NOT_REACHABLE
python3 - "$ENGINE_REPORT" <<'PY'
import sys,json
with open(sys.argv[1]) as f: state=json.load(f)
n=int(state.get('summary',{}).get('available',0))
if n<6: raise SystemExit('CN_PUBLIC_ABORT:NEED_SIX_REAL_DOCUMENT_ENGINES')
print('CN_PUBLIC_DOCUMENT_ENGINES='+str(n))
PY
rm -f -- "$ENGINE_REPORT"
trap - EXIT
nginx -t || die EXISTING_NGINX_CONFIG_INVALID
CONFIG=""
# Discover the one exact .cn vhost file, without changing .com or other zones.
FILES="$(nginx -T 2>&1 | awk '/^# configuration file /{sub(/^# configuration file /,"");sub(/:$/,"");print}' | sort -u)"
MATCHES=0
while IFS= read -r f; do
 test -f "$f" && test ! -L "$f" || continue
 if grep -Fq 'server_name lingxifield.cn www.lingxifield.cn;' "$f" && grep -Fq 'proxy_pass http://127.0.0.1:3188;' "$f"; then
  CONFIG="$f"; MATCHES=$((MATCHES+1))
 fi
done <<< "$FILES"
test "$MATCHES" -eq 1 || die "CN_NGINX_VHOST_AMBIGUOUS:$MATCHES"
test "$(grep -Fc 'proxy_pass http://127.0.0.1:3188;' "$CONFIG")" -eq 1 || die CN_NGINX_UPSTREAM_NOT_UNIQUE
BACKUP="$CONFIG.rollback-86b956c-$(date -u +%Y%m%dT%H%M%SZ)"
cp -a -- "$CONFIG" "$BACKUP" || die BACKUP_FAILED
test -s "$BACKUP" || die BACKUP_EMPTY
modified=0
accepted=0
rollback(){
 rc=$?
 trap - EXIT
 if test "$modified" = 1 && test "$accepted" != 1; then
  cp -a -- "$BACKUP" "$CONFIG"
  nginx -t && nginx -s reload || true
  echo CN_PUBLIC_ROLLBACK_TO_3188_DONE
 fi
 exit "$rc"
}
trap rollback EXIT
python3 - "$CONFIG" <<'PY'
import sys,os,stat,tempfile
path=sys.argv[1]
with open(path,'rb') as f: content=f.read()
old=b'proxy_pass http://127.0.0.1:3188;'
new=b'proxy_pass http://127.0.0.1:3191;'
if content.count(old)!=1: raise SystemExit('CN_PUBLIC_ABORT:NGINX_UPSTREAM_UNEXPECTED')
st=os.stat(path)
fd,tmp=tempfile.mkstemp(prefix='.cn-switch-',dir=os.path.dirname(path))
try:
 os.fchmod(fd,stat.S_IMODE(st.st_mode))
 os.fchown(fd,st.st_uid,st.st_gid)
 with os.fdopen(fd,'wb') as f: f.write(content.replace(old,new));f.flush();os.fsync(f.fileno())
 os.replace(tmp,path)
except BaseException:
 try: os.unlink(tmp)
 except OSError: pass
 raise
PY
modified=1
nginx -t || die NEW_NGINX_CONFIG_INVALID
nginx -s reload || die NEW_NGINX_RELOAD_FAILED
PUBLIC_JSON="$(mktemp)"
trap 'rm -f -- "$PUBLIC_JSON"; rollback' EXIT
check_public(){
 host="$1"; path="$2"; expected="$3"
 got="$(curl --noproxy '*' --resolve "$host:443:127.0.0.1" -sS --max-time 25 -o /dev/null -w '%{http_code}' "https://$host$path" 2>/dev/null || true)"
 echo "CN_NGINX_LIVE_GATE:$host:$path:$got"
 test "$got" = "$expected" || die "PUBLIC_HTTP_MISMATCH:$host:$path"
}
check_public lingxifield.cn / 200
check_public lingxifield.cn /tools 200
check_public lingxifield.cn /siai 200
check_public lingxifield.cn /api/site-release-announcement 200
check_public lingxifield.cn /api/sasi/account 401
check_public www.lingxifield.cn / 200
curl --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 -fsS --max-time 15 https://lingxifield.cn/api/site-release-announcement -o "$PUBLIC_JSON" || die PUBLIC_NOTICE_BODY_FAILURE
python3 - "$PUBLIC_JSON" <<'PY'
import sys,json
with open(sys.argv[1]) as f:j=json.load(f)
assert j.get("enabled") is True and j.get("phase")=="maintenance", "LIVE_NOTICE_GATE_FAILED"
print('CN_PUBLIC_APPROVED_NOTICE_VISIBLE')
PY
rm -f -- "$PUBLIC_JSON"
trap rollback EXIT
for svc in "$SVC" lingxifield-ecs lingxifield-cn-stage; do systemctl is-active --quiet "$svc" || die "POST_CUTOVER_SERVICE_INACTIVE:$svc"; done
accepted=1
trap - EXIT
echo CN_PUBLIC_NGINX_SWITCH_SUCCESS
echo "CN_PUBLIC_NEW_APP=$DIR"
echo "CN_ROLLBACK_NGINX_FILE=$BACKUP"
echo CN_OLD_3188_AND_3189_ACTIVE=true
echo CN_COM_AND_GLOBALSIAI_DNS_UNTOUCHED=true
echo CN_PAYMENT_AND_REAL_LOGIN_E2E_NOT_ATTESTED=true
