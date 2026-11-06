#!/usr/bin/env bash
# Operator-authorized 3189-only preproduction installer. No public domain switch.
set -Eeuo pipefail
umask 077
if [ "$(id -u)" != 0 ] || [ "$#" != 1 ] || [ "$1" != "--apply-staging-candidate" ]; then
 echo "USE: bash ecs-cn-3189-bootstrap.sh --apply-staging-candidate (root only)"
 exit 2
fi
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
BASE=https://raw.githubusercontent.com/3078024889/lingxi-quantum/14667c69e7169fc3538c3933cec0e5d493e79c13
RELEASE=https://github.com/3078024889/lingxi-quantum/releases/download/ecs-cn-candidate-20261106-6b391150
DIR=/root/lingxifield-cn-candidate-6b391150
INSTALLER="$DIR/ecs-cn-3189-safe-apply.sh"
UNIT="$DIR/lingxifield-cn-stage.service"
ARCHIVE="$DIR/cn-ecs-standalone.tar.gz"
CHECKSUM="$DIR/cn-ecs-standalone.sha256"
mkdir -p -m 700 "$DIR"
test -x "$NODE"
systemctl is-active --quiet lingxifield-ecs || { echo CN_PROD_INACTIVE_ABORT; exit 3; }
systemctl is-active --quiet lingxifield-cn-stage || { echo CN_STAGE_INACTIVE_ABORT; exit 3; }
test -s /etc/lingxifield/staging.env
# No secret values are printed. Stage financial switches must remain off.
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
get_public(){
 local url="$1" dest="$2" budget="$3"
 if curl -fL --retry 2 --connect-timeout 20 --max-time "$budget" -o "$dest" "$url"; then return 0; fi
 curl -fL --retry 2 --connect-timeout 20 --max-time "$budget" -o "$dest" "https://gh-proxy.com/$url"
}
echo "=== Download pinned 3189 safety installer ==="
get_public "$BASE/scripts/ops/ecs-cn-3189-safe-apply.sh" "$INSTALLER" 120
get_public "$BASE/infra/selfhost/lingxifield-cn-stage.service" "$UNIT" 120
python3 - "$INSTALLER" "$UNIT" <<'PY'
import hashlib,sys
expected={
 "ecs-cn-3189-safe-apply.sh":"a5fd79b0a2f8118c36f062c38daf23dbc5123519",
 "lingxifield-cn-stage.service":"391f1f6cfde9b9b7c5c4e3e6d8102f7154e235d3"
}
from pathlib import Path
for arg in sys.argv[1:]:
 p=Path(arg); b=p.read_bytes()
 val=hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
 if val!=expected[p.name]: raise SystemExit("CN_RELEASE_OPERATOR_SOURCE_MISMATCH")
print("CN_RELEASE_OPERATOR_SOURCE_VERIFIED")
PY
bash -n "$INSTALLER"
echo "=== Download immutable .cn candidate ==="
get_public "$RELEASE/cn-ecs-standalone.sha256" "$CHECKSUM" 120
get_public "$RELEASE/cn-ecs-standalone.tar.gz" "$ARCHIVE" 2400
( cd "$DIR" && sha256sum -c cn-ecs-standalone.sha256 )
test "$(stat -c %s "$ARCHIVE")" -lt 1000000000
echo "=== Correct staging unit to independent env (no 3188 restart) ==="
UNIT_TARGET=/etc/systemd/system/lingxifield-cn-stage.service
test -s "$UNIT_TARGET" || { echo CN_STAGE_UNIT_NOT_PRESENT; exit 4; }
cp -a "$UNIT_TARGET" "$DIR/previous-cn-stage-unit.service"
install -m 644 "$UNIT" "$UNIT_TARGET"
systemctl daemon-reload
echo "=== Atomically install and verify 3189; rollback automatically on failure ==="
bash "$INSTALLER" "$ARCHIVE" "$CHECKSUM"
echo "CN_3189_PACKAGE_APPLIED_FORMAL_3188_UNCHANGED"
echo "CN_PUBLIC_DOMAIN_STILL_UNPROMOTED"
