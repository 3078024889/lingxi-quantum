#!/usr/bin/env bash
# CN 3189 ONLY: install the exact verified GitHub candidate, preserving public 3188.
# Uses a pinned Python 3.6-compatible parallel downloader. No systemd unit overwrite.
set -Eeuo pipefail
umask 077
if [ "$(id -u)" != 0 ] || [ "$#" != 1 ] || [ "$1" != "--apply-staging-candidate" ]; then
  echo "USAGE: bash ecs-cn-3189-bootstrap.sh --apply-staging-candidate (root only)"
  exit 2
fi
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
SCRIPT_URL=https://raw.githubusercontent.com/3078024889/lingxi-quantum/14667c69e7169fc3538c3933cec0e5d493e79c13/scripts/ops/ecs-cn-3189-safe-apply.sh
DOWNLOAD_URL=https://raw.githubusercontent.com/3078024889/lingxi-quantum/bdd4a22e38b7cb6de8102fc7d9ab7b482c4b3f50/scripts/ops/ecs-cn-parallel-release-fetch.py
DIR=/root/lingxifield-cn-candidate-6b391150
INSTALLER="$DIR/ecs-cn-3189-safe-apply.sh"
DOWNLOADER="$DIR/ecs-cn-parallel-release-fetch.py"
ARCHIVE="$DIR/cn-ecs-standalone.tar.gz"
CHECKSUM="$DIR/cn-ecs-standalone.sha256"
HASH=b8dc6a113414eb1617035f40861b85fc99698e8cf44f829d27b7b7521f9bb858
mkdir -p -m 700 "$DIR"
test -x "$NODE"
systemctl is-active --quiet lingxifield-ecs || { echo CN_3188_PRODUCTION_NOT_ACTIVE_ABORT; exit 3; }
systemctl is-active --quiet lingxifield-cn-stage || { echo CN_3189_STAGE_NOT_ACTIVE_ABORT; exit 3; }
test -s /etc/lingxifield/staging.env
test "$(systemctl show -p WorkingDirectory --value lingxifield-cn-stage)" = "/opt/lingxifield/releases/cn-pr199" || {
  echo CN_STAGE_WORKDIR_GUARD_FAILED; exit 3;
}
stage_env="$(systemctl show -p EnvironmentFiles --value lingxifield-cn-stage)"
case "$stage_env" in *"/etc/lingxifield/staging.env"*) ;; *) echo CN_STAGE_ENV_GUARD_FAILED; exit 3;; esac
stage_exec="$(systemctl show -p ExecStart --value lingxifield-cn-stage)"
case "$stage_exec" in *"/opt/lingxifield/releases/cn-pr199/server.js"*) ;; *) echo CN_STAGE_EXEC_GUARD_FAILED; exit 3;; esac
"$NODE" -e '
const {readFileSync}=require("node:fs");
const {parseEnv}=require("node:util");
const e=parseEnv(readFileSync("/etc/lingxifield/staging.env","utf8"));
if(e.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.cn"||
   e.NEXT_PUBLIC_SUPABASE_URL!=="https://sxsgdpqojepgbbrxrzlq.supabase.co"||
   ["ALIPAY_ENABLED","WECHAT_MINI_VPAY_TOPUPS_ENABLED","WECHAT_MINI_VPAY_TOOLS_ENABLED"].some(k=>e[k]!=="false"))
 {console.log("CN_STAGING_ISOLATION_OR_PAYMENT_FLAGS_FAILED");process.exit(2)}
console.log("CN_STAGING_SITE_SUPABASE_PAYMENT_GATES_PASS");
'
get_small(){
  local url="$1" dest="$2"
  if curl -4 -fL --retry 3 --connect-timeout 20 --max-time 120 -o "$dest" "https://gh-proxy.com/$url"; then
    return 0
  fi
  curl -4 -fL --retry 3 --connect-timeout 20 --max-time 120 -o "$dest" "$url"
}
get_small "$SCRIPT_URL" "$INSTALLER"
get_small "$DOWNLOAD_URL" "$DOWNLOADER"
python3 - "$INSTALLER" "$DOWNLOADER" <<'PY'
import hashlib,sys
from pathlib import Path
expected={
 "ecs-cn-3189-safe-apply.sh":"a5fd79b0a2f8118c36f062c38daf23dbc5123519",
 "ecs-cn-parallel-release-fetch.py":"1691aad9715281da1328c038431bb0331424c7b7"
}
for name in sys.argv[1:]:
 p=Path(name)
 b=p.read_bytes()
 sha=hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
 if sha!=expected[p.name]:
  raise SystemExit("CN_OPERATOR_SOURCE_MISMATCH")
print("CN_OPERATOR_SOURCES_VERIFIED")
PY
bash -n "$INSTALLER"
python3 -m py_compile "$DOWNLOADER"
printf '%s  %s\n' "$HASH" "cn-ecs-standalone.tar.gz" > "$CHECKSUM"
if [ -s "$ARCHIVE" ] && (cd "$DIR" && sha256sum -c --status cn-ecs-standalone.sha256); then
  echo CN_RELEASE_ARCHIVE_ALREADY_VERIFIED
else
  echo CN_RELEASE_PARALLEL_RESUME_STARTED
  python3 "$DOWNLOADER" --workers 8
fi
(
  cd "$DIR"
  sha256sum -c cn-ecs-standalone.sha256
)
test "$(stat -c %s "$ARCHIVE")" -eq 863193911 || { echo CN_RELEASE_SIZE_MISMATCH; exit 4; }
systemctl is-active --quiet lingxifield-ecs || { echo CN_PRODUCTION_CHANGED_ABORT; exit 5; }
echo CN_STAGE_INSTALL_BEGIN_WITHOUT_UNIT_REPLACEMENT
bash "$INSTALLER" "$ARCHIVE" "$CHECKSUM"
echo CN_PUBLIC_DOMAIN_STILL_UNPROMOTED
