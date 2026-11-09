#!/usr/bin/env bash
# Only signed no-charge LIVE merchant probes may unlock CNY collection.
# No PayPal enable, no money/order/table mutations, atomic flag rollback.
set -Eeuo pipefail
MODE="$1"; TAG="$2"
[[ "$MODE" == --audit || "$MODE" == --enable ]] || { echo MODE_INVALID; exit 2; }
[[ "$TAG" =~ ^ecs-cn-unified-20261108-[a-f0-9]{12}$ ]] || { echo TAG_INVALID;exit 2; }
SHORT="$(printf '%s' "$TAG" | sed 's/.*-//')"
[[ "$EUID" == 0 ]] || { echo ROOT_REQUIRED;exit 2; }
exec 9>/run/lock/lingxifield-cn-standalone-release.lock
flock -n 9 || { echo CN_RELEASE_BUSY;exit 2; }
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
SVC="lingxifield-cn-release-20261108-$SHORT"
FLAGS="/etc/lingxifield/tool-pass-3194-$SHORT.env"
NGINX=/etc/nginx/conf.d/lingxifield.conf
[[ -x "$NODE" ]] || { echo NODE_NOT_READY;exit 1; }
systemctl is-active --quiet "$SVC" || { echo CN3194_NOT_RUNNING;exit 1; }
DIR="$(systemctl show "$SVC" -p WorkingDirectory --value)"
[[ "$DIR" =~ ^/opt/lingxifield/cn-staged-releases/[a-f0-9]{40}$ ]] || { echo SOURCE_PATH_INVALID;exit 1; }
test -s "$DIR/RELEASE_SOURCE_SHA" || exit 1
SHA="$(tr -d '\r\n' < "$DIR/RELEASE_SOURCE_SHA")"
[[ "$SHA" =~ ^[a-f0-9]{40}$ && "$DIR" == "/opt/lingxifield/cn-staged-releases/$SHA" && "$(printf '%s' "$SHA" | cut -c1-12)" == "$SHORT" ]] || { echo SOURCE_MISMATCH;exit 1; }
VERIFIER="$DIR/cn-payment-signed-live-probe.mjs"
[[ -f "$VERIFIER" && ! -L "$VERIFIER" ]] || { echo LIVE_MERCHANT_VERIFIER_MISSING;exit 1; }
"$NODE" --check "$VERIFIER"
temp="$(mktemp /run/cn-live-merchant-XXXXXX)"
chmod 600 "$temp"
trap 'rm -f "$temp"' EXIT
"$NODE" "$VERIFIER" "$SVC" > "$temp" 2>&1 || true
grep '^CN_MERCHANT_' "$temp" || true
ALIPAY=false; WECHAT=false
if grep -Fxq 'CN_MERCHANT_ALIPAY_SIGNED_LIVE_PROBE=PASS' "$temp";then ALIPAY=true;fi
if grep -Fxq 'CN_MERCHANT_WECHAT_SIGNED_LIVE_PROBE=PASS' "$temp";then WECHAT=true;fi
if [[ "$MODE" == --audit ]];then
  echo "CN_SIGNED_MERCHANT_AUDIT_ONLY alipay=$ALIPAY wechat=$WECHAT"
  [[ "$ALIPAY" == true || "$WECHAT" == true ]] || exit 1
  exit 0
fi
[[ "$ALIPAY" == true || "$WECHAT" == true ]] || { echo NO_VALID_LIVE_MERCHANT_NO_FLAGS_CHANGED;exit 1; }
[[ -f "$FLAGS" && ! -L "$FLAGS" && "$(stat -c '%u:%a' "$FLAGS")" == 0:600 ]] || { echo UNSAFE_PAYMENT_FLAG_FILE;exit 1; }
grep -Fxq "EnvironmentFile=$FLAGS" "/etc/systemd/system/$SVC.service" || { echo PRODUCTION_FLAG_FILE_NOT_ACTIVE;exit 1; }
[[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo NGINX_CONFIG_NOT_REGULAR;exit 1; }
[[ "$(grep -Fc '127.0.0.1:3194' "$NGINX")" == 1 ]] || { echo NGINX_NOT_USING_3194;exit 1; }
if grep -Fq '127.0.0.1:3193' "$NGINX" || grep -Fq '127.0.0.1:3192' "$NGINX";then echo OLD_UPSTREAM_STILL_PRESENT;exit 1;fi
# Require invalid merchant notifications to fail closed, without placing orders.
for method in alipay wechat;do
  if [[ "$method" == alipay ]];then
    status="$(curl -sS --noproxy '*' --max-time 17 -o /dev/null -w '%{http_code}' -X POST -H 'Host: lingxifield.cn' -H 'Content-Type: application/x-www-form-urlencoded' --data 'out_trade_no=INVALID' http://127.0.0.1:3194/api/pay/alipay/notify || true)"
  else
    status="$(curl -sS --noproxy '*' --max-time 17 -o /dev/null -w '%{http_code}' -X POST -H 'Host: lingxifield.cn' -H 'Content-Type: application/json' --data '{}' http://127.0.0.1:3194/api/pay/wechat/notify || true)"
  fi
  echo "CN_UNSIGNED_WEBHOOK_$method HTTP=$status"
  [[ "$status" == 401 ]] || { echo UNSIGNED_WEBHOOK_REJECTION_FAILED;exit 1; }
done
BACKUP="$(mktemp /etc/lingxifield/.cn-payment-backup-XXXXXX)"
chmod 600 "$BACKUP"
cp -a "$FLAGS" "$BACKUP"
rollback(){
 echo CN_PAYMENT_ACTIVATION_FAILED_ROLLBACK >&2
 cp -a "$BACKUP" "$FLAGS" || true
 systemctl restart "$SVC" || true
}
trap 'rm -f "$temp";rm -f "$BACKUP"' EXIT
python3 - "$FLAGS" "$ALIPAY" "$WECHAT" <<'PY'
import os,sys,tempfile
path,alipay,wechat=sys.argv[1:]
values={
 "ALIPAY_ENABLED":alipay,"WECHAT_ENABLED":wechat,"PAYPAL_ENABLED":"false",
 "TOOL_PASS_COMMERCE_READY":"true","SASI_RMB_BALANCE_V1_ENABLED":"true",
 "NEXT_PUBLIC_SITE_URL":"https://lingxifield.cn","ALIPAY_SITE_URL":"https://lingxifield.cn"
}
lines=[s for s in open(path,encoding="utf8").read().splitlines() if s.split("=",1)[0] not in values]
lines.extend(k+"="+v for k,v in values.items())
fd,tmp=tempfile.mkstemp(prefix=".cn-merchant-",dir=os.path.dirname(path))
try:
 os.fchmod(fd,0o600)
 with os.fdopen(fd,"w",encoding="utf8") as f:
  f.write("\n".join(lines)+"\n");f.flush();os.fsync(f.fileno())
 os.replace(tmp,path)
finally:
 if os.path.exists(tmp):os.unlink(tmp)
PY
if ! systemctl restart "$SVC";then rollback;exit 1;fi
health="$(curl -sS --noproxy '*' --max-time 20 -H 'Host: lingxifield.cn' -o /dev/null -w '%{http_code}' http://127.0.0.1:3194/api/health || true)"
[[ "$health" == 200 ]] || { rollback;exit 1; }
if ! curl --noproxy '*' -fsS --max-time 20 -H 'Host: lingxifield.cn' http://127.0.0.1:3194/api/pay/providers |
 "$NODE" -e 'let s="";process.stdin.on("data",x=>s+=x).on("end",()=>{let j=JSON.parse(s);if(j.alipay!==(process.argv[1]==="true")||j.wechat!==(process.argv[2]==="true")||j.paypal!==false)process.exit(4);console.log("CN_LIVE_PAYMENT_PROVIDER_FLAGS_VERIFIED")})' "$ALIPAY" "$WECHAT";then rollback;exit 1;fi
if ! curl --noproxy '*' -fsS --max-time 20 -H 'Host: lingxifield.cn' http://127.0.0.1:3194/api/tools/pass |
 "$NODE" -e 'let s="";process.stdin.on("data",x=>s+=x).on("end",()=>{let j=JSON.parse(s);if(j.available!==true||j.offers?.length!==4)process.exit(4);console.log("CN_TOOLPASS_COMMERCE_READY_WITH_FOUR_PLANS")})';then rollback;exit 1;fi
echo "CN_VERIFIED_CNY_PROVIDERS_ENABLED alipay=$ALIPAY wechat=$WECHAT paypal=false"
echo "FIRST_REAL_ORDER_WEBHOOK_AND_DELIVERY_ACCEPTANCE_REMAINS_REQUIRED"
