#!/usr/bin/env bash
# Read-only audit for the current CN3195 production listener.
# No order creation, payment, refund, balance mutation, service restart or flag change.
set -Eeuo pipefail
umask 077

PORT=""
NGINX=/etc/nginx/conf.d/lingxifield.conf
[[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo CN_NGINX_CONFIG_NOT_REGULAR; exit 1; }
mapfile -t ROUTED_PORTS < <(grep -oE '127\.0\.0\.1:(3194|3195)' "$NGINX" | sed 's/.*://' | sort -u)
(( ${#ROUTED_PORTS[@]} == 1 )) || { echo CN_PRODUCTION_UPSTREAM_NOT_UNIQUE_OR_UNSUPPORTED; exit 1; }
PORT="${ROUTED_PORTS[0]}"
echo "CN_PRODUCTION_UPSTREAM_PORT=$PORT"
NODE="$(command -v node || true)"
[[ -n "$NODE" && -x "$NODE" ]] || NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
[[ "$EUID" == 0 ]] || { echo ROOT_REQUIRED; exit 2; }
[[ -x "$NODE" ]] || { echo NODE_RUNTIME_MISSING; exit 2; }
command -v ss >/dev/null 2>&1 || { echo SS_COMMAND_MISSING; exit 2; }
command -v python3 >/dev/null 2>&1 || { echo PYTHON3_MISSING; exit 2; }

echo "===== CN3195 PRODUCTION PAYMENT READINESS AUDIT (READ ONLY) ====="
if [[ -f "$NGINX" ]]; then
  if grep -qF "127.0.0.1:$PORT" "$NGINX"; then echo CN_NGINX_CONFIG_REFERENCES_3195=YES; else echo CN_NGINX_CONFIG_REFERENCES_3195=NO; fi
else
  echo CN_NGINX_CONFIG_FILE=MISSING
fi

mapfile -t PIDS < <(ss -ltnpH "sport = :$PORT" 2>/dev/null | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u)
if (( ${#PIDS[@]} != 1 )); then
  echo "CN_PRODUCTION_LISTENER_PID_COUNT=${#PIDS[@]}"
  echo CN_PRODUCTION_SERVICE_DISCOVERY_STOP
  exit 1
fi
PID="${PIDS[0]}"
[[ -r "/proc/$PID/cgroup" && -r "/proc/$PID/environ" ]] || { echo CN_PRODUCTION_PROCESS_CONTEXT_UNREADABLE; exit 1; }
SVC="$(awk -F/ '{for(i=1;i<=NF;i++)if($i ~ /\.service$/)s=$i} END{print s}' "/proc/$PID/cgroup")"
[[ "$SVC" =~ ^[A-Za-z0-9_.@:-]+\.service$ ]] || { echo CN_PRODUCTION_SYSTEMD_SERVICE_NOT_FOUND; exit 1; }
systemctl is-active --quiet "$SVC" || { echo CN_PRODUCTION_SERVICE_NOT_ACTIVE; exit 1; }
MAINPID="$(systemctl show "$SVC" -p MainPID --value)"
DIR="$(systemctl show "$SVC" -p WorkingDirectory --value)"
ENVFILES="$(systemctl show "$SVC" -p EnvironmentFiles --value)"
ENVFILE_COUNT="$(python3 -c 'import re,sys; print(len(set(re.findall(r"/[^\s()]+\.env",sys.stdin.read()))))' <<< "$ENVFILES")"
echo "CN_PRODUCTION_LISTENER_PID=$PID"
echo "CN_PRODUCTION_SYSTEMD_SERVICE=$SVC"
echo "CN_PRODUCTION_SERVICE_MAINPID=$MAINPID"
echo "CN_PRODUCTION_SERVICE_WORKDIR=$DIR"
echo "CN_PRODUCTION_ACTIVE_ENVFILE_COUNT=$ENVFILE_COUNT"
if [[ -s "$DIR/RELEASE_SOURCE_SHA" ]]; then
  SOURCE_SHA="$(tr -d '\r\n' < "$DIR/RELEASE_SOURCE_SHA")"
  [[ "$SOURCE_SHA" =~ ^[a-f0-9]{40}$ ]] && echo "CN_PRODUCTION_RELEASE_SOURCE_SHA=$SOURCE_SHA" || echo CN_PRODUCTION_RELEASE_SOURCE_SHA=INVALID
else
  echo CN_PRODUCTION_RELEASE_SOURCE_SHA=UNAVAILABLE
fi

python3 - "$PID" <<'PY'
import sys
pid=sys.argv[1]
raw=open(f"/proc/{pid}/environ","rb").read().split(b"\0")
env={}
for item in raw:
    if b"=" not in item: continue
    k,v=item.split(b"=",1)
    env[k.decode("utf-8","ignore")]=v.decode("utf-8","ignore")

flags=[
 "PORT","WECHAT_ENABLED","ALIPAY_ENABLED","PAYPAL_ENABLED","PAYPAL_ENV",
 "SASI_RMB_BALANCE_V1_ENABLED","USD_BALANCE_TOPUP_ENABLED","SASI_REFUND_FLOW_TESTED",
 "TOOL_PASS_BACKEND_READY","TOOL_PASS_COMMERCE_READY","NEXT_PUBLIC_TOOL_PASS_ENFORCED",
 "WECHAT_MINI_VPAY_ENV","WECHAT_MINI_VPAY_TOOLS_ENABLED","WECHAT_MINI_JSAPI_TOPUPS_ENABLED"
]
for key in flags:
    print("EFFECTIVE_"+key+"="+env.get(key,"<unset>"))

def present(keys):
    return all(bool(env.get(k,"").strip()) for k in keys)
print("WECHAT_MERCHANT_CREDENTIALS_PRESENT="+("YES" if present([
 "WECHAT_APP_ID","WECHAT_MCH_ID","WECHAT_API_V3_KEY","WECHAT_PRIVATE_KEY",
 "WECHAT_CERT_SERIAL_NO","WECHAT_PLATFORM_PUBLIC_KEY","WECHAT_PLATFORM_PUBLIC_KEY_ID"
]) else "NO"))
print("ALIPAY_MERCHANT_CREDENTIALS_PRESENT="+("YES" if present([
 "ALIPAY_APP_ID","ALIPAY_PRIVATE_KEY","ALIPAY_PUBLIC_KEY","ALIPAY_SELLER_ID"
]) else "NO"))
print("PAYPAL_LIVE_CREDENTIALS_PRESENT="+("YES" if present([
 "PAYPAL_CLIENT_ID","PAYPAL_CLIENT_SECRET","PAYPAL_WEBHOOK_ID"
]) and env.get("PAYPAL_ENV","").strip().lower()=="live" else "NO"))
print("MINI_VPAY_PROVIDER_CREDENTIALS_PRESENT="+("YES" if present([
 "WECHAT_MINI_VPAY_OFFER_ID","WECHAT_MINI_VPAY_APP_KEY"
]) else "NO"))
print("MINI_JSAPI_MERCHANT_CREDENTIALS_PRESENT="+("YES" if present([
 "WECHAT_MINI_APP_ID","WECHAT_MINI_APP_SECRET","WECHAT_MCH_ID","WECHAT_PRIVATE_KEY",
 "WECHAT_CERT_SERIAL_NO","WECHAT_API_V3_KEY","WECHAT_PLATFORM_PUBLIC_KEY","WECHAT_PLATFORM_PUBLIC_KEY_ID"
]) else "NO"))
print("MINI_APP_ID_MATCHES_EXPECTED="+("YES" if env.get("WECHAT_MINI_APP_ID","").strip()=="wxbf4ae90406e7e26b" else "NO"))
print("TOOLPASS_PRIVACY_HASH_READY="+("YES" if len(env.get("LINGXIFIELD_PRIVACY_HASH_SECRET",""))>=32 else "NO"))
PY

TMP="$(mktemp -d /tmp/cn3195-payment-audit.XXXXXX)"
trap 'rm -rf "$TMP"' EXIT
PROBE_CODE=""
probe(){
  local path="$1" out="$2"
  PROBE_CODE="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 20 -H 'Host: lingxifield.cn' -o "$out" -w '%{http_code}' "http://127.0.0.1:$PORT$path" || true)"
  echo "CN_PRODUCTION_ROUTE $path HTTP=${PROBE_CODE:-000}"
}

echo "===== LIVE LOOPBACK ROUTE READINESS ====="
probe /api/health "$TMP/health.json"; H="$PROBE_CODE"
probe /api/pay/providers "$TMP/providers.json"; P="$PROBE_CODE"
probe /api/tools/pass "$TMP/toolpass.json"; T="$PROBE_CODE"
probe /api/wechat/mini/cny-topup/availability "$TMP/mini-cny.json"; M="$PROBE_CODE"
probe /api/wechat/mini/balance-pay/availability "$TMP/mini-legacy.json"; ML="$PROBE_CODE"
probe /api/admin/pay/readiness "$TMP/admin.json"; A="$PROBE_CODE"

if [[ "$P" == 200 ]]; then
  "$NODE" - "$TMP/providers.json" <<'NODE'
const fs=require("node:fs");
const p=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
const yes=v=>v===true?"YES":v===false?"NO":"NOT_EXPOSED";
for(const k of ["wechat","alipay","paypal"])
  console.log("CN_PRODUCTION_PROVIDER_"+k.toUpperCase()+"="+yes(p[k]));
for(const k of ["cnyBalanceTopupReady","usdBalanceTopupReady"])
  console.log("CN_PRODUCTION_WALLET_GATE_"+k.toUpperCase()+"="+yes(p[k]));
NODE
fi
if [[ "$T" == 200 ]]; then
  "$NODE" - "$TMP/toolpass.json" <<'NODE'
const fs=require("node:fs");
const p=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
console.log("CN_PRODUCTION_TOOLPASS_AVAILABLE="+(p.available===true?"YES":"NO"));
console.log("CN_PRODUCTION_TOOLPASS_OFFER_COUNT="+Number(p.offers?.length||0));
NODE
fi
if [[ "$M" == 200 ]]; then
  "$NODE" - "$TMP/mini-cny.json" <<'NODE'
const fs=require("node:fs");
const p=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
console.log("CN_PRODUCTION_MINI_CNY_JSAPI_TOPUP_ENABLED="+(p.enabled===true?"YES":"NO"));
console.log("CN_PRODUCTION_MINI_CNY_JSAPI_REASON="+String(p.reason||"UNKNOWN"));
console.log("CN_PRODUCTION_MINI_CNY_JSAPI_MISSING_REASONS="+(Array.isArray(p.missing)?p.missing.join(","):"NOT_EXPOSED"));
NODE
fi
if [[ "$A" == 401 || "$A" == 403 ]]; then
  echo CN_PRODUCTION_ADMIN_READINESS_AUTH_BOUNDARY=PASS
else
  echo "CN_PRODUCTION_ADMIN_READINESS_AUTH_BOUNDARY=HTTP_$A"
fi
if [[ "$ML" == 404 ]]; then echo CN_PRODUCTION_LEGACY_MINI_BALANCE_API=RETIRED; else echo "CN_PRODUCTION_LEGACY_MINI_BALANCE_API=HTTP_$ML"; fi
echo "CN_PRODUCTION_READ_ONLY_AUDIT_COMPLETE"
echo "NO_ORDER_CREATED_NO_CHARGE_NO_REFUND_NO_BALANCE_CHANGE_NO_ENV_CHANGE_NO_SERVICE_RESTART"
