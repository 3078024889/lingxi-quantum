#!/usr/bin/env bash
# Read-only preflight for the verified CN topology:
# production=3195, candidate=3196, rollback=3193.
set -Eeuo pipefail
umask 077

readonly PROD_PORT=3195
readonly CANDIDATE_PORT=3196
readonly ROLLBACK_PORT=3193
readonly EXPECTED_PROD_SHA='59d29734ca4cd4c2e6df81d22d2af0287764a9f2'
readonly NGINX='/etc/nginx/conf.d/lingxifield.conf'
readonly BASE='/opt/lingxifield/cn-staged-releases'
readonly NODE='/opt/lingxifield/runtime/node-24.19.0/bin/node'
readonly HOST='lingxifield.cn'

[[ "$EUID" == 0 ]] || { echo ROOT_REQUIRED; exit 1; }
command -v ss >/dev/null
command -v systemctl >/dev/null
command -v curl >/dev/null
command -v python3 >/dev/null
[[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo NGINX_CONFIG_NOT_REGULAR; exit 1; }
[[ -d "$BASE" && ! -L "$BASE" ]] || { echo RELEASE_BASE_NOT_READY; exit 1; }
[[ -x "$NODE" ]] || { echo NODE24_RUNTIME_NOT_FOUND; exit 1; }

echo '===== CN3195/3196/3193 READ-ONLY CANDIDATE PREFLIGHT ====='

python3 - "$NGINX" <<'PY'
import re,sys
data=open(sys.argv[1],"rb").read()
matches=re.findall(rb'(?m)^\s*(?:proxy_pass\s+http://|server\s+)127\.0\.0\.1:(3193|3195|3196)(?:;|\s)',data)
if len(matches)!=1:
    raise SystemExit("NGINX_UPSTREAM_NOT_EXACTLY_ONE")
if matches[0]!=b"3195":
    raise SystemExit("NGINX_PRODUCTION_UPSTREAM_MUST_REMAIN_3195")
print("CN_NGINX_PRODUCTION_UPSTREAM=3195")
PY

find_service_for_port() {
  local port="$1" pid unit
  local -a pids=() units=()
  [[ "$port" =~ ^(3193|3195)$ ]] || return 1
  mapfile -t pids < <(ss -ltnpH "sport = :$port" | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u)
  [[ "${#pids[@]}" == 1 ]] || return 1
  pid="${pids[0]}"
  [[ "$pid" =~ ^[0-9]+$ && -r "/proc/$pid/cgroup" ]] || return 1
  mapfile -t units < <(awk -F/ '/lingxifield-cn-release-.*[.]service$/{print $NF}' "/proc/$pid/cgroup" | sort -u)
  [[ "${#units[@]}" == 1 ]] || return 1
  unit="${units[0]}"
  [[ "$unit" =~ ^lingxifield-cn-release-[A-Za-z0-9.-]+\.service$ ]] || return 1
  systemctl is-active --quiet "$unit" || return 1
  [[ "$(systemctl show "$unit" -p MainPID --value)" == "$pid" ]] || return 1
  printf '%s\n' "$unit"
}

probe() {
  local port="$1" path="$2" expected="$3" status
  status="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 12 -o /dev/null -w '%{http_code}' -H "Host: $HOST" "http://127.0.0.1:$port$path" || true)"
  echo "CN_PORT_PROBE:$port:$path:$status"
  [[ "$status" == "$expected" ]]
}

PROD_SERVICE="$(find_service_for_port "$PROD_PORT")" || { echo CN3195_PRODUCTION_SERVICE_NOT_FOUND; exit 1; }
ROLLBACK_SERVICE="$(find_service_for_port "$ROLLBACK_PORT")" || { echo CN3193_ROLLBACK_SERVICE_NOT_FOUND; exit 1; }

PROD_DIR="$(systemctl show "$PROD_SERVICE" -p WorkingDirectory --value)"
[[ "$PROD_DIR" == "$BASE/$EXPECTED_PROD_SHA" ]] || {
  echo "CN3195_PRODUCTION_SOURCE_MISMATCH:$PROD_DIR"
  exit 1
}
[[ -s "$PROD_DIR/RELEASE_SOURCE_SHA" ]] || { echo CN3195_RELEASE_SOURCE_SHA_MISSING; exit 1; }
PROD_SHA="$(tr -d '\r\n' < "$PROD_DIR/RELEASE_SOURCE_SHA")"
[[ "$PROD_SHA" == "$EXPECTED_PROD_SHA" ]] || { echo CN3195_RELEASE_SOURCE_SHA_MISMATCH; exit 1; }

probe "$PROD_PORT" '/api/health' 200
probe "$PROD_PORT" '/api/pay/providers' 200
probe "$PROD_PORT" '/api/tools/pass' 200
probe "$PROD_PORT" '/api/wechat/mini/balance-pay/availability' 200
probe "$PROD_PORT" '/api/admin/pay/readiness' 401
probe "$ROLLBACK_PORT" '/api/health' 200

if ss -lntH "sport = :$CANDIDATE_PORT" | grep -q .; then
  echo CN3196_CANDIDATE_PORT_ALREADY_IN_USE
  exit 1
fi
echo CN3196_CANDIDATE_PORT_FREE=YES

ROLLBACK_DIR="$(systemctl show "$ROLLBACK_SERVICE" -p WorkingDirectory --value)"
[[ "$ROLLBACK_DIR" =~ ^$BASE/[a-f0-9]{40}$ ]] || { echo CN3193_ROLLBACK_WORKDIR_INVALID; exit 1; }
[[ -s "$ROLLBACK_DIR/RELEASE_SOURCE_SHA" ]] || { echo CN3193_ROLLBACK_SOURCE_SHA_MISSING; exit 1; }
ROLLBACK_SHA="$(tr -d '\r\n' < "$ROLLBACK_DIR/RELEASE_SOURCE_SHA")"
[[ "$ROLLBACK_SHA" =~ ^[a-f0-9]{40}$ ]] || { echo CN3193_ROLLBACK_SOURCE_SHA_INVALID; exit 1; }

mapfile -t ENV_FILES < <(
  systemctl show "$PROD_SERVICE" -p EnvironmentFiles --value |
    python3 -c 'import re,sys
s=sys.stdin.read()
for p in re.findall(r"(/[^\s()]+\.env)\s+\(ignore_errors=(?:yes|no)\)",s): print(p)'
)
(( ${#ENV_FILES[@]} == 14 )) || { echo "CN3195_ENVFILE_COUNT_CHANGED:${#ENV_FILES[@]}"; exit 1; }
[[ "${#ENV_FILES[@]}" -eq "$(printf '%s\n' "${ENV_FILES[@]}" | sort -u | wc -l)" ]] || { echo CN3195_ENVFILE_DUPLICATE; exit 1; }
for file in "${ENV_FILES[@]}"; do
  [[ "$file" =~ ^/etc/lingxifield/[A-Za-z0-9_.-]+\.env$ && -f "$file" && ! -L "$file" ]] || {
    echo CN3195_ENVFILE_PATH_INVALID
    exit 1
  }
  [[ "$(stat -c %u "$file")" == 0 && "$(stat -c %a "$file")" == 600 ]] || {
    echo CN3195_ENVFILE_PERMISSION_INVALID
    exit 1
  }
done

FREE_BYTES="$(df -PB1 "$BASE" | awk 'END{print $4}')"
[[ "$FREE_BYTES" =~ ^[0-9]+$ ]] && (( FREE_BYTES > 2500000000 )) || { echo CN3196_INSUFFICIENT_DISK; exit 1; }

echo "CN3195_PRODUCTION_SERVICE=$PROD_SERVICE"
echo "CN3195_PRODUCTION_SOURCE_SHA=$PROD_SHA"
echo "CN3193_ROLLBACK_SERVICE=$ROLLBACK_SERVICE"
echo "CN3193_ROLLBACK_SOURCE_SHA=$ROLLBACK_SHA"
echo "CN3195_ACTIVE_ENVFILE_COUNT=${#ENV_FILES[@]}"
echo "CN3196_DISK_FREE_BYTES=$FREE_BYTES"
echo "CN3196_CANDIDATE_PREFLIGHT_PASS"
echo "READ_ONLY_ONLY_NO_ENV_CHANGE_NO_SERVICE_RESTART_NO_NGINX_CHANGE_NO_ORDER_CREATED_NO_CHARGE_NO_REFUND_NO_BALANCE_CHANGE"
