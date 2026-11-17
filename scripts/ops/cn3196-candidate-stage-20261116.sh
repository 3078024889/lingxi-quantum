#!/usr/bin/env bash
# CN3196 isolated candidate only. Never switches Nginx or stops/restarts production 3195 or rollback 3193.
set -Eeuo pipefail
umask 077

TAG="cn3196-candidate-20261117-22c7558dcf40"
SOURCE_SHA="22c7558dcf4059b690493c150f0ff5993c71c6a8"
SHORT="22c7558dcf40"
ARCHIVE_SHA="533bf65e97c14b255b03742c6d552f3dc7b74c61c21c550c43b77839ca5e1c4b"
ARCHIVE_BYTES="339005873"
ARCHIVE_FILE="cn-20261117-cn3196-candidate.tar.gz"
CHECK_FILE="cn-20261117-cn3196-candidate.sha256"

BASE="/opt/lingxifield/cn-staged-releases"
PROD_PORT=3195
CANDIDATE_PORT=3196
ROLLBACK_PORT=3193
NGINX="/etc/nginx/conf.d/lingxifield.conf"
NODE="/opt/lingxifield/runtime/node-24.19.0/bin/node"
SERVICE="lingxifield-cn-candidate-$SHORT.service"
UNIT="/etc/systemd/system/$SERVICE"
STAGE_ENV="/etc/lingxifield/cn3196-candidate-$SHORT.env"
DOWNLOAD="$BASE/.download-$TAG"
ARCHIVE="$DOWNLOAD/$ARCHIVE_FILE"
CHECK="$DOWNLOAD/$CHECK_FILE"
RELEASE="$BASE/$SOURCE_SHA"

[[ "$EUID" == 0 ]] || { echo ROOT_REQUIRED; exit 2; }
[[ "$SOURCE_SHA" =~ ^[a-f0-9]{40}$ && "$SHORT" == "${SOURCE_SHA:0:12}" ]] || { echo SOURCE_SHA_INVALID; exit 2; }
[[ "$ARCHIVE_SHA" =~ ^[a-f0-9]{64}$ && "$ARCHIVE_BYTES" =~ ^[0-9]+$ ]] || { echo ARCHIVE_PIN_INVALID; exit 2; }
[[ "$TAG" == "cn3196-candidate-20261117-$SHORT" ]] || { echo TAG_INVALID; exit 2; }
[[ "$ARCHIVE_FILE" == "cn-20261117-cn3196-candidate.tar.gz" ]] || { echo ARCHIVE_NAME_INVALID; exit 2; }
[[ "$CHECK_FILE" == "cn-20261117-cn3196-candidate.sha256" ]] || { echo CHECK_NAME_INVALID; exit 2; }
[[ -x "$NODE" ]] || { echo NODE_RUNTIME_MISSING; exit 2; }
command -v ss >/dev/null 2>&1 || { echo SS_COMMAND_MISSING; exit 2; }
command -v curl >/dev/null 2>&1 || { echo CURL_COMMAND_MISSING; exit 2; }
command -v python3 >/dev/null 2>&1 || { echo PYTHON3_COMMAND_MISSING; exit 2; }

find_service_for_port() {
  local port="$1" pid svc mainpid
  local -a pids=()
  mapfile -t pids < <(ss -ltnpH "sport = :$port" 2>/dev/null | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u)
  (( ${#pids[@]} == 1 )) || return 1
  pid="${pids[0]}"
  [[ -r "/proc/$pid/cgroup" ]] || return 1
  svc="$(awk -F/ '{for(i=1;i<=NF;i++)if($i ~ /\.service$/)s=$i} END{print s}' "/proc/$pid/cgroup")"
  [[ "$svc" =~ ^[A-Za-z0-9_.@:-]+\.service$ ]] || return 1
  systemctl is-active --quiet "$svc" || return 1
  mainpid="$(systemctl show "$svc" -p MainPID --value)"
  [[ "$mainpid" == "$pid" ]] || return 1
  printf '%s\n' "$svc"
}

probe_http() {
  local port="$1" path="$2" expected="$3" status
  status="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 18 -o /dev/null -w '%{http_code}' \
    -H 'Host: lingxifield.cn' "http://127.0.0.1:$port$path" || true)"
  echo "CN3196_PROBE:$port:$path:$status"
  [[ "$status" == "$expected" ]]
}

assert_live_topology() {
  [[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo CN_NGINX_CONFIG_NOT_REGULAR; return 1; }
  grep -qF "127.0.0.1:$PROD_PORT" "$NGINX" || { echo CN_PRODUCTION_UPSTREAM_NOT_3195; return 1; }
  local prod fallback
  prod="$(find_service_for_port "$PROD_PORT")" || { echo CN3195_PRODUCTION_SERVICE_NOT_FOUND; return 1; }
  fallback="$(find_service_for_port "$ROLLBACK_PORT")" || { echo CN3193_ROLLBACK_SERVICE_NOT_FOUND; return 1; }
  probe_http "$PROD_PORT" /api/health 200 || { echo CN3195_PRODUCTION_HEALTH_FAILED; return 1; }
  probe_http "$ROLLBACK_PORT" /api/health 200 || { echo CN3193_ROLLBACK_HEALTH_FAILED; return 1; }
  echo "CN3195_PRODUCTION_SERVICE=$prod"
  echo "CN3193_ROLLBACK_SERVICE=$fallback"
}

verify_candidate() {
  local dir
  systemctl is-active --quiet "$SERVICE" || { echo CN3196_CANDIDATE_NOT_ACTIVE; return 1; }
  dir="$(systemctl show "$SERVICE" -p WorkingDirectory --value)"
  [[ "$dir" == "$RELEASE" ]] || { echo CN3196_WORKDIR_MISMATCH; return 1; }
  [[ -s "$dir/RELEASE_SOURCE_SHA" ]] || { echo CN3196_SOURCE_SHA_MISSING; return 1; }
  [[ "$(tr -d '\r\n' < "$dir/RELEASE_SOURCE_SHA")" == "$SOURCE_SHA" ]] || { echo CN3196_SOURCE_SHA_MISMATCH; return 1; }
  grep -Fxq "EnvironmentFile=$STAGE_ENV" "$UNIT" || { echo CN3196_CANDIDATE_ENV_OVERLAY_MISSING; return 1; }
  systemctl cat "$SERVICE" | grep -Fq "Environment=PORT=$CANDIDATE_PORT" || { echo CN3196_CANDIDATE_PORT_MISMATCH; return 1; }
  assert_live_topology || return 1
  probe_http "$CANDIDATE_PORT" /api/health 200 || return 1
  probe_http "$CANDIDATE_PORT" /api/tools/pass 200 || return 1
  probe_http "$CANDIDATE_PORT" /api/wechat/mini/cny-topup/availability 200 || return 1
  probe_http "$CANDIDATE_PORT" /api/wechat/mini/balance-pay/availability 404 || return 1
  probe_http "$CANDIDATE_PORT" /api/admin/pay/readiness 401 || return 1

  local providers_tmp mini_tmp providers_status mini_status
  providers_tmp="$(mktemp)"
  providers_status="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 18 -o "$providers_tmp" -w '%{http_code}' -H 'Host: lingxifield.cn' "http://127.0.0.1:$CANDIDATE_PORT/api/pay/providers" || true)"
  if [[ "$providers_status" != "200" ]]; then
    rm -f "$providers_tmp"
    echo "CN3196_PROVIDER_READINESS_HTTP=$providers_status"
    return 1
  fi
  if ! "$NODE" - "$providers_tmp" <<'NODE'
const fs=require("node:fs");
const p=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
for(const key of ["wechat","alipay","paypal","cnyBalanceTopupReady","usdBalanceTopupReady"])
  if(p[key]!==false)throw new Error("CANDIDATE_PAYMENT_GATE_NOT_CLOSED:"+key);
NODE
  then
    rm -f "$providers_tmp"
    echo "CN3196_CANDIDATE_PAYMENT_GATES_CLOSED_CHECK_FAILED"
    return 1
  fi
  rm -f "$providers_tmp"

  mini_tmp="$(mktemp)"
  mini_status="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 18 -o "$mini_tmp" -w '%{http_code}' -H 'Host: lingxifield.cn' "http://127.0.0.1:$CANDIDATE_PORT/api/wechat/mini/cny-topup/availability" || true)"
  if [[ "$mini_status" != "200" ]]; then
    rm -f "$mini_tmp"
    echo "CN3196_MINI_CNY_READINESS_HTTP=$mini_status"
    return 1
  fi
  if ! "$NODE" - "$mini_tmp" <<'NODE'
const fs=require("node:fs");
const p=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
if(p.enabled!==false||p.topupsEnabled!==false)throw new Error("CANDIDATE_MINI_CNY_GATE_NOT_CLOSED");
NODE
  then
    rm -f "$mini_tmp"
    echo "CN3196_MINI_CNY_GATE_CLOSED_CHECK_FAILED"
    return 1
  fi
  rm -f "$mini_tmp"
  echo "CN3196_CANDIDATE_PAYMENT_GATES_CLOSED_PASS"

  if [[ -s "$RELEASE/cn-payment-signed-live-probe.mjs" ]]; then
    echo "CN3196_READ_ONLY_LIVE_MERCHANT_PROBE_BEGIN"
    "$NODE" "$RELEASE/cn-payment-signed-live-probe.mjs" "${SERVICE%.service}" || echo "CN3196_READ_ONLY_LIVE_MERCHANT_PROBE_INCOMPLETE_NO_PAYMENT_FLAGS_CHANGED"
  else
    echo "CN3196_READ_ONLY_LIVE_MERCHANT_PROBE_MISSING"
  fi
  echo "CN3196_CANDIDATE_STAGED_NO_PRODUCTION_SWITCH"
}

MODE="${1:---plan}"
case "$MODE" in
  --plan)
    assert_live_topology
    if ss -ltnH "sport = :$CANDIDATE_PORT" 2>/dev/null | grep -q LISTEN; then
      echo CN3196_PORT_ALREADY_IN_USE
      exit 1
    fi
    df -h "$BASE" | tail -n 1
    echo "CN3196_PLAN_PASS_PRODUCTION_3195_AND_ROLLBACK_3193_UNCHANGED"
    ;;
  --stage-local)
    assert_live_topology
    [[ ! -e "$UNIT" && ! -e "$STAGE_ENV" && ! -e "$RELEASE" ]] || { echo CN3196_CANDIDATE_ALREADY_EXISTS_NO_OVERWRITE; exit 1; }
    if ss -ltnH "sport = :$CANDIDATE_PORT" 2>/dev/null | grep -q LISTEN; then echo CN3196_PORT_ALREADY_IN_USE; exit 1; fi
    [[ -f "$ARCHIVE" && ! -L "$ARCHIVE" && "$(stat -c %u "$ARCHIVE")" == 0 ]] || { echo CN3196_LOCAL_ARCHIVE_MISSING_OR_UNSAFE; exit 1; }
    [[ -f "$CHECK" && ! -L "$CHECK" && "$(stat -c %u "$CHECK")" == 0 ]] || { echo CN3196_LOCAL_CHECKSUM_MISSING_OR_UNSAFE; exit 1; }
    [[ "$(stat -c %s "$ARCHIVE")" == "$ARCHIVE_BYTES" ]] || { echo CN3196_ARCHIVE_LENGTH_MISMATCH; exit 1; }
    (cd "$DOWNLOAD" && sha256sum -c "$CHECK")
    [[ "$(sha256sum "$ARCHIVE" | awk '{print $1}')" == "$ARCHIVE_SHA" ]] || { echo CN3196_ARCHIVE_SHA256_MISMATCH; exit 1; }
    [[ "$(tar -xOzf "$ARCHIVE" ./RELEASE_SOURCE_SHA | tr -d '\r\n')" == "$SOURCE_SHA" ]] || { echo CN3196_ARTIFACT_SOURCE_SHA_MISMATCH; exit 1; }
    tar -tzf "$ARCHIVE" > "$DOWNLOAD/archive-manifest.txt"
    grep -Fxq './server.js' "$DOWNLOAD/archive-manifest.txt"
    grep -Fxq './RELEASE_SOURCE_SHA' "$DOWNLOAD/archive-manifest.txt"
    if grep -Eq '(^/|(^|/)\.\.(/|$))' "$DOWNLOAD/archive-manifest.txt"; then echo CN3196_UNSAFE_ARCHIVE_PATH; exit 1; fi
    (( $(df -PB1 "$BASE" | awk 'END{print $4}') > 2500000000 )) || { echo CN3196_INSUFFICIENT_FREE_DISK; exit 1; }

    PROD_SVC="$(find_service_for_port "$PROD_PORT")"
    ENVFILES="$(systemctl show "$PROD_SVC" -p EnvironmentFiles --value)"
    mapfile -t LIVE_ENV_FILES < <(python3 - "$ENVFILES" <<'PY'
import re,sys
for p in re.findall(r"(/[^\s()]+\.env)\s+\(ignore_errors=(?:yes|no)\)",sys.argv[1]):
 print(p)
PY
)
    (( ${#LIVE_ENV_FILES[@]} >= 1 && ${#LIVE_ENV_FILES[@]} <= 16 )) || { echo CN3196_ENVFILE_COUNT_INVALID; exit 1; }
    [[ ${#LIVE_ENV_FILES[@]} -eq $(printf '%s\n' "${LIVE_ENV_FILES[@]}" | sort -u | wc -l) ]] || { echo CN3196_ENVFILE_DUPLICATE; exit 1; }
    for envfile in "${LIVE_ENV_FILES[@]}"; do
      [[ "$envfile" =~ ^/etc/lingxifield/[A-Za-z0-9_.-]+\.env$ && -f "$envfile" && ! -L "$envfile" ]] || { echo CN3196_ENVFILE_PATH_INVALID; exit 1; }
      [[ "$(stat -c '%u:%a' "$envfile")" == "0:600" ]] || { echo CN3196_ENVFILE_PERMISSIONS_INVALID; exit 1; }
    done

    TEMP="$(mktemp -d "$BASE/.cn3196-XXXXXXXX")"
    trap 'rm -rf "$TEMP"' EXIT
    mkdir -p "$TEMP/unpack"
    tar -xzf "$ARCHIVE" -C "$TEMP/unpack"
    test -s "$TEMP/unpack/server.js"
    mv "$TEMP/unpack" "$RELEASE"
    chmod -R go-w "$RELEASE"

    python3 - "$STAGE_ENV" <<'PY'
import os,sys,tempfile
dst=sys.argv[1]
values={
 "ALIPAY_ENABLED":"false","WECHAT_ENABLED":"false","PAYPAL_ENABLED":"false",
 "SASI_RMB_BALANCE_V1_ENABLED":"false","USD_BALANCE_TOPUP_ENABLED":"false",
 "SASI_REFUND_FLOW_TESTED":"false","WECHAT_MINI_JSAPI_TOPUPS_ENABLED":"false",
 "WECHAT_MINI_VPAY_TOPUPS_ENABLED":"false","WECHAT_MINI_VPAY_TOOLS_ENABLED":"false",
 "TOOL_PASS_COMMERCE_READY":"false","SASI_MARKET_SALES_ENABLED":"false",
 "SASI_MARKET_UPLOADS_ENABLED":"false","SASI_MARKET_DELIVERY_ENABLED":"false",
 "SASI_MARKET_PAYOUTS_ENABLED":"false","SASI_MARKETPLACE_COMMERCE_READY":"false",
 "SOFTWARE_COMMERCE_READY":"false","TOOL_PASS_BACKEND_READY":"true",
 "NEXT_PUBLIC_TOOL_PASS_ENFORCED":"true","NEXT_PUBLIC_SITE_URL":"https://lingxifield.cn",
 "ALIPAY_SITE_URL":"https://lingxifield.cn","NODE_ENV":"production",
 "NODE_OPTIONS":"--max-old-space-size=500","PORT":"3196","HOSTNAME":"127.0.0.1"
}
fd,tmp=tempfile.mkstemp(prefix=".cn3196-candidate-",dir=os.path.dirname(dst) or ".")
try:
 os.fchmod(fd,0o600)
 with os.fdopen(fd,"w",encoding="utf8") as f:
  for k,v in sorted(values.items()):f.write(k+"="+v+"\n")
  f.flush();os.fsync(f.fileno())
 os.replace(tmp,dst)
finally:
 if os.path.exists(tmp):os.unlink(tmp)
PY
    {
      cat <<EOF
[Unit]
Description=LINGXIFIELD CN isolated 3196 candidate ($SHORT); production 3195 and rollback 3193 untouched
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
WorkingDirectory=$RELEASE
EOF
      for envfile in "${LIVE_ENV_FILES[@]}"; do printf 'EnvironmentFile=%s\n' "$envfile"; done
      printf 'EnvironmentFile=%s\n' "$STAGE_ENV"
      cat <<EOF
Environment=NODE_ENV=production
Environment=HOSTNAME=127.0.0.1
Environment=PORT=3196
Environment=NODE_OPTIONS=--max-old-space-size=500
ExecStart=$NODE server.js
Restart=on-failure
RestartSec=2
NoNewPrivileges=true
[Install]
WantedBy=multi-user.target
EOF
    } > "$UNIT"
    chmod 644 "$UNIT"
    systemctl daemon-reload
    systemctl start "$SERVICE"
    if ! verify_candidate; then
      echo CN3196_CANDIDATE_FAILED_PRODUCTION_3195_UNCHANGED >&2
      exit 1
    fi
    ;;
  --verify-stage)
    [[ -f "$UNIT" && ! -L "$UNIT" && -f "$STAGE_ENV" && ! -L "$STAGE_ENV" ]] || { echo CN3196_STAGE_FILES_MISSING; exit 1; }
    verify_candidate
    ;;
  --cleanup)
    if [[ -f "$UNIT" && ! -L "$UNIT" ]]; then systemctl stop "$SERVICE" || true; systemctl disable "$SERVICE" >/dev/null 2>&1 || true; fi
    rm -f "$UNIT" "$STAGE_ENV"
    systemctl daemon-reload
    assert_live_topology
    echo "CN3196_CANDIDATE_CLEANED_PRODUCTION_3195_AND_ROLLBACK_3193_UNCHANGED"
    ;;
  *)
    echo "MODE_INVALID: use --plan, --stage-local, --verify-stage or --cleanup"
    exit 2
    ;;
esac
