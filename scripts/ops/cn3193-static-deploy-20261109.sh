#!/usr/bin/env bash
# SHA-pinned Cloudflare Static Assets -> Alibaba ECS 3193, no GitHub runtime fetch.
# Existing ECS release gates retain rollback; no merchant secrets are logged.
set -Eeuo pipefail
umask 077
export LC_ALL=C
[[ "$EUID" -eq 0 ]] || { echo 'CN_ECS_ROOT_REQUIRED';exit 1; }
exec 8>/run/lock/lingxifield-cn-static-transfer.lock
flock -n 8 || { echo 'CN_STATIC_TRANSFER_ALREADY_RUNNING';exit 1; }
TAG=ecs-cn-unified-20261108-5308e015b06b
SOURCE=5308e015b06bc6d6720450bf41280aa606fec0f3
FILE=cn-20261108-unified-standalone.tar.gz
CHECK=cn-20261108-unified-standalone.sha256
DEPLOY_NAME=ecs-cn3193-unified-standalone-stage-20261108.sh
BASE=https://lingxifield-cn-static-release-5308e015-20261109.3078024889.workers.dev
DIR="/opt/lingxifield/cn-staged-releases/.download-$TAG"
BLOCKS="$DIR/verified-static-blocks"
DEPLOY=/root/lingxifield-cn3193-release.sh
FULL_SHA=a76120af69d599bd4a02b679eaedf3ca3c96ecc63abba0ea85f54ce98bc222b3
mkdir -p "$BLOCKS"
chmod 700 "$DIR" "$BLOCKS"
check(){
  local sha="$1" path="$2"
  [[ -f "$path" && ! -L "$path" ]] && printf '%s  %s\n' "$sha" "$path" | sha256sum -c --status -
}
get(){
  local name="$1" path="$2" sha="$3" attempt code tmp="$2.partial.$$"
  if check "$sha" "$path";then echo "CN_STATIC_REUSE $name";return 0;fi
  for attempt in 1 2 3 4 5 6 7 8;do
    rm -f "$tmp"
    code="$(curl -4fsSL --retry 5 --retry-max-time 200 --connect-timeout 15 --max-time 150 -o "$tmp" -w '%{http_code}' "$BASE/$name" 2>/dev/null || true)"
    if [[ "$code" = 200 ]] && check "$sha" "$tmp";then
      mv -f "$tmp" "$path"
      echo "CN_STATIC_SHA256_PASS $name"
      return 0
    fi
    echo "CN_STATIC_RETRY part=$name attempt=$attempt http=${code:-0}"
    sleep $((attempt * 2))
  done
  echo "CN_STATIC_RETRY_EXHAUSTED $name" >&2
  return 1
}
get eight-parts.sha256 "$DIR/eight-parts.sha256" aa852ca0888b5d427557306d109d9136bc9299f501da340d22211110a9177d23
get all-micro-parts.sha256 "$DIR/all-micro-parts.sha256" 4462ae8bb979d5436aa2fd9955815e75d0880d33e37ccab17e1396788359e834
get "$CHECK" "$DIR/$CHECK" b779e13ca3ba10eaefb71d05a9d66c6c33c7cf45eae9867ad1c5ea61bafa566f
get "$DEPLOY_NAME" "$DEPLOY" f19f63ca022f2644de9f74bd0f4bc287f597d8fc243d943a941d0f3e66744e13
python3 - "$DEPLOY" "$DIR/all-micro-parts.sha256" <<'PY'
import sys,re,hashlib,pathlib
f=pathlib.Path(sys.argv[1]).read_bytes()
blob=hashlib.sha1(b"blob "+str(len(f)).encode()+b"\0"+f).hexdigest()
if blob!="5950978bed667dc4d52c66de2d29065313f79c44":raise SystemExit("CN_DEPLOY_SCRIPT_SOURCE_BLOB_MISMATCH")
m=pathlib.Path(sys.argv[2]).read_text().splitlines()
expected=re.compile(r"^[0-9a-f]{64}  cn-20261108-unified-standalone\.tar\.gz\.part-0[0-7]\.block-0[0-6]$")
if len(m)!=56 or len(set(m))!=56 or not all(expected.fullmatch(x) for x in m):
 raise SystemExit("CN_MICRO_MANIFEST_INVALID")
print("CN_DEPLOY_SCRIPT_BLOB_AND_ALL_56_BLOCK_NAMES_PASS")
PY
bash -n "$DEPLOY"
bash "$DEPLOY" --plan "$TAG"
pids=()
failed=0
while read -r sha name;do
  get "$name" "$BLOCKS/$name" "$sha" &
  pids+=("$!")
  if (( ${#pids[@]}>=4 ));then
    for pid in "${pids[@]}";do wait "$pid" || failed=1;done
    pids=()
    ((failed==0)) || break
  fi
done < "$DIR/all-micro-parts.sha256"
for pid in "${pids[@]}";do wait "$pid" || failed=1;done
((failed==0)) || { echo CN_STATIC_PART_DOWNLOAD_FAILED_KEEP_CACHE;exit 1; }
for i in 0 1 2 3 4 5 6 7;do
  printf -v n '%02d' "$i"
  part="$FILE.part-$n"
  sha="$(awk -v n="$part" '$2==n{print $1}' "$DIR/eight-parts.sha256")"
  [[ "$sha" =~ ^[0-9a-f]{64}$ ]] || { echo CN_EIGHT_MANIFEST_INVALID;exit 1; }
  if check "$sha" "$DIR/$part";then continue;fi
  tmp="$DIR/$part.new.$$"
  : > "$tmp"
  for b in 0 1 2 3 4 5 6;do
    printf -v m '%02d' "$b"
    cat "$BLOCKS/$part.block-$m" >> "$tmp"
  done
  check "$sha" "$tmp" || { echo "CN_RECONSTRUCTED_PART_HASH_FAILED $part";exit 1; }
  mv -f "$tmp" "$DIR/$part"
  echo "CN_STATIC_57MB_PART_VERIFIED $part"
done
if ! check "$FULL_SHA" "$DIR/$FILE";then
  tmp="$DIR/$FILE.reconstructed.$$"
  : > "$tmp"
  for i in 0 1 2 3 4 5 6 7;do
    printf -v n '%02d' "$i"
    cat "$DIR/$FILE.part-$n" >> "$tmp"
  done
  [[ "$(stat -c '%s' "$tmp")" = 454655321 ]] || { echo CN_ARCHIVE_BYTES_WRONG;exit 1; }
  check "$FULL_SHA" "$tmp" || { echo CN_ARCHIVE_SHA256_WRONG;exit 1; }
  mv -f "$tmp" "$DIR/$FILE"
fi
(cd "$DIR" && sha256sum -c "$CHECK")
echo CN_455MB_IMMUTABLE_ARCHIVE_SHA256_PASS
bash "$DEPLOY" --stage-local "$TAG"
bash "$DEPLOY" --verify-stage "$TAG"
ACTIVATOR="/opt/lingxifield/cn-staged-releases/$SOURCE/cn-payment-activate.sh"
[[ -f "$ACTIVATOR" && ! -L "$ACTIVATOR" ]] || { echo CN_PAYMENT_ACTIVATOR_MISSING;exit 1; }
bash -n "$ACTIVATOR"
signed=0
if bash "$ACTIVATOR" --audit "$TAG";then signed=1;fi
bash "$DEPLOY" --promote "$TAG"
echo CN3193_STATIC_ASSET_VERIFIED_CUTOVER_PASS
if [[ "$signed" = 1 ]];then
  bash "$ACTIVATOR" --enable "$TAG"
  echo CN_CNY_PAYMENT_SIGNED_LIVE_ACTIVATION_PASS
else
  echo CN_CNY_PAYMENT_STAYS_OFF_MERCHANT_IDENTITY_NOT_VERIFIED
fi