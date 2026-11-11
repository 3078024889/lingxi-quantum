#!/usr/bin/env bash
# No-charge audit first. Enable only after all three Live merchants and tool-pass backend pass.
# Does not create orders, charge cards, modify balances, or touch historical records.
set -Eeuo pipefail
MODE="${1:-}"; TAG="${2:-}"
[[ "$MODE" == --audit || "$MODE" == --enable ]] || { echo MODE_INVALID;exit 2; }
[[ "$TAG" =~ ^ecs-cn-unified-20261110-[a-f0-9]{12}$ ]] || { echo TAG_INVALID;exit 2; }
SHORT="${TAG##*-}"
[[ "$EUID" == 0 ]] || { echo ROOT_REQUIRED;exit 2; }

exec 9>/run/lock/lingxifield-cn-standalone-release.lock
flock -n 9 || { echo CN_RELEASE_BUSY;exit 2; }

NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
SVC="lingxifield-cn-release-20261110-$SHORT-final"
FLAGS="/etc/lingxifield/tool-pass-3194-$SHORT.env"
PORT=3194
NGINX=/etc/nginx/conf.d/lingxifield.conf
PROBE="/run/cn-payment-live-probe-$SHORT.mjs"
PROBE_SHA="2aec891d25ea78769d9c12b8ae9a89016d4425a9"

[[ -x "$NODE" ]] || { echo NODE_NOT_READY;exit 1; }
systemctl is-active --quiet "$SVC" || { echo CN3194_NOT_RUNNING;exit 1; }
DIR="$(systemctl show "$SVC" -p WorkingDirectory --value)"
[[ "$DIR" =~ ^/opt/lingxifield/cn-staged-releases/[a-f0-9]{40}$ ]] || { echo SOURCE_PATH_INVALID;exit 1; }
test -s "$DIR/RELEASE_SOURCE_SHA" || { echo RELEASE_SOURCE_SHA_MISSING;exit 1; }
SHA="$(tr -d '\r\n' < "$DIR/RELEASE_SOURCE_SHA")"
[[ "$SHA" =~ ^[a-f0-9]{40}$ && "$DIR" == "/opt/lingxifield/cn-staged-releases/$SHA" && "$(printf '%s' "$SHA" | cut -c1-12)" == "$SHORT" ]] || { echo SOURCE_MISMATCH;exit 1; }
[[ -f "$FLAGS" && ! -L "$FLAGS" && "$(stat -c '%u:%a' "$FLAGS")" == 0:600 ]] || { echo UNSAFE_PAYMENT_FLAG_FILE;exit 1; }
systemctl cat "$SVC" | grep -Fq "EnvironmentFile=$FLAGS" || { echo SERVICE_ENVIRONMENT_FILE_MISMATCH;exit 1; }
[[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo NGINX_CONFIG_NOT_REGULAR;exit 1; }
[[ "$(grep -Fc '127.0.0.1:3194' "$NGINX")" == 1 ]] || { echo CN3194_NGINX_UPSTREAM_NOT_ACTIVE;exit 1; }
if grep -Fq '127.0.0.1:3193' "$NGINX" || grep -Fq '127.0.0.1:3195' "$NGINX" || grep -Fq '127.0.0.1:3192' "$NGINX";then echo CN3194_NGINX_UPSTREAM_MISMATCH;exit 1;fi

VERIFIER="$DIR/cn-payment-signed-live-probe.mjs"
[[ -f "$VERIFIER" && ! -L "$VERIFIER" ]] || { echo SIGNED_MERCHANT_VERIFIER_MISSING;exit 1; }

TMP="$(mktemp -d /run/cn-payment-audit-$SHORT-XXXXXX)"
chmod 700 "$TMP"
trap 'rm -rf "$TMP";rm -f "$PROBE"' EXIT

git_blob_check(){
 python3 - "$1" "$2" <<'PY'
import hashlib,sys
p,expected=sys.argv[1:3]
b=open(p,"rb").read()
actual=hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
if actual!=expected:raise SystemExit("GIT_BLOB_MISMATCH")
print("PAYPAL_PROBE_SOURCE_SHA1_PASS")
PY
}
cat > "$PROBE.part" <<'PAYPAL_PROBE'
import process from "node:process";

const fail=(code)=>{console.log("CN_MERCHANT_PAYPAL_"+code+"=FAIL");process.exitCode=1;};
const required=[
 "CHECKOUT.ORDER.APPROVED",
 "CHECKOUT.ORDER.COMPLETED",
 "CHECKOUT.PAYMENT-APPROVAL.REVERSED",
 "PAYMENT.CAPTURE.PENDING",
 "PAYMENT.CAPTURE.COMPLETED",
 "PAYMENT.CAPTURE.DENIED",
 "PAYMENT.CAPTURE.REFUNDED"
];

async function main(){
 const env=process.env;
 if(String(env.PAYPAL_ENV||"").trim().toLowerCase()!=="live")return fail("ENVIRONMENT_LIVE");
 const clientId=String(env.PAYPAL_CLIENT_ID||"").trim();
 const clientSecret=String(env.PAYPAL_CLIENT_SECRET||"").trim();
 const webhookId=String(env.PAYPAL_WEBHOOK_ID||"").trim();
 if(!clientId||!clientSecret||!webhookId)return fail("CREDENTIALS_PRESENT");
 const auth=Buffer.from(clientId+":"+clientSecret,"utf8").toString("base64");
 let tokenResponse,tokenBody;
 try{
  tokenResponse=await fetch("https://api-m.paypal.com/v1/oauth2/token",{
   method:"POST",
   headers:{Authorization:"Basic "+auth,"Content-Type":"application/x-www-form-urlencoded"},
   body:"grant_type=client_credentials",
   cache:"no-store",
   signal:AbortSignal.timeout(15000)
  });
  tokenBody=await tokenResponse.json();
 }catch{return fail("LIVE_OAUTH_REQUEST");}
 if(!tokenResponse.ok||typeof tokenBody?.access_token!=="string"||!tokenBody.access_token)
  return fail("LIVE_OAUTH_AUTHENTICATION");
 console.log("CN_MERCHANT_PAYPAL_LIVE_TOKEN=PASS");
 let webhookResponse,webhook;
 try{
  webhookResponse=await fetch("https://api-m.paypal.com/v1/notifications/webhooks/"+encodeURIComponent(webhookId),{
   method:"GET",
   headers:{Authorization:"Bearer "+tokenBody.access_token,Accept:"application/json"},
   cache:"no-store",
   signal:AbortSignal.timeout(15000)
  });
  webhook=await webhookResponse.json();
 }catch{return fail("WEBHOOK_LOOKUP");}
 if(!webhookResponse.ok||String(webhook?.id||"")!==webhookId)
  return fail("WEBHOOK_ID_MATCH");
 if(String(webhook?.url||"").replace(/\/$/,"")!=="https://lingxifield.cn/api/pay/paypal/webhook")
  return fail("WEBHOOK_URL_MATCH");
 const actual=new Set(Array.isArray(webhook?.event_types)?webhook.event_types.map(x=>String(x?.name||"")):[]);
 const missing=required.filter(x=>!actual.has(x));
 if(missing.length){
  console.log("CN_MERCHANT_PAYPAL_MISSING_EVENTS="+missing.join(","));
  return fail("WEBHOOK_EVENT_SUBSCRIPTIONS");
 }
 console.log("CN_MERCHANT_PAYPAL_WEBHOOK_ID=PASS");
 console.log("CN_MERCHANT_PAYPAL_WEBHOOK_URL=PASS");
 console.log("CN_MERCHANT_PAYPAL_WEBHOOK_EVENTS=PASS");
 console.log("CN_MERCHANT_PAYPAL_LIVE_PROBE=PASS");
 if(env.NEXT_PUBLIC_TOOL_PASS_ENFORCED==="true"&&env.TOOL_PASS_BACKEND_READY==="true"&&
    String(env.LINGXIFIELD_PRIVACY_HASH_SECRET||"").length>=32)
  console.log("CN_TOOLPASS_BACKEND_READINESS=PASS");
 else
  console.log("CN_TOOLPASS_BACKEND_READINESS=FAIL");
 if(env.SASI_REFUND_FLOW_TESTED==="true"){
  console.log("CN_CNY_WALLET_REFUND_GATE=PASS");
  console.log("CN_USD_WALLET_REFUND_GATE=PASS");
 }else{
  console.log("CN_CNY_WALLET_REFUND_GATE=FAIL");
  console.log("CN_USD_WALLET_REFUND_GATE=FAIL");
 }
}
await main().catch(()=>fail("UNEXPECTED"));
PAYPAL_PROBE
git_blob_check "$PROBE.part" "$PROBE_SHA"
mv -f "$PROBE.part" "$PROBE"
chmod 600 "$PROBE"
"$NODE" --check "$PROBE"
"$NODE" --check "$VERIFIER"

mapfile -t LIVE_ENV_FILES < <(
 systemctl show "$SVC" -p EnvironmentFiles --value |
  python3 -c 'import re,sys
s=sys.stdin.read()
for p in re.findall(r"(/[^\s()]+\.env)\s+\(ignore_errors=(?:yes|no)\)",s): print(p)'
)
(( ${#LIVE_ENV_FILES[@]} >= 2 && ${#LIVE_ENV_FILES[@]} <= 8 )) || { echo CN_PAYMENT_ENVFILE_COUNT_INVALID;exit 1; }
for f in "${LIVE_ENV_FILES[@]}";do
 [[ "$f" =~ ^/etc/lingxifield/[a-zA-Z0-9_.-]+\.env$ && -f "$f" && ! -L "$f" && "$(stat -c %u "$f")" == 0 ]] || {
  echo CN_PAYMENT_ENVFILE_UNSAFE;exit 1;
 }
done

run_env_node(){
 local suffix="$1";shift
 local unit="cn-pay-audit-$SHORT-$suffix-$$"
 local -a env_props=()
 for f in "${LIVE_ENV_FILES[@]}";do
  [[ "$f" == "$FLAGS" ]] || env_props+=(--property="EnvironmentFile=$f")
 done
 env_props+=(--property="EnvironmentFile=$FLAGS")
 systemd-run --quiet --wait --pipe --collect --unit="$unit" "${env_props[@]}" \
  --property="WorkingDirectory=$DIR" "$NODE" "$@"
}

echo "STEP_1_SIGNED_ALIPAY_AND_WECHAT_LIVE_PROBES"
if ! run_env_node merchants "$VERIFIER" "$SVC" >"$TMP/merchants.log" 2>&1;then
 cat "$TMP/merchants.log" | grep '^CN_MERCHANT_' || true
 echo SIGNED_MERCHANT_PROBE_EXECUTION_FAILED
 exit 1
fi
grep '^CN_MERCHANT_' "$TMP/merchants.log" || true
ALIPAY=false;WECHAT=false
grep -Fxq 'CN_MERCHANT_ALIPAY_SIGNED_LIVE_PROBE=PASS' "$TMP/merchants.log" && ALIPAY=true || true
grep -Fxq 'CN_MERCHANT_WECHAT_SIGNED_LIVE_PROBE=PASS' "$TMP/merchants.log" && WECHAT=true || true

echo "STEP_2_PAYPAL_LIVE_OAUTH_AND_WEBHOOK_NO_CHARGE_PROBE"
if ! run_env_node paypal "$PROBE" >"$TMP/paypal.log" 2>&1;then
 cat "$TMP/paypal.log" | grep '^CN_' || true
 echo PAYPAL_LIVE_PROBE_EXECUTION_FAILED
 exit 1
fi
grep '^CN_' "$TMP/paypal.log" || true
PAYPAL=false;TOOLPASS_BACKEND=false
grep -Fxq 'CN_MERCHANT_PAYPAL_LIVE_PROBE=PASS' "$TMP/paypal.log" && PAYPAL=true || true
grep -Fxq 'CN_TOOLPASS_BACKEND_READINESS=PASS' "$TMP/paypal.log" && TOOLPASS_BACKEND=true || true

echo "STEP_3_UNSIGNED_WEBHOOKS_MUST_FAIL_CLOSED"
for item in "alipay|/api/pay/alipay/notify|application/x-www-form-urlencoded|out_trade_no=INVALID" \
            "wechat|/api/pay/wechat/notify|application/json|{}" \
            "paypal|/api/pay/paypal/webhook|application/json|{}";do
 IFS='|' read -r name path mime body <<<"$item"
 status="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 17 -o /dev/null -w '%{http_code}' \
  -X POST -H 'Host: lingxifield.cn' -H "Content-Type: $mime" --data "$body" "http://127.0.0.1:3194$path" || true)"
 echo "CN_UNSIGNED_WEBHOOK_$name HTTP=$status"
 [[ "$status" == 401 ]] || { echo "UNSIGNED_WEBHOOK_REJECTION_FAILED:$name";exit 1; }
done

echo "CN_SIGNED_LIVE_AUDIT alipay=$ALIPAY wechat=$WECHAT paypal=$PAYPAL toolpass_backend=$TOOLPASS_BACKEND"
if [[ "$ALIPAY" != true || "$WECHAT" != true || "$PAYPAL" != true || "$TOOLPASS_BACKEND" != true ]];then
 echo CN_PAYMENT_AUDIT_INCOMPLETE_NO_FLAGS_CHANGED
 exit 1
fi
echo "CN_CNY_USD_WALLET_TOPUPS_PRESERVED_NO_REFUND_FLAG_MUTATION"
if [[ "$MODE" == --audit ]];then
 echo CN3194_ALL_THREE_LIVE_MERCHANTS_AND_TOOLPASS_BACKEND_AUDIT_PASS_FLAGS_UNCHANGED
 exit 0
fi

[[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo NGINX_CONFIG_NOT_REGULAR;exit 1; }
[[ "$(grep -Fc '127.0.0.1:3194' "$NGINX")" == 1 ]] || { echo NGINX_NOT_USING_3194;exit 1; }
if grep -Fq '127.0.0.1:3193' "$NGINX" || grep -Fq '127.0.0.1:3195' "$NGINX" || grep -Fq '127.0.0.1:3192' "$NGINX";then echo OLD_UPSTREAM_STILL_PRESENT;exit 1;fi

BACKUP="$(mktemp /etc/lingxifield/.cn-payment-backup-XXXXXX)"
chmod 600 "$BACKUP"
cp -a "$FLAGS" "$BACKUP"
rollback(){
 echo CN_PAYMENT_ACTIVATION_FAILED_ROLLBACK >&2
 cp -a "$BACKUP" "$FLAGS" || true
 systemctl restart "$SVC" || true
}
trap 'rm -rf "$TMP";rm -f "$PROBE";rm -f "$BACKUP"' EXIT

python3 - "$FLAGS" <<'PY'
import os,sys,tempfile
path=sys.argv[1]
values={
 "ALIPAY_ENABLED":"true",
 "WECHAT_ENABLED":"true",
 "PAYPAL_ENABLED":"true",
 "TOOL_PASS_COMMERCE_READY":"true",
}
lines=[]
for line in open(path,encoding="utf8").read().splitlines():
 key=line.split("=",1)[0]
 if key not in values:lines.append(line)
lines.extend(k+"="+v for k,v in values.items())
fd,tmp=tempfile.mkstemp(prefix=".cn-payment-",dir=os.path.dirname(path))
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

if ! curl --noproxy '*' -fsS --max-time 20 -H 'Host: lingxifield.cn' http://127.0.0.1:3194/api/pay/providers >"$TMP/providers.json";then rollback;exit 1;fi
if ! "$NODE" -e 'let s="";process.stdin.on("data",x=>s+=x).on("end",()=>{const j=JSON.parse(s);if(j.alipay!==true||j.wechat!==true||j.paypal!==true)process.exit(4);console.log("CN_ALL_THREE_PAYMENT_PROVIDERS_ENABLED")})' <"$TMP/providers.json";then rollback;exit 1;fi

if ! curl --noproxy '*' -fsS --max-time 20 -H 'Host: lingxifield.cn' http://127.0.0.1:3194/api/tools/pass >"$TMP/toolpass.json";then rollback;exit 1;fi
if ! "$NODE" -e 'let s="";process.stdin.on("data",x=>s+=x).on("end",()=>{const j=JSON.parse(s);if(j.available!==true||j.offers?.length!==4)process.exit(4);console.log("CN_TOOLPASS_COMMERCE_READY_WITH_FOUR_PLANS")})' <"$TMP/toolpass.json";then rollback;exit 1;fi

echo "CN_VERIFIED_WECHAT_ALIPAY_PAYPAL_LIVE_PROVIDERS_ENABLED"
for path in /api/health /api/pay/providers /api/tools/pass;do
 status="$(curl -kfsS --noproxy '*' --resolve lingxifield.cn:443:127.0.0.1 --max-time 20 -o /dev/null -w '%{http_code}' "https://lingxifield.cn$path" || true)"
 echo "CN3194_PUBLIC_PAYMENT_ROUTE:$path:$status"
 [[ "$status" == 200 ]] || { rollback;exit 1; }
done
echo "SOFTWARE_COMMERCE_REMAINS_GATED_UNTIL_PRIVATE_PACKAGE_SCAN_AND_VERIFICATION"
echo "NO_REAL_CHARGE_NO_ORDER_NO_WALLET_MUTATION_NO_HISTORICAL_DATA_CHANGE"
