#!/usr/bin/env bash
# Compatibility runner for older distro curl builds. No --retry-all-errors dependency.
# Downloads immutable, SHA-pinned scripts and the exact 3194 release; stages and promotes
# only after the existing 3193 baseline, artifact hash, source SHA and loopback gates pass.
set -Eeuo pipefail
umask 077

TAG="ecs-cn-unified-20261108-5054d6f492c1"
SOURCE_SHA="5054d6f492c14c7f476acbfb3152a28b1a308a30"
ARCHIVE_SHA="4368bd5956dd2f68f6aa46a564ffeef5751fb68d78903182f754831d352602ea"
ARCHIVE_BYTES="454674344"

# Git blob object IDs pin the exact reviewed script bytes at SOURCE_REF.
SOURCE_REF="1079b8f69b6622563951664ef960532b61c0fac1"
UPGRADE_BLOB_SHA="5e509aab527228332b179fc44341c81817ba290c"
PAYMENT_BLOB_SHA="897a38e8b90c93168396181555a7a008e01c0e24"

BASE="/opt/lingxifield/cn-staged-releases"
WORK="$BASE/.download-$TAG"
FILE="cn-20261108-unified-standalone.tar.gz"
CHECK="cn-20261108-unified-standalone.sha256"
RAW="https://raw.githubusercontent.com/3078024889/lingxi-quantum/$SOURCE_REF"
RELEASE="https://github.com/3078024889/lingxi-quantum/releases/download/$TAG"
UPGRADE="$WORK/ecs-cn3194-unified-standalone-upgrade-20261109.sh"
PAYMENT="$WORK/cn-payment-activate-3194-20261109.sh"
ARCHIVE="$WORK/$FILE"

test "$EUID" = 0 || { echo ROOT_REQUIRED; exit 1; }
command -v curl >/dev/null 2>&1 || { echo CURL_REQUIRED; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo PYTHON3_REQUIRED; exit 1; }
command -v sha256sum >/dev/null 2>&1 || { echo SHA256SUM_REQUIRED; exit 1; }
mkdir -p "$BASE" "$WORK"
chmod 700 "$WORK"

echo "CURL_COMPATIBILITY_MODE: manual bounded retry; no --retry-all-errors"
curl --version | head -n 1

download_small_pinned() {
  local url="$1" dest="$2" expected_blob="$3" tmp="2.part"
  local attempt
  for attempt in $(seq 1 12); do
    rm -f "$tmp"
    if curl --noproxy '*' -fL --connect-timeout 30 --max-time 180 "$url" -o "$tmp"; then
      if python3 - "$tmp" "$expected_blob" <<'PY'
import hashlib,sys
path,expected=sys.argv[1:3]
data=open(path,"rb").read()
actual=hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()
if actual != expected:
    print("GITHUB_SCRIPT_BLOB_MISMATCH expected="+expected+" actual="+actual,file=sys.stderr)
    raise SystemExit(1)
print("PINNED_GITHUB_SCRIPT_BLOB_PASS")
PY
      then
        mv -f "$tmp" "$dest"
        chmod 700 "$dest"
        return 0
      fi
      rm -f "$tmp"
      echo "PINNED_SCRIPT_INTEGRITY_FAILED: $dest" >&2
      return 1
    fi
    rm -f "$tmp"
    echo "SCRIPT_DOWNLOAD_RETRY $attempt/12: $url" >&2
    sleep 5
  done
  echo "SCRIPT_DOWNLOAD_FAILED: $url" >&2
  return 1
}

download_release_resumable() {
  local url="$1" dest="$2" expected_bytes="$3"
  local attempt have rc
  for attempt in $(seq 1 40); do
    have=0
    if [[ -f "$dest" && ! -L "$dest" ]]; then
      have="$(stat -c %s "$dest")"
    fi
    if (( have > expected_bytes )); then
      rm -f "$dest"
      have=0
    fi
    if (( have == expected_bytes )); then
      if [[ "$(sha256sum "$dest" | awk '{print $1}')" == "$ARCHIVE_SHA" ]]; then
        echo "REUSE_EXACT_SHA256_VERIFIED_ARCHIVE"
        return 0
      fi
      echo "FULL_LENGTH_ARCHIVE_HASH_MISMATCH_RESETTING" >&2
      rm -f "$dest"
      have=0
    fi

    if (( have > 0 )); then
      if curl --noproxy '*' -fL --connect-timeout 30 -C - "$url" -o "$dest"; then
        rc=0
      else
        rc=$?
      fi
    else
      if curl --noproxy '*' -fL --connect-timeout 30 "$url" -o "$dest"; then
        rc=0
      else
        rc=$?
      fi
    fi

    if (( rc == 0 )); then
      have="$(stat -c %s "$dest" 2>/dev/null || echo 0)"
      if (( have == expected_bytes )); then
        echo "RELEASE_ARCHIVE_LENGTH_PASS"
        return 0
      fi
      if (( have > expected_bytes )); then
        echo "RELEASE_ARCHIVE_OVERSIZE_RESETTING" >&2
        rm -f "$dest"
      else
        echo "RELEASE_ARCHIVE_PARTIAL_BYTES=$have/$expected_bytes; resume next attempt" >&2
      fi
    elif (( rc == 33 )); then
      echo "SERVER_RANGE_RESUME_UNSUPPORTED; restarting this asset from byte zero" >&2
      rm -f "$dest"
    else
      echo "RELEASE_DOWNLOAD_RETRY $attempt/40 curl_exit=$rc" >&2
    fi
    sleep 5
  done
  echo "RELEASE_DOWNLOAD_FAILED_AFTER_40_ATTEMPTS" >&2
  return 1
}

echo "STEP 1: DOWNLOAD AND VERIFY IMMUTABLE UPGRADE SCRIPTS"
download_small_pinned "$RAW/scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261109.sh" "$UPGRADE" "$UPGRADE_BLOB_SHA"
download_small_pinned "$RAW/scripts/ops/cn-payment-activate-3194-20261109.sh" "$PAYMENT" "$PAYMENT_BLOB_SHA"
bash -n "$UPGRADE"
bash -n "$PAYMENT"
echo "UPGRADE_AND_PAYMENT_SCRIPT_SYNTAX_PASS"

echo "STEP 2: VERIFY LIVE 3193 BASELINE BEFORE LARGE DOWNLOAD"
bash "$UPGRADE" --plan "$TAG"

echo "STEP 3: DOWNLOAD EXACT 454MB RELEASE WITH RESUMABLE RETRIES"
download_release_resumable "$RELEASE/$FILE" "$ARCHIVE" "$ARCHIVE_BYTES"

# The checksum is pinned above and written locally, avoiding a second network dependency.
printf '%s  %s\n' "$ARCHIVE_SHA" "$FILE" > "$WORK/$CHECK"
chmod 600 "$WORK/$CHECK"
test "$(stat -c %s "$ARCHIVE")" = "$ARCHIVE_BYTES"
(cd "$WORK" && sha256sum -c "$CHECK")
ACTUAL_SOURCE="$(tar -xOzf "$ARCHIVE" ./RELEASE_SOURCE_SHA | tr -d '\r\n')"
test "$ACTUAL_SOURCE" = "$SOURCE_SHA"
echo "EXACT_ARCHIVE_SHA256_PASS"
echo "EXACT_SOURCE_SHA_PASS"

echo "STEP 4: INSTALL AND VERIFY ISOLATED 3194"
bash "$UPGRADE" --stage-local "$TAG"
bash "$UPGRADE" --verify-stage "$TAG"

echo "STEP 5: PROMOTE 3194 WITH AUTOMATIC 3193 ROLLBACK"
bash "$UPGRADE" --promote "$TAG"

echo "STEP 6: SIGNED LIVE MERCHANT PREFLIGHT"
if bash "$PAYMENT" --audit "$TAG"; then
  echo "SIGNED_MERCHANT_PREFLIGHT_PASS"
  bash "$PAYMENT" --enable "$TAG"
else
  echo "PAYMENT_REMAINS_CLOSED_SIGNED_MERCHANT_VALIDATION_REQUIRED"
fi

echo "CN3194_RELEASE_SEQUENCE_FINISHED"
