#!/usr/bin/env bash
# Read-only diagnostics for the verified CN topology:
# production=3195, candidate=3196, rollback baseline=3193.
set -Eeuo pipefail
umask 077

readonly PROD_PORT=3195
readonly CANDIDATE_PORT=3196
readonly ROLLBACK_PORT=3193
readonly EXPECTED_PROD_SHA='59d29734ca4cd4c2e6df81d22d2af0287764a9f2'
readonly NGINX='/etc/nginx/conf.d/lingxifield.conf'
readonly BASE='/opt/lingxifield/cn-staged-releases'
readonly HOST='lingxifield.cn'

[[ "$EUID" == 0 ]] || { echo ROOT_REQUIRED; exit 1; }
for command_name in ss systemctl curl python3; do
  command -v "$command_name" >/dev/null || { echo "COMMAND_MISSING:$command_name"; exit 1; }
done
[[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo NGINX_CONFIG_NOT_REGULAR; exit 1; }
[[ -d "$BASE" && ! -L "$BASE" ]] || { echo RELEASE_BASE_NOT_READY; exit 1; }

echo '===== CN3195/3196/3193 READ-ONLY CANDIDATE PREFLIGHT ====='

if ! grep -Fq "127.0.0.1:$PROD_PORT" "$NGINX"; then
  echo CN_NGINX_PRODUCTION_UPSTREAM_3195_MISSING
  exit 1
fi
if grep -Fq "127.0.0.1:$CANDIDATE_PORT" "$NGINX"; then
  echo CN_NGINX_CANDIDATE_PORT_MUST_NOT_BE_PUBLIC
  exit 1
fi
echo CN_NGINX_PRODUCTION_UPSTREAM=3195
echo CN_NGINX_CANDIDATE_NOT_PUBLIC=YES

mapfile -t PIDS < <(ss -ltnpH "sport = :$PROD_PORT" | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u)
[[ "${#PIDS[@]}" == 1 ]] || { echo "CN3195_LISTENER_PID_COUNT:${#PIDS[@]}"; exit 1; }
PID="${PIDS[0]}"
[[ "$PID" =~ ^[0-9]+$ && -r "/proc/$PID/cgroup" ]] || { echo CN3195_PROCESS_CONTEXT_UNREADABLE; exit 1; }
SERVICE="$(awk -F/ '{for(i=1;i<=NF;i++)if($i ~ /[.]service$/)s=$i} END{print s}' "/proc/$PID/cgroup")"
[[ "$SERVICE" =~ ^lingxifield-cn-release-[A-Za-z0-9.-]+[.]service$ ]] || { echo CN3195_SYSTEMD_SERVICE_NOT_FOUND; exit 1; }
systemctl is-active --quiet "$SERVICE" || { echo CN3195_SERVICE_NOT_ACTIVE; exit 1; }
MAINPID="$(systemctl show "$SERVICE" -p MainPID --value)"
[[ "$MAINPID" == "$PID" ]] || { echo CN3195_MAINPID_MISMATCH; exit 1; }
WORKDIR="$(systemctl show "$SERVICE" -p WorkingDirectory --value)"
[[ "$WORKDIR" == "$BASE/$EXPECTED_PROD_SHA" ]] || { echo "CN3195_WORKDIR_MISMATCH:$WORKDIR"; exit 1; }
[[ -s "$WORKDIR/RELEASE_SOURCE_SHA" ]] || { echo CN3195_RELEASE_SOURCE_SHA_MISSING; exit 1; }
SOURCE_SHA="$(tr -d '\r\n' < "$WORKDIR/RELEASE_SOURCE_SHA")"
[[ "$SOURCE_SHA" == "$EXPECTED_PROD_SHA" ]] || { echo CN3195_RELEASE_SOURCE_SHA_MISMATCH; exit 1; }

probe() {
  local path="$1" expected="$2" status
  status="$(curl -sS --noproxy '*' --connect-timeout 3 --max-time 12 -o /dev/null -w '%{http_code}' -H "Host: $HOST" "http://127.0.0.1:$PROD_PORT$path" || true)"
  echo "CN3195_ROUTE:$path:HTTP=$status"
  [[ "$status" == "$expected" ]]
}
probe '/api/health' 200
probe '/api/pay/providers' 200
probe '/api/tools/pass' 200
probe '/api/wechat/mini/balance-pay/availability' 200
probe '/api/admin/pay/readiness' 401

if ss -lntH "sport = :$CANDIDATE_PORT" | grep -q .; then
  echo CN3196_CANDIDATE_PORT_ALREADY_IN_USE
  exit 1
fi
echo CN3196_CANDIDATE_PORT_FREE=YES

ROLLBACK_PIDS="$(ss -ltnpH "sport = :$ROLLBACK_PORT" | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u | paste -sd, -)"
if [[ -n "$ROLLBACK_PIDS" ]]; then
  echo "CN3193_ROLLBACK_LISTENER_PIDS=$ROLLBACK_PIDS"
else
  echo CN3193_ROLLBACK_LISTENER=NOT_RUNNING
fi

ENVFILE_COUNT="$(systemctl show "$SERVICE" -p EnvironmentFiles --value | python3 -c 'import re,sys; print(len(set(re.findall(r"/[^\\s()]+\\.env",sys.stdin.read()))))')"
FREE_BYTES="$(df -PB1 "$BASE" | awk 'END{print $4}')"
echo "CN3195_PRODUCTION_SERVICE=$SERVICE"
echo "CN3195_PRODUCTION_SOURCE_SHA=$SOURCE_SHA"
echo "CN3195_ACTIVE_ENVFILE_COUNT=$ENVFILE_COUNT"
echo "CN3196_DISK_FREE_BYTES=$FREE_BYTES"
echo CN3196_CANDIDATE_PREFLIGHT_PASS
echo READ_ONLY_ONLY_NO_ENV_CHANGE_NO_SERVICE_RESTART_NO_NGINX_CHANGE_NO_ORDER_CREATED_NO_CHARGE_NO_REFUND_NO_BALANCE_CHANGE
