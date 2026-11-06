#!/usr/bin/env bash
# .cn 3189 only: unset inherited VERCEL in the staging service, reuse the
# existing healthy 127.0.0.1:3100 gateway, then re-run real install/test.
# No changes to production 3188, gateway, nginx, DNS, .com, Supabase or payments.
set -Eeuo pipefail
umask 077

[[ "$(id -u)" == 0 && "$#" == 1 && "$1" == "--repair-stage-3189-only" ]] || {
  echo CN3189_VERCEL_FIX_USAGE; exit 2;
}

SERVICE=lingxifield-cn-stage
PROD=lingxifield-ecs
UNIT=lingxifield-cn-stage.service
DROPIN_DIR=/etc/systemd/system/lingxifield-cn-stage.service.d
DROPIN="$DROPIN_DIR/90-cn-local-document-unset-vercel.conf"
ENVFILE=/etc/lingxifield/staging.env
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
OPERATOR=/root/cn-six-engine-stage.sh
OPERATOR_BLOB=45002f8751ff714851ae87ffc1c1411fb52877f4
ARCHIVE=/root/lingxifield-cn-doc-gateway-dc013d10/cn-ecs-document-gateway.tar.gz
ARCHIVE_HASH=0c965bdbfedc643189b72208cb9bad33ebc6582431112e968dfddb5ff7495e67
LOCK=/run/lock/lingxifield-cn-stage-vercel-fix.lock

command -v flock >/dev/null
exec 9>"$LOCK"
flock -n 9 || { echo CN3189_CONCURRENT_STAGE_ACTION_ABORT; exit 3; }

echo "=== 1. 仅限3189，核查资源与原始状态 ==="
test -x "$NODE" && test -s "$ENVFILE" && test -s "$OPERATOR" && test -s "$ARCHIVE"
test ! -e "$DROPIN" || { echo CN3189_EXISTING_DROPIN_ABORT; exit 3; }
systemctl is-active --quiet "$PROD"
systemctl is-active --quiet "$SERVICE"
test "$(systemctl show --property=WorkingDirectory --value "$SERVICE")" = \
  /opt/lingxifield/releases/cn-pr199 || {
    echo CN3189_STAGING_WORKDIR_MISMATCH; exit 3;
  }
case "$(systemctl show --property=EnvironmentFiles --value "$SERVICE")" in
  *"/etc/lingxifield/staging.env"*) ;;
  *) echo CN3189_STAGING_ENV_FILE_MISMATCH; exit 3;;
esac
prod_pid="$(systemctl show -p MainPID --value "$PROD")"
stage_pid="$(systemctl show -p MainPID --value "$SERVICE")"
[[ "$prod_pid" =~ ^[0-9]+$ && "$prod_pid" -gt 1 &&
   "$stage_pid" =~ ^[0-9]+$ && "$stage_pid" -gt 1 ]] || exit 3

"$NODE" - "$ENVFILE" <<'JS'
const {readFileSync}=require('node:fs');
const {parseEnv}=require('node:util');
const e=parseEnv(readFileSync(process.argv[2],'utf8'));
if(e.NEXT_PUBLIC_SITE_URL!=='https://lingxifield.cn' ||
   !((e.LINGXIFIELD_DOCUMENT_GATEWAY_SECRET||'').trim().length>=32) ||
   !e.LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL ||
   ['ALIPAY_ENABLED','WECHAT_MINI_VPAY_TOPUPS_ENABLED','WECHAT_MINI_VPAY_TOOLS_ENABLED']
     .some(k=>e[k]!=='false')) {
 console.error('CN3189_STAGE_SITE_GATEWAY_PAYMENT_ISOLATION_FAILED');process.exit(3);
}
console.log('CN3189_STAGE_SITE_SECRET_AND_PAYMENT_ISOLATION_PASS');
console.log('CN3189_ENVFILE_VERCEL_PRESENT=' + Object.hasOwn(e,'VERCEL'));
JS

# Check the service's actual initial environment, never print private values.
"$NODE" - "$stage_pid" <<'JS'
const fs=require('node:fs');
const entries=fs.readFileSync('/proc/'+process.argv[2]+'/environ')
  .toString('utf8').split('\0');
if(!entries.some(v=>v.startsWith('VERCEL='))) {
 console.error('CN3189_RUNNING_VERCEL_ABSENT_DIAGNOSE_ANOTHER_CAUSE');
 process.exit(4);
}
console.log('CN3189_RUNNING_VERCEL_PRESENT_CONFIRMED');
JS

"$NODE" --check /root/cn3189-doc-real.mjs
python3 - "$OPERATOR" <<'PY'
import hashlib,sys
b=open(sys.argv[1],'rb').read()
actual=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
assert actual == '45002f8751ff714851ae87ffc1c1411fb52877f4', 'CN3189_OPERATOR_INTEGRITY_FAILED'
print('CN3189_VERIFIED_OPERATOR_REUSED')
PY
printf '%s  %s\n' "$ARCHIVE_HASH" "$ARCHIVE" | sha256sum -c -

"$NODE" <<'JS'
(async()=>{
  const r=await fetch('http://127.0.0.1:3100/health',{signal:AbortSignal.timeout(5000)});
  const j=await r.json();
  if(r.status!==200 || j?.ok!==true || j?.service!=='document-gateway'){
    process.exitCode=4;console.error('CN3189_EXISTING_GATEWAY_NOT_HEALTHY');
    return;
  }
  console.log('CN3189_EXISTING_LOOPBACK_DOCUMENT_GATEWAY_REUSED');
})().catch(()=>{console.error('CN3189_EXISTING_GATEWAY_UNREACHABLE');process.exitCode=4});
JS

echo "=== 2. 只给3189增加 systemd 环境隔离 ==="
created=0
rollback(){
  rc=$?
  trap - EXIT
  if [ "$rc" -ne 0 ] && [ "$created" -eq 1 ]; then
    echo CN3189_ENV_OVERRIDE_ROLLBACK_START
    rm -f -- "$DROPIN"
    systemctl daemon-reload || true
    systemctl restart "$SERVICE" || true
    systemctl is-active --quiet "$PROD" || echo CN3188_PROD_STATUS_NEEDS_CHECK
    echo CN3189_ENV_OVERRIDE_ROLLBACK_DONE
  fi
  exit "$rc"
}
trap rollback EXIT
install -d -m 755 "$DROPIN_DIR"
cat > "$DROPIN" <<'INI'
[Service]
# Scope: preproduction 3189 only. UnsetEnvironment applies AFTER EnvironmentFile.
UnsetEnvironment=VERCEL
INI
created=1
systemctl daemon-reload
systemctl restart "$SERVICE"

new_pid="$(systemctl show -p MainPID --value "$SERVICE")"
"$NODE" - "$new_pid" <<'JS'
const fs=require('node:fs');
const raw=fs.readFileSync('/proc/'+process.argv[2]+'/environ').toString('utf8');
if(raw.split('\0').some(v=>v.startsWith('VERCEL='))){
 console.error('CN3189_VERCEL_STILL_SET_ABORT');process.exit(5);
}
console.log('CN3189_VERCEL_REMOVED_FROM_STAGING_PROCESS');
JS

for i in $(seq 1 25); do
  code="$(curl --noproxy '*' -sS --max-time 3 -o /dev/null -w '%{http_code}' http://127.0.0.1:3189/api/health || true)"
  if [ "$code" = 200 ]; then break; fi
  if [ "$i" = 25 ]; then echo CN3189_ENV_OVERRIDE_HEALTH_FAILED; exit 5; fi
  sleep 1
done

echo "=== 3. 安装已校验的454MB候选并重复真实文档门禁 ==="
bash "$OPERATOR" --apply-doc-gateway-3189
test "$(systemctl show -p MainPID --value "$PROD")" = "$prod_pid"
systemctl is-active --quiet "$PROD"
systemctl is-active --quiet "$SERVICE"
echo CN3189_SIX_ENGINES_AND_REAL_DOCX_ACCEPTED_NO_PUBLIC_SWITCH
