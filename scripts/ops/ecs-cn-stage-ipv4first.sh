#!/usr/bin/env bash
# Scoped IPv4 DNS preference for .cn port 3189 only. Never edits production 3188.
# R2 is dual-stack but this ECS has demonstrated working IPv4 and intermittent IPv6 failures.
set -Eeuo pipefail
umask 077
if [ "$(id -u)" -ne 0 ] || [ "$#" -ne 1 ] || [ "$1" != "--apply-3189-only" ]; then
  echo "USAGE: bash ecs-cn-stage-ipv4first.sh --apply-3189-only (root only)"
  exit 2
fi
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
SERVICE=lingxifield-cn-stage
PRODUCTION=lingxifield-ecs
RELEASE=/opt/lingxifield/releases/cn-pr199
CONF_DIR=/etc/systemd/system/lingxifield-cn-stage.service.d
CONF="$CONF_DIR/90-cn-ipv4first.conf"
test -x "$NODE"
systemctl is-active --quiet "$PRODUCTION" || { echo CN_3188_NOT_ACTIVE_ABORT; exit 3; }
systemctl is-active --quiet "$SERVICE" || { echo CN_3189_NOT_ACTIVE_ABORT; exit 3; }
test "$(systemctl show -p WorkingDirectory --value "$SERVICE")" = "$RELEASE" || {
  echo CN_STAGE_CWD_MISMATCH_ABORT; exit 3;
}
stage_env="$(systemctl show -p EnvironmentFiles --value "$SERVICE")"
case "$stage_env" in *"/etc/lingxifield/staging.env"*) ;; *) echo CN_STAGE_ENV_MISMATCH_ABORT; exit 3;; esac
prod_pid="$(systemctl show -p MainPID --value "$PRODUCTION")"
if grep -Eq '^[[:space:]]*NODE_OPTIONS[[:space:]]*=' /etc/lingxifield/staging.env; then
  echo CN_ENVFILE_NODE_OPTIONS_OVERRIDE_ABORT
  exit 3
fi
if [ -e "$CONF" ]; then
  echo CN_IPV4_PREF_EXISTING_OVERRIDE_ABORT
  exit 4
fi
NODE_OPTIONS='--max-old-space-size=512 --dns-result-order=ipv4first' "$NODE" -e '
if(require("node:dns").getDefaultResultOrder()!=="ipv4first")process.exit(2);
console.log("CN_IPV4_PREFERENCE_NODE24_VERIFIED");
'
mkdir -p -m 755 "$CONF_DIR"
TMP="$(mktemp "$CONF_DIR/.cn-ipv4first.XXXXXX")"
changed=0
rollback(){
  rc=$?
  trap - EXIT
  rm -f "$TMP"
  if [ "$changed" -eq 1 ] && [ "$rc" -ne 0 ]; then
    set +e
    rm -f "$CONF"
    systemctl daemon-reload
    systemctl restart "$SERVICE"
    echo CN_IPV4_OVERRIDE_ROLLED_BACK_STAGING_ONLY
  fi
  exit "$rc"
}
trap rollback EXIT
printf '[Service]\nEnvironment="NODE_OPTIONS=--max-old-space-size=512 --dns-result-order=ipv4first"\n' >"$TMP"
chmod 0644 "$TMP"
mv -- "$TMP" "$CONF"
changed=1
systemctl daemon-reload
systemctl restart "$SERVICE"
good=0
for i in $(seq 1 30); do
  code="$(curl --noproxy '*' --silent --max-time 3 --output /dev/null --write-out '%{http_code}' http://127.0.0.1:3189/api/health || true)"
  if [ "$code" = 200 ]; then good=1; break; fi
  sleep 1
done
if [ "$good" -ne 1 ]; then echo CN_STAGE_RESTART_HEALTH_FAILED; exit 5; fi
unauth="$(curl --noproxy '*' --silent --max-time 12 --output /dev/null --write-out '%{http_code}' http://127.0.0.1:3189/api/tools/jobs)"
if [ "$unauth" != 401 ]; then echo CN_STAGE_AUTH_BOUNDARY_FAILED; exit 5; fi
systemctl is-active --quiet "$PRODUCTION" || { echo CN_PROD_STOPPED_ABORT; exit 5; }
test "$(systemctl show -p MainPID --value "$PRODUCTION")" = "$prod_pid" || {
  echo CN_PROD_PID_CHANGED_ABORT; exit 5;
}
trap - EXIT
echo CN_STAGE_IPV4FIRST_APPLIED_3188_UNCHANGED
