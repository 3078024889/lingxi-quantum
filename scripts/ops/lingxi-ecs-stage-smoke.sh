#!/usr/bin/env bash
# SHA-verified release installation on isolated localhost:3191 only.
# NEVER switch live site, Nginx, DNS, systemd 3188/3189 or production.env.
set -Eeuo pipefail
umask 077
SHA="c5a9acbc4f0f6d85bfbfa0d9e177a18f26c262ed"
# GitHub Actions artifact 13568433342; verified against GitHub's artifact-digest metadata.
ZIP_SHA="8ed39d315eccb337d9a4ebf84ff8c5eb981c0cd238ee119a66debe059344ded7"
BASE="/opt/lingxifield/cn-staged-releases"
DIR="$BASE/$SHA"
ENV="/etc/lingxifield/staging.env"
UNIT="lingxifield-cn-verify-c5a9acbc4f0f"
PORT=3191
fail(){ echo "CN_STAGE_ABORT:$*" >&2; exit 1; }
test "$#" = 1 || fail "USAGE: bash lingxi-ecs-stage-smoke.sh /root/lingxifield-cn.zip"
test "$(id -u)" = 0 || fail "ROOT_REQUIRED"
ZIP="$(readlink -f -- "$1")" || fail "BAD_ZIP_PATH"
test -r "$ZIP" || fail "ZIP_NOT_READABLE"
for cmd in unzip sha256sum tar curl systemctl systemd-run flock awk grep stat df; do
 command -v "$cmd" >/dev/null || fail "MISSING_COMMAND:$cmd"
done
test -f "$ENV" && test ! -L "$ENV" || fail "STAGING_ENV_MISSING_OR_SYMLINK"
test "$(stat -c %u "$ENV")" = 0 || fail "STAGING_ENV_NOT_ROOT_OWNED"
MODE="$(stat -c %a "$ENV")"
test "$MODE" = 600 || test "$MODE" = 400 || fail "STAGING_ENV_INSECURE_PERMISSIONS"
NODE="$(command -v node || true)"
test -n "$NODE" || NODE="/opt/lingxifield/runtime/node-24.19.0/bin/node"
test -x "$NODE" || fail "NODE_BINARY_MISSING"
MAJOR="$("$NODE" -p 'process.versions.node.split(".")[0]')" || fail "NODE_ERROR"
test "$MAJOR" -ge 24 || fail "NODE24_REQUIRED"
mkdir -p "$BASE"
exec 9>"$BASE/.install-lock"
flock -n 9 || fail "STAGING_INSTALL_BUSY"
test ! -e "$DIR" || fail "VERSION_ALREADY_STAGED"
DISK="$(df -Pk "$BASE" | awk 'NR==2{print $4}')"
test "$DISK" -ge 3145728 || fail "NEED_3_GIB_FREE_SPACE"
MEM="$(awk '/MemAvailable:/{print $2}' /proc/meminfo)"
test "$MEM" -ge 500000 || fail "MEM_AVAILABLE_UNDER_500_MB"
echo "$ZIP_SHA  $ZIP" | sha256sum -c --status || fail "OUTER_ZIP_SHA256_MISMATCH"
echo "CN_GITHUB_ARTIFACT_SHA256_PASS"
TMP="$(mktemp -d "$BASE/.stage-c5a9acbc-XXXXXXXX")"
started=0
cleanup(){
 if test "$started" = 1; then systemctl stop "$UNIT" >/dev/null 2>&1 || true; fi
 test ! -d "$TMP" || rm -rf -- "$TMP"
}
trap cleanup EXIT
unzip -Z -1 "$ZIP" > "$TMP/zip-list" || fail "ZIP_LIST_FAILED"
test "$(wc -l < "$TMP/zip-list")" = 4 || fail "UNEXPECTED_FILES_IN_ZIP"
for f in lingxifield-ecs-standalone.tar.gz lingxifield-ecs-standalone.sha256 SHA.txt NOT_PRODUCTION_APPROVED.txt; do
 grep -Fxq "$f" "$TMP/zip-list" || fail "MISSING_ZIP_ENTRY:$f"
done
unzip -qq "$ZIP" -d "$TMP/outer" || fail "UNZIP_FAILED"
test "$(tr -d '\r\n' < "$TMP/outer/SHA.txt")" = "$SHA" || fail "SOURCE_SHA_MISMATCH"
# Fail closed against the exact sentinel produced by the verified packaging workflow.
grep -Fxq "Preview package only: no real login, payment, R2 or file roundtrip acceptance." "$TMP/outer/NOT_PRODUCTION_APPROVED.txt" || fail "PRODUCTION_BLOCK_SENTINEL_MISMATCH"
(cd "$TMP/outer" && sha256sum -c lingxifield-ecs-standalone.sha256) || fail "INNER_TAR_SHA256_MISMATCH"
mkdir -p "$TMP/runtime"
tar -xzf "$TMP/outer/lingxifield-ecs-standalone.tar.gz" -C "$TMP/runtime" || fail "TAR_EXTRACT_FAILED"
test -s "$TMP/runtime/server.js" || fail "STANDALONE_SERVER_NOT_FOUND"
test -d "$TMP/runtime/.next/static" && test -d "$TMP/runtime/public" || fail "STANDALONE_STATIC_ASSETS_MISSING"
"$NODE" --check "$TMP/runtime/server.js" || fail "NODE_SERVER_CHECK_FAILED"
systemctl is-active --quiet lingxifield-ecs || fail "PRODUCTION_NOT_HEALTHY_STOP"
systemctl is-active --quiet lingxifield-cn-stage || fail "EXISTING_STAGE_NOT_HEALTHY_STOP"
if curl --noproxy '*' -s --max-time 2 -o /dev/null "http://127.0.0.1:$PORT/api/health"; then
 fail "PORT_3191_IN_USE"
fi
mv "$TMP/runtime" "$DIR"
chmod 0700 "$DIR"
systemd-run --unit="$UNIT" --collect \
 --property="EnvironmentFile=$ENV" --property="WorkingDirectory=$DIR" \
 --setenv="PORT=$PORT" --setenv="HOSTNAME=127.0.0.1" --setenv="NODE_ENV=production" \
 "$NODE" "$DIR/server.js" >/dev/null || fail "TRANSIENT_STAGE_START_FAILED"
started=1
probe(){
 local path="$1" expected="$2" got
 got="$(curl --noproxy '*' -sS --max-time 25 -o /dev/null -w '%{http_code}' \
 -H "Host: lingxifield.cn" -H "X-Forwarded-Host: lingxifield.cn" \
 -H "X-Forwarded-Proto: https" "http://127.0.0.1:$PORT$path")" || return 1
 echo "CN_STAGE_ROUTE:$path:$got"
 test "$got" = "$expected"
}
ready=0
for i in $(seq 1 40); do
 if probe "/api/health" 200; then ready=1; break; fi
 sleep 2
done
test "$ready" = 1 || fail "STAGE_HEALTH_FAILED"
probe "/" 200 || fail "STAGE_HOME_FAILED"
probe "/tools" 200 || fail "STAGE_TOOLS_FAILED"
probe "/siai" 200 || fail "STAGE_SIAI_FAILED"
probe "/api/sasi/account" 401 || fail "STAGE_SASI_AUTH_FAILED"
probe "/api/tools/jobs" 401 || fail "STAGE_TOOL_AUTH_FAILED"
systemctl is-active --quiet lingxifield-ecs || fail "LIVE_PRODUCTION_STOPPED"
echo "CN_EXACT_SHA_STAGE_SMOKE_PASS"
echo "STAGED_SOURCE_SHA=$SHA"
echo "STAGED_DIR=$DIR"
echo "PRODUCTION_UNTOUCHED=true"
