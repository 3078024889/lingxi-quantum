#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
TAG='__TAG__'
SOURCE_SHA='__SOURCE_SHA__'
ARCHIVE_SHA='__ARCHIVE_SHA__'
ARCHIVE_BYTES='__ARCHIVE_BYTES__'
CHECK_SHA='__CHECK_SHA__'
CHECK_BYTES='__CHECK_BYTES__'
STAGE_SHA256='__STAGE_SHA256__'
STAGE_BYTES='__STAGE_BYTES__'
AUDIT_SHA256='__AUDIT_SHA256__'
AUDIT_BYTES='__AUDIT_BYTES__'
ARCHIVE_URL='__ARCHIVE_URL__'
CHECK_URL='__CHECK_URL__'
STAGE_URL='__STAGE_URL__'
AUDIT_URL='__AUDIT_URL__'
BASE='/opt/lingxifield/cn-staged-releases'
DIR="$BASE/.download-$TAG"
FILE='cn-20261117-cn3196-candidate.tar.gz'
CHECK='cn-20261117-cn3196-candidate.sha256'
STAGE="$DIR/cn3196-candidate-stage-20261116.sh"
AUDIT="$DIR/cn3195-payment-readiness-audit-20261116.sh"
mkdir -p "$DIR"
chmod 700 "$DIR"

fetch_small_exact() {
  local url="$1" dest="$2" bytes="$3" sha="$4"
  local tmp="$dest.part" got attempt
  if [[ -f "$dest" && ! -L "$dest" ]] && [[ "$(stat -c %s "$dest")" == "$bytes" ]] && [[ "$(sha256sum "$dest" | awk '{print $1}')" == "$sha" ]]; then
    echo "R2_REUSE_VERIFIED: $(basename "$dest")"
    return 0
  fi
  rm -f "$dest" "$tmp"
  for attempt in $(seq 1 8); do
    curl -4fLsS --retry 2 --retry-delay 2 --connect-timeout 25 --max-time 900 --max-filesize "$bytes" -o "$tmp" "$url" || true
    got="$(stat -c %s "$tmp" 2>/dev/null || echo 0)"
    if [[ "$got" == "$bytes" ]] && [[ "$(sha256sum "$tmp" | awk '{print $1}')" == "$sha" ]]; then
      mv -f "$tmp" "$dest"
      echo "R2_SMALL_ASSET_SHA256_PASS: $(basename "$dest")"
      return 0
    fi
    rm -f "$tmp"
    echo "R2_SMALL_ASSET_RETRY $attempt/8 $(basename "$dest") bytes=$got/$bytes" >&2
    sleep 3
  done
  echo "R2_SMALL_ASSET_OR_HASH_FAILED: $dest" >&2
  return 1
}

download_range_part() {
  local index="$1" start="$2" end="$3" expected="$4"
  local part="$DIR/archive.part.$index"
  curl -4fLsS --retry 8 --retry-delay 2 --connect-timeout 25 --max-time 1800 --range "$start-$end" -o "$part" "$ARCHIVE_URL"
  [[ "$(stat -c %s "$part")" == "$expected" ]] || { echo "R2_RANGE_PART_LENGTH_MISMATCH:$index" >&2; return 1; }
  echo "R2_RANGE_PART_PASS:$index:$expected"
}

fetch_small_exact "$CHECK_URL" "$DIR/$CHECK" "$CHECK_BYTES" "$CHECK_SHA"
fetch_small_exact "$STAGE_URL" "$STAGE" "$STAGE_BYTES" "$STAGE_SHA256"
fetch_small_exact "$AUDIT_URL" "$AUDIT" "$AUDIT_BYTES" "$AUDIT_SHA256"

echo 'R2_RANGE_SUPPORT_PROBE'
code="$(curl -4sS -o /dev/null -w '%{http_code}' --range 0-0 "$ARCHIVE_URL")"
[[ "$code" == '206' ]] || { echo "R2_RANGE_NOT_SUPPORTED:$code" >&2; exit 1; }

PART_SIZE=$(( (ARCHIVE_BYTES + 7) / 8 ))
for i in 0 1 2 3 4 5 6 7; do
  start=$(( i * PART_SIZE ))
  end=$(( start + PART_SIZE - 1 ))
  if (( end >= ARCHIVE_BYTES )); then end=$(( ARCHIVE_BYTES - 1 )); fi
  expected=$(( end - start + 1 ))
  download_range_part "$i" "$start" "$end" "$expected" &
done
failed=0
for pid in $(jobs -pr); do wait "$pid" || failed=1; done
(( failed == 0 )) || { echo 'R2_PARALLEL_RANGE_DOWNLOAD_FAILED' >&2; exit 1; }

cat "$DIR/archive.part.0" "$DIR/archive.part.1" "$DIR/archive.part.2" "$DIR/archive.part.3" "$DIR/archive.part.4" "$DIR/archive.part.5" "$DIR/archive.part.6" "$DIR/archive.part.7" > "$DIR/$FILE"
rm -f "$DIR"/archive.part.*
[[ "$(stat -c %s "$DIR/$FILE")" == "$ARCHIVE_BYTES" ]] || { echo 'CN3196_ARCHIVE_LENGTH_MISMATCH'; exit 1; }
[[ "$(sha256sum "$DIR/$FILE" | awk '{print $1}')" == "$ARCHIVE_SHA" ]] || { echo 'CN3196_ARCHIVE_SHA256_MISMATCH'; exit 1; }
(cd "$DIR" && sha256sum -c "$CHECK")
echo 'CN3196_ARCHIVE_SHA256_AND_SIZE_PASS'

tar -tzf "$DIR/$FILE" > "$DIR/archive-manifest.txt"
grep -Fxq './server.js' "$DIR/archive-manifest.txt"
grep -Fxq './RELEASE_SOURCE_SHA' "$DIR/archive-manifest.txt"
if grep -Eq '(^/|(^|/)\.\.(/|$))' "$DIR/archive-manifest.txt"; then echo 'CN3196_UNSAFE_ARCHIVE_PATH'; exit 1; fi
[[ "$(tar -xOzf "$DIR/$FILE" ./RELEASE_SOURCE_SHA | tr -d '\r\n')" == "$SOURCE_SHA" ]] || { echo 'CN3196_ARTIFACT_SOURCE_SHA_MISMATCH'; exit 1; }
chmod 600 "$DIR/$FILE" "$DIR/$CHECK" "$STAGE"
echo 'CN3196_TRANSFER_VERIFIED'
echo '===== CN3195 CURRENT PRODUCTION PAYMENT READINESS (READ ONLY) ====='
bash "$AUDIT"
echo '===== CN3196 CANDIDATE STAGING (PAYMENT GATES REMAIN CLOSED) ====='
bash "$STAGE" --plan
bash "$STAGE" --stage-local
bash "$STAGE" --verify-stage
echo 'CN3196_CANDIDATE_READY_NO_PRODUCTION_SWITCH'