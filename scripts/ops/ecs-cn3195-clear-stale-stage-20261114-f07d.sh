#!/usr/bin/env bash
# Free only the known stale CN 3195 staging service.
# Does not touch the live 3194 service, Nginx upstream, data, or release directories.
set -Eeuo pipefail
[[ "$EUID" == 0 ]] || { echo ROOT_REQUIRED >&2; exit 1; }

EXPECTED_SHA='f07d7a7bb7b79adc0664217044404a75c578aa25'
OLD_SVC='lingxifield-cn-release-20261110-51a225ca1d9d.service'
NGINX='/etc/nginx/conf.d/lingxifield.conf'
BASE='/opt/lingxifield/cn-staged-releases'

exec 9>/run/lock/lingxifield-cn-standalone-release.lock
flock -n 9 || { echo ANOTHER_CN_RELEASE_IS_RUNNING; exit 1; }

[[ -f "$NGINX" && ! -L "$NGINX" ]] || { echo NGINX_CONFIG_NOT_REGULAR; exit 1; }
NGINX_SHA_BEFORE="$(sha256sum "$NGINX" | awk '{print $1}')"
ACTIVE_PORT="$(python3 - "$NGINX" <<'PY'
import re,sys
data=open(sys.argv[1],"rb").read()
ports=re.findall(rb'(?m)^\s*(?:proxy_pass\s+http://|server\s+)127\.0\.0\.1:(3193|3194|3195)(?:;|\s)',data)
if len(ports)!=1:
    raise SystemExit("CN_NGINX_UPSTREAM_NOT_EXACTLY_ONE")
print(ports[0].decode())
PY
)"
[[ "$ACTIVE_PORT" == 3194 ]] || { echo "CN_PRODUCTION_UPSTREAM_NOT_3194:$ACTIVE_PORT"; exit 1; }
if grep -Eq '127\.0\.0\.1:3195' "$NGINX"; then
  echo CN3195_MUST_NOT_BE_NGINX_PRODUCTION_UPSTREAM >&2; exit 1
fi
curl --noproxy '*' -fsS --connect-timeout 3 --max-time 12 -H 'Host: lingxifield.cn' http://127.0.0.1:3194/api/health >/dev/null
echo CN3194_PRODUCTION_HEALTH_PASS

if ! systemctl cat "$OLD_SVC" >/dev/null 2>&1; then
  if ss -lntp | grep -Eq '[:.]3195[[:space:]]'; then
    echo CN3195_OCCUPIED_BY_UNKNOWN_SERVICE_NO_CHANGE >&2
    ss -lntp | grep -E '[:.]3195[[:space:]]' || true
    exit 1
  fi
  echo CN3195_ALREADY_FREE
  exit 0
fi

systemctl is-active --quiet "$OLD_SVC" || {
  echo KNOWN_OLD_STAGE_UNIT_EXISTS_BUT_NOT_ACTIVE_NO_CHANGE >&2
  systemctl status "$OLD_SVC" --no-pager -l || true
  exit 1
}
UNIT_TEXT="$(systemctl cat "$OLD_SVC")"
grep -Eq '^Environment=PORT=3195([[:space:]]|$)' <<<"$UNIT_TEXT" || {
  echo OLD_STAGE_UNIT_PORT_IDENTITY_MISMATCH >&2; exit 1
}
WORKDIR="$(systemctl show "$OLD_SVC" -p WorkingDirectory --value)"
[[ "$WORKDIR" =~ ^${BASE}/[a-f0-9]{40}$ ]] || {
  echo OLD_STAGE_WORKDIR_OUTSIDE_RELEASE_ROOT >&2; exit 1
}
[[ -f "$WORKDIR/RELEASE_SOURCE_SHA" && ! -L "$WORKDIR/RELEASE_SOURCE_SHA" ]] || {
  echo OLD_STAGE_SOURCE_MARKER_MISSING >&2; exit 1
}
OLD_SHA="$(tr -d '\r\n' < "$WORKDIR/RELEASE_SOURCE_SHA")"
[[ "$OLD_SHA" =~ ^[a-f0-9]{40}$ ]] || { echo OLD_STAGE_SOURCE_SHA_INVALID >&2; exit 1; }
[[ "$OLD_SHA" != "$EXPECTED_SHA" ]] || {
  echo CURRENT_F07D_CANDIDATE_ALREADY_STAGED_DO_NOT_STOP >&2; exit 1
}
MAIN_PID="$(systemctl show "$OLD_SVC" -p MainPID --value)"
[[ "$MAIN_PID" =~ ^[1-9][0-9]*$ ]] || { echo OLD_STAGE_MAINPID_INVALID >&2; exit 1; }
LISTENER_PIDS="$(ss -lntpH 'sport = :3195' | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u || true)"
[[ -n "$LISTENER_PIDS" && "$LISTENER_PIDS" == "$MAIN_PID" ]] || {
  echo CN3195_LISTENER_NOT_OWNED_EXCLUSIVELY_BY_KNOWN_OLD_UNIT >&2
  ss -lntp | grep -E '[:.]3195[[:space:]]' || true
  exit 1
}

echo "STALE_STAGE_IDENTITY_PASS service=$OLD_SVC old_source=$OLD_SHA pid=$MAIN_PID"
echo "LIVE_3194_UNCHANGED_PRECHECK_PASS"
systemctl stop "$OLD_SVC"
systemctl disable "$OLD_SVC" >/dev/null 2>&1 || true

for _ in $(seq 1 20); do
  if ! ss -lntp | grep -Eq '[:.]3195[[:space:]]'; then break; fi
  sleep 1
done
if ss -lntp | grep -Eq '[:.]3195[[:space:]]'; then
  echo CN3195_PORT_STILL_OCCUPIED_AFTER_SAFE_STOP >&2
  ss -lntp | grep -E '[:.]3195[[:space:]]' || true
  exit 1
fi
systemctl is-active --quiet "$OLD_SVC" && { echo OLD_STAGE_SERVICE_STILL_ACTIVE >&2; exit 1; }
[[ "$(sha256sum "$NGINX" | awk '{print $1}')" == "$NGINX_SHA_BEFORE" ]] || {
  echo NGINX_CONFIG_CHANGED_UNEXPECTEDLY >&2; exit 1
}
[[ "$(python3 - "$NGINX" <<'PY'
import re,sys
data=open(sys.argv[1],"rb").read()
ports=re.findall(rb'(?m)^\s*(?:proxy_pass\s+http://|server\s+)127\.0\.0\.1:(3193|3194|3195)(?:;|\s)',data)
if len(ports)!=1: raise SystemExit(2)
print(ports[0].decode())
PY
)" == 3194 ]] || { echo CN_PRODUCTION_UPSTREAM_CHANGED >&2; exit 1; }
curl --noproxy '*' -fsS --connect-timeout 3 --max-time 12 -H 'Host: lingxifield.cn' http://127.0.0.1:3194/api/health >/dev/null
echo CN3195_STALE_STAGE_STOPPED_AND_DISABLED
echo CN3194_PRODUCTION_HEALTH_STILL_PASS
echo CN3194_NGINX_UPSTREAM_UNCHANGED
echo OLD_STAGE_FILES_PRESERVED_FOR_AUDIT_AND_ROLLBACK
