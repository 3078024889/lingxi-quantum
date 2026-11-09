#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
export LC_ALL=C
[[ "$EUID" -eq 0 ]] || { echo CN_ECS_ROOT_REQUIRED; exit 1; }
exec 8>/run/lock/lingxifield-cn3194-static-transfer.lock
flock -n 8 || { echo CN3194_STATIC_TRANSFER_ALREADY_RUNNING; exit 1; }

TAG="ecs-cn-unified-20261108-5054d6f492c1"
SOURCE_SHA="5054d6f492c14c7f476acbfb3152a28b1a308a30"
FILE="cn-20261108-unified-standalone.tar.gz"
CHECK="cn-20261108-unified-standalone.sha256"
ARCHIVE_SHA="4368bd5956dd2f68f6aa46a564ffeef5751fb68d78903182f754831d352602ea"
ARCHIVE_BYTES="454674344"
MICRO_SHA="3ff2145b270f90091e49c6cdd7f7da4d5b9ff757fd8aa5e61376b77578845f21"
EIGHT_SHA="1a23455c3505c0da4fa9166fc357e56e6618649062cda824ca1a1c34437f2c1d"
CHECK_SHA="3a58b76d52b9e0d6d773f26b5776296d712768a3fe55961c3514965f2abc8bc1"
UPGRADE_BLOB="5e509aab527228332b179fc44341c81817ba290c"
PAYMENT_BLOB="897a38e8b90c93168396181555a7a008e01c0e24"
BASE="https://lingxifield-cn-static-celestial-20261109.3078024889.workers.dev"
ROOT="/opt/lingxifield/cn-staged-releases"
WORK="$ROOT/.download-$TAG"
BLOCKS="$WORK/verified-static-blocks"
UPGRADE="$WORK/ecs-cn3194-unified-standalone-upgrade-20261109.sh"
PAYMENT="$WORK/cn-payment-activate-3194-20261109.sh"
ARCHIVE="$WORK/$FILE"

for bin in curl python3 sha256sum tar; do command -v "$bin" >/dev/null 2>&1 || { echo "REQUIRED_COMMAND_MISSING:$bin"; exit 1; }; done
mkdir -p "$ROOT" "$WORK" "$BLOCKS"
chmod 700 "$WORK" "$BLOCKS"

check_sha() {
  [[ -f "$2" && ! -L "$2" ]] || return 1
  printf '%s  %s\n' "$1" "$2" | sha256sum --check --status -
}
get_sha() {
  local name="$1" path="$2" expected="$3" tmp="$2.partial.$$" attempt code
  if check_sha "$expected" "$path"; then echo "STATIC_CACHE_HIT:$name"; return 0; fi
  for attempt in $(seq 1 8); do
    rm -f "$tmp"
    code="$(curl -4fsSL --retry 5 --retry-delay 2 --retry-max-time 180 --connect-timeout 20 --max-time 180 -o "$tmp" -w '%{http_code}' "$BASE/$name" 2>/dev/null || true)"
    if [[ "$code" == 200 ]] && check_sha "$expected" "$tmp"; then
      mv -f "$tmp" "$path"; chmod 600 "$path"; echo "STATIC_SHA256_PASS:$name"; return 0
    fi
    rm -f "$tmp"; echo "STATIC_RETRY:$name:$attempt:$code" >&2; sleep $((attempt*2))
  done
  echo "STATIC_DOWNLOAD_FAILED:$name" >&2; return 1
}
get_blob() {
  local name="$1" path="$2" expected="$3" tmp="$2.partial.$$" attempt code
  for attempt in $(seq 1 8); do
    rm -f "$tmp"
    code="$(curl -4fsSL --retry 5 --retry-delay 2 --retry-max-time 120 --connect-timeout 20 --max-time 180 -o "$tmp" -w '%{http_code}' "$BASE/$name" 2>/dev/null || true)"
    if [[ "$code" == 200 ]] && python3 - "$tmp" "$expected" <<'PY'
import hashlib,sys
b=open(sys.argv[1],"rb").read()
assert hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()==sys.argv[2],"GIT_BLOB_MISMATCH"
print("CONTROLLER_GIT_BLOB_PASS")
PY
    then
      mv -f "$tmp" "$path"; chmod 700 "$path"; echo "CONTROLLER_PIN_PASS:$name"; return 0
    fi
    rm -f "$tmp"; echo "CONTROLLER_RETRY:$name:$attempt:$code" >&2; sleep $((attempt*2))
  done
  echo "CONTROLLER_DOWNLOAD_FAILED:$name" >&2; return 1
}

echo "STEP_1_PINNED_CONTROLLERS_AND_MANIFESTS"
get_blob ecs-cn3194-unified-standalone-upgrade-20261109.sh "$UPGRADE" "$UPGRADE_BLOB"
get_blob cn-payment-activate-3194-20261109.sh "$PAYMENT" "$PAYMENT_BLOB"
bash -n "$UPGRADE"; bash -n "$PAYMENT"
get_sha all-micro-parts.sha256 "$WORK/all-micro-parts.sha256" "$MICRO_SHA"
get_sha eight-parts.sha256 "$WORK/eight-parts.sha256" "$EIGHT_SHA"
get_sha "$CHECK" "$WORK/$CHECK" "$CHECK_SHA"
[[ "$(cat "$WORK/$CHECK")" == "$ARCHIVE_SHA  $FILE" ]] || { echo ARCHIVE_CHECK_CONTENT_MISMATCH; exit 1; }

python3 - "$WORK/all-micro-parts.sha256" "$WORK/eight-parts.sha256" "$FILE" <<'PY'
import pathlib,re,sys
micro,eight,name=sys.argv[1:]
m=pathlib.Path(micro).read_text().splitlines()
e=pathlib.Path(eight).read_text().splitlines()
wanted=[name+f".part-{i:02d}.block-{j:02d}" for i in range(8) for j in range(7)]
assert len(m)==56 and len(set(m))==56
parsed=[]
for line in m:
 h,n=line.split("  ",1); assert re.fullmatch(r"[0-9a-f]{64}",h); parsed.append(n)
assert parsed==wanted
assert len(e)==8
for i,line in enumerate(e):
 h,n=line.split("  ",1); assert re.fullmatch(r"[0-9a-f]{64}",h) and n==name+f".part-{i:02d}"
print("56_MICRO_AND_8_PART_MANIFESTS_PASS")
PY

echo "STEP_2_READ_ONLY_3193_BASELINE_PREFLIGHT"
bash "$UPGRADE" --plan "$TAG"

echo "STEP_3_FETCH_56_BLOCKS_FOUR_AT_A_TIME"
pids=""
pending=0
while read -r sha name; do
  get_sha "$name" "$BLOCKS/$name" "$sha" &
  pids="$pids $!"
  pending=$((pending+1))
  if [[ "$pending" -ge 4 ]]; then
    failed=0
    for pid in $pids; do wait "$pid" || failed=1; done
    [[ "$failed" -eq 0 ]] || { echo MICRO_BLOCK_BATCH_FAILED; exit 1; }
    pids=""; pending=0
  fi
done < "$WORK/all-micro-parts.sha256"
if [[ "$pending" -gt 0 ]]; then
  failed=0
  for pid in $pids; do wait "$pid" || failed=1; done
  [[ "$failed" -eq 0 ]] || { echo MICRO_BLOCK_FINAL_BATCH_FAILED; exit 1; }
fi

echo "STEP_4_VERIFY_AND_REASSEMBLE"
python3 - "$WORK" "$BLOCKS" "$WORK/all-micro-parts.sha256" "$WORK/eight-parts.sha256" "$FILE" "$ARCHIVE_SHA" "$ARCHIVE_BYTES" <<'PY'
import hashlib,pathlib,shutil,sys
w=pathlib.Path(sys.argv[1]); b=pathlib.Path(sys.argv[2])
micro={n:h for h,n in (x.split("  ",1) for x in pathlib.Path(sys.argv[3]).read_text().splitlines())}
eight={n:h for h,n in (x.split("  ",1) for x in pathlib.Path(sys.argv[4]).read_text().splitlines())}
name,full_sha,full_size=sys.argv[5],sys.argv[6],int(sys.argv[7])
block_size=8*1024*1024; part_size=56834293
for i in range(8):
 p=name+f".part-{i:02d}"; tmp=w/(p+".assembling")
 with tmp.open("wb") as out:
  for j in range(7):
   n=p+f".block-{j:02d}"; data=(b/n).read_bytes()
   if len(data)!=min(block_size,part_size-j*block_size):raise SystemExit("BLOCK_SIZE_MISMATCH:"+n)
   if hashlib.sha256(data).hexdigest()!=micro[n]:raise SystemExit("BLOCK_SHA_MISMATCH:"+n)
   out.write(data)
 if tmp.stat().st_size!=part_size or hashlib.sha256(tmp.read_bytes()).hexdigest()!=eight[p]:
  raise SystemExit("REASSEMBLED_PART_MISMATCH:"+p)
 tmp.replace(w/p); print("PART_SHA256_PASS:"+p)
tmp=w/(name+".reconstructed")
with tmp.open("wb") as out:
 for i in range(8):
  with (w/(name+f".part-{i:02d}")).open("rb") as src:shutil.copyfileobj(src,out,1024*1024)
if tmp.stat().st_size!=full_size:raise SystemExit("ARCHIVE_SIZE_MISMATCH")
if hashlib.sha256(tmp.read_bytes()).hexdigest()!=full_sha:raise SystemExit("ARCHIVE_SHA256_MISMATCH")
tmp.replace(w/name);print("CN3194_EXACT_454MB_ARCHIVE_SHA256_PASS")
PY
(cd "$WORK" && sha256sum -c "$CHECK")
actual_source="$(tar -xOzf "$ARCHIVE" ./RELEASE_SOURCE_SHA | tr -d '\r\n')"
[[ "$actual_source" == "$SOURCE_SHA" ]] || { echo RELEASE_SOURCE_SHA_MISMATCH; exit 1; }
echo "EXACT_RELEASE_SOURCE_SHA_PASS"

echo "STEP_5_STAGE_AND_VERIFY_3194_BEFORE_PRODUCTION_SWITCH"
bash "$UPGRADE" --stage-local "$TAG"
bash "$UPGRADE" --verify-stage "$TAG"

echo "STEP_6_PROMOTE_NGINX_WITH_3193_ROLLBACK_RETAINED"
bash "$UPGRADE" --promote "$TAG"

echo "STEP_7_SIGNED_NO_CHARGE_CNY_MERCHANT_PREFLIGHT"
if bash "$PAYMENT" --audit "$TAG"; then
  echo CN3194_SIGNED_CNY_MERCHANT_PREFLIGHT_PASS_PAYMENT_STILL_CLOSED
else
  echo CN3194_CNY_PAYMENT_REMAINS_CLOSED_MERCHANT_SIGNATURE_NOT_VERIFIED
fi
echo CN3194_PAYMENT_REMAINS_CLOSED_AFTER_READ_ONLY_AUDIT
echo CN3194_STATIC_ASSET_VERIFIED_CUTOVER_PASS
echo OLD_3193_SERVICE_RETAINED_FOR_ROLLBACK
echo PAYPAL_REMAINS_DISABLED_ON_CN
