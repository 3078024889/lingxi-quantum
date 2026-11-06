#!/usr/bin/env bash
# CN document gateway candidate: source-verified staged apply only, never public switch.
# Exact GitHub SHA256 pinned. Compare canonical public assets byte-for-byte, verifying old duplicated public/public files safely.
set -Eeuo pipefail
umask 077
if [ "$(id -u)" -ne 0 ] || [ "$#" -ne 1 ] || [ "$1" != "--apply-doc-gateway-3189" ]; then
 echo 'USAGE: bash ecs-cn-doc-gateway-stage.sh --apply-doc-gateway-3189 (root only)'
 exit 2
fi
NODE=/opt/lingxifield/runtime/node-24.19.0/bin/node
INSTALLER=/root/lingxifield-cn-candidate-6b391150/ecs-cn-3189-safe-apply.sh
OLD=/root/lingxifield-cn-candidate-6b391150/cn-ecs-standalone.tar.gz
BASE=/root/lingxifield-cn-doc-gateway-dc013d10
NEW="$BASE/cn-ecs-document-gateway.tar.gz"
SUM="$BASE/cn-ecs-document-gateway.sha256"
STAGE=/opt/lingxifield/releases/cn-pr199
SERVICE=lingxifield-cn-stage
PRODUCTION=lingxifield-ecs
NEW_SIZE=453743162
NEW_HASH=0c965bdbfedc643189b72208cb9bad33ebc6582431112e968dfddb5ff7495e67
OLD_HASH=b8dc6a113414eb1617035f40861b85fc99698e8cf44f829d27b7b7521f9bb858
URL=https://ghfast.top/https://github.com/3078024889/lingxi-quantum/releases/download/ecs-cn-doc-gateway-20261106-dc013d10/cn-ecs-document-gateway.tar.gz
test -x "$NODE"
test -s "$INSTALLER"
test -s "$OLD"
test -s /root/cn3189-doc-real.mjs
systemctl is-active --quiet "$PRODUCTION" || { echo CN_3188_NOT_ACTIVE_ABORT; exit 3; }
systemctl is-active --quiet "$SERVICE" || { echo CN_3189_NOT_ACTIVE_ABORT; exit 3; }
test "$(systemctl show -p WorkingDirectory --value "$SERVICE")" = "$STAGE" || { echo CN_3189_STAGE_PATH_COLLISION_ABORT; exit 3; }
case "$(systemctl show -p EnvironmentFiles --value "$SERVICE")" in
 *"/etc/lingxifield/staging.env"*) ;;
 *) echo CN_3189_NONISOLATED_ENV_ABORT; exit 3 ;;
esac
prod_pid="$(systemctl show -p MainPID --value "$PRODUCTION")"
test "$prod_pid" -gt 1
python3 - "$INSTALLER" /root/cn3189-doc-real.mjs <<'PY'
import hashlib,sys
from pathlib import Path
expected={
 "ecs-cn-3189-safe-apply.sh":"a5fd79b0a2f8118c36f062c38daf23dbc5123519",
 "cn3189-doc-real.mjs":"c2b575bdd3682e6ec6fdeb4c688537aa874b58a4",
}
for name in sys.argv[1:]:
 p=Path(name)
 b=p.read_bytes()
 sha=hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
 if sha!=expected[p.name]:raise SystemExit("CN_SOURCE_INTEGRITY_FAILED")
print("CN_RELEASE_OPERATOR_AND_DOC_TEST_VERIFIED")
PY
bash -n "$INSTALLER"
"$NODE" --check /root/cn3189-doc-real.mjs
printf '%s  %s\n' "$OLD_HASH" "$OLD" | sha256sum -c -
mkdir -p -m 700 "$BASE"
if [ -s "$NEW" ] && echo "$NEW_HASH  $NEW" | sha256sum -c --status; then
 echo CN_NEW_ARCHIVE_ALREADY_SHA256_VERIFIED
else
 echo CN_SIGNED_GITHUB_RELEASE_GHFAST_RESUMABLE_DOWNLOAD_STARTED
 curl -4fL --retry 4 --retry-delay 2 --connect-timeout 25 --max-time 3600 \
   --continue-at - --output "$NEW" "$URL"
fi
test "$(stat -c %s "$NEW")" -eq "$NEW_SIZE" || { echo CN_NEW_ARCHIVE_SIZE_MISMATCH; exit 4; }
printf '%s  %s\n' "$NEW_HASH" "cn-ecs-document-gateway.tar.gz" >"$SUM"
(cd "$BASE" && sha256sum -c cn-ecs-document-gateway.sha256)
echo CN_SIGNED_GITHUB_RELEASE_HASH_AND_SIZE_PASS
CHECKER="$BASE/verify-public-asset-preservation.py"
CHECKER_URL=https://raw.githubusercontent.com/3078024889/lingxi-quantum/67799ef7df83bdaa1ebacd7e189c06813394f179/scripts/ops/ecs-cn-verify-public-asset-preservation.py
if ! curl -4fLsS --retry 3 --connect-timeout 20 --max-time 120 -o "$CHECKER" "https://gh-proxy.com/$CHECKER_URL"; then
 curl -4fLsS --retry 3 --connect-timeout 20 --max-time 120 -o "$CHECKER" "$CHECKER_URL"
fi
python3 - "$CHECKER" <<'PY'
import hashlib,sys
from pathlib import Path
p=Path(sys.argv[1]);b=p.read_bytes()
sha=hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
if sha!="b311a9ac2b295464da7841980495a79d6977b0ec":
 raise SystemExit("CN_ASSET_VERIFIER_SOURCE_MISMATCH")
print("CN_ASSET_VERIFIER_SOURCE_VERIFIED")
PY
python3 -m py_compile "$CHECKER"
if ! python3 "$CHECKER" "$OLD" "$NEW"; then
 echo CN_PUBLIC_MODEL_OR_ASSET_PRESERVATION_FAILED
 exit 5
fi
systemctl is-active --quiet "$PRODUCTION" || { echo CN_PRODUCTION_UNHEALTHY_ABORT; exit 5; }
echo CN_STAGE_APPLY_SIGNED_DOCUMENT_GATEWAY_CANDIDATE
log="$BASE/stage-apply.log"
bash "$INSTALLER" "$NEW" "$SUM" | tee "$log"
backup="$(grep '^CN_3189_ROLLBACK_BACKUP=' "$log" | tail -1 | cut -d= -f2-)"
case "$backup" in /opt/lingxifield/backups/cn-stage-*) ;; *) echo CN_BACKUP_REFERENCE_INVALID; exit 6;; esac
test -d "$backup"
rollback(){
 echo CN_DOC_REAL_GATE_FAILED_STAGE_ONLY_RESTORING_BACKUP
 systemctl stop "$SERVICE"
 rejected="/opt/lingxifield/backups/cn-doc-rejected-$(date -u +%Y%m%dT%H%M%SZ)-$$"
 mv -- "$STAGE" "$rejected"
 mv -- "$backup" "$STAGE"
 systemctl start "$SERVICE"
 for _ in $(seq 1 30); do
  code="$(curl --noproxy '*' --silent --max-time 3 -o /dev/null -w '%{http_code}' http://127.0.0.1:3189/api/health || true)"
  if [ "$code" = 200 ]; then break; fi
  sleep 1
 done
 echo CN_DOC_STAGE_ROLLED_BACK_PRODUCTION_3188_UNTOUCHED
}
echo CN_3189_REAL_DOCX_PDF_AND_REPLAY_TEST_BEGIN
if ! "$NODE" /root/cn3189-doc-real.mjs --run-local-3189-only; then
 rollback
 exit 7
fi
if ! systemctl is-active --quiet "$PRODUCTION" || [ "$(systemctl show -p MainPID --value "$PRODUCTION")" != "$prod_pid" ]; then
 echo CN_3188_PRODUCTION_PID_CHANGED_NO_PUBLIC_SWITCH
 exit 8
fi
echo CN_DOCUMENT_NORMALIZE_REAL_PASS_WITH_HMAC_REPLAY_CHECK
echo CN_CANDIDATE_3189_ACCEPTED_3188_UNCHANGED
echo CN_PUBLIC_SWITCH_NOT_ATTEMPTED_SASI_AND_PAYMENT_STILL_UNVERIFIED
