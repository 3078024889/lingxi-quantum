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
# Public release gate: real site route/auth/notice checks above plus one functional
# tiny image conversion in the known available Sharp runtime. Optional backends
# must be reported, not misclassified as a hard requirement for client-side tools.
ENGINE_REPORT="$(mktemp)"
trap 'rc=$?; rm -f -- "$ENGINE_REPORT"; exit "$rc"' EXIT
curl --noproxy '*' -fsS --max-time 40 \
  -H 'Host: lingxifield.cn' \
  http://127.0.0.1:3191/api/tools/engine/health \
  -o "$ENGINE_REPORT" || die DOCUMENT_ENGINE_REPORT_UNREACHABLE
python3 - "$ENGINE_REPORT" <<'PY'
import json,sys
try:
 with open(sys.argv[1]) as f: data=json.load(f)
 engines=data["engines"]
 assert isinstance(engines,list) and len(engines)>=20, "ENGINE_REGISTRY_INCOMPLETE"
 assert len({x.get("id") for x in engines})==len(engines), "DUPLICATE_ENGINE_IDS"
 summary=data["summary"]
 available=sum(1 for x in engines if x.get("available") is True)
 assert available==summary.get("available"), "ENGINE_COUNTER_INCONSISTENT"
 assert len(engines)==summary.get("checked"), "ENGINE_CHECKED_COUNTER_INCONSISTENT"
 sharp=next((x for x in engines if x.get("id")=="sharp-libvips"),None)
 assert sharp and sharp.get("available") is True and sharp.get("runtime")=="node-module", "SHARP_ENGINE_MISSING"
 print("CN_PUBLIC_ENGINE_CAPABILITY_GATE_PASS")
 print(f"CN_SERVER_ENGINE_AVAILABLE={available}/{len(engines)}")
 print("CN_OPTIONAL_SERVER_ENGINES_PENDING="+",".join(x["id"] for x in engines if not x.get("available")))
 print("CN_OPTIONAL_SERVER_ENGINES_NOT_DECLARED_READY=true")
except (KeyError,ValueError,TypeError,AssertionError) as e:
 raise SystemExit("CN_PUBLIC_ABORT:INVALID_ENGINE_EVIDENCE:"+str(e))
PY
rm -f -- "$ENGINE_REPORT"
trap - EXIT
# Verify actual bytes round-trip through Sharp, rather than accepting import-only probes.
# Executes in the isolated release as the unprivileged app user, no user files touched.
command -v runuser >/dev/null || die RUNUSER_NOT_AVAILABLE
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
test -x "$NODE" || die NODE24_RUNTIME_MISSING
(
  cd "$DIR"
  runuser -u lingxifield -- "$NODE" -e '
    import("sharp").then(async m=>{
      const sharp=m.default||m;
      const source=await sharp({
        create:{width:3,height:3,channels:4,background:{r:30,g:60,b:90,alpha:1}}
      }).png().toBuffer();
      const product=await sharp(source).resize(2,2).webp().toBuffer();
      const info=await sharp(product).metadata();
      if(info.width!==2||info.height!==2||info.format!=="webp"||product.length<10)
        throw Error("SHARP_ROUNDTRIP_INVALID");
      console.log("CN_SHARP_REAL_IMAGE_ROUNDTRIP_PASS");
    }).catch(e=>{console.error("CN_SHARP_FILE_SMOKE_FAILED",e.message);process.exit(1)})
  '
) || die SHARP_REAL_IMAGE_SMOKE_FAILED
# Browser-first PDF/video paths are public pages, tested as routes; their real
# file export / OCR / paid delivery must still pass separate user-level E2E gates.
probe 3191 /tools/pdf-editor 200
probe 3191 /tools/e-sign-pdf 200
echo CN_BROWSER_PDF_EDITOR_AND_SIGN_ROUTES_PASS
echo CN_REAL_PAID_EXPORT_AND_SASI_NOT_ATTESTED
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
PUBLIC_JSON=''
rollback(){
 rc=$?
 trap - EXIT
 if test -n "$PUBLIC_JSON"; then rm -f -- "$PUBLIC_JSON"; fi
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
sleep 2
PUBLIC_JSON="$(mktemp)"
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
www_status="$(curl --noproxy '*' --resolve 'www.lingxifield.cn:443:127.0.0.1' -sS --max-time 20 -o /dev/null -w '%{http_code}' https://www.lingxifield.cn/ 2>/dev/null || true)"
echo "CN_NGINX_LIVE_GATE:www.lingxifield.cn:/:$www_status"
case "$www_status" in 200|301|302|308) ;; *) die WWW_TLS_GATE_FAILED;; esac
curl --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 -fsS --max-time 15 https://lingxifield.cn/api/site-release-announcement -o "$PUBLIC_JSON" || die PUBLIC_NOTICE_BODY_FAILURE
python3 - "$PUBLIC_JSON" <<'PY'
import sys,json
with open(sys.argv[1]) as f:j=json.load(f)
assert j.get("enabled") is True and j.get("phase")=="maintenance", "LIVE_NOTICE_GATE_FAILED"
print('CN_PUBLIC_APPROVED_NOTICE_VISIBLE')
PY
rm -f -- "$PUBLIC_JSON"
PUBLIC_JSON=''
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
echo CN_OPTIONAL_SERVER_ENGINES_INSTALL_NOT_AUTHORIZED=true
