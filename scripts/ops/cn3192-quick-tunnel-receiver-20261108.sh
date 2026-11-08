#!/usr/bin/env bash
# Windows D: -> ECS through one-time Quick Tunnel; read-only GETs, no secrets.
set -Eeuo pipefail
read -r -p 'Paste the https://...trycloudflare.com temporary URL: ' BASE
read -r -p 'Paste the random Code shown on Windows: ' CODE
[[ "$BASE" =~ ^https://[a-zA-Z0-9-]+\.trycloudflare\.com/?$ ]] || { echo BAD_TUNNEL_URL; exit 1; }
[[ "$CODE" =~ ^[a-zA-Z0-9_-]{20,60}$ ]] || { echo BAD_CODE; exit 1; }
BASE="${BASE%/}"
TARGET='/root/cn-20261108-admin-toolpass-standalone.tar.gz'
PARTDIR='/root/.lingxi-cn3192-8m-chunks'
SIZE=454377744
CHUNK=8388608
COUNT=$(( (SIZE+CHUNK-1)/CHUNK ))
mkdir -p "$PARTDIR"
for ((i=0;i<COUNT;i++)); do
  name="$(printf '%03d' "$i")"
  part="$PARTDIR/$name"
  expected=$(( SIZE-i*CHUNK ))
  ((expected>CHUNK)) && expected=$CHUNK
  if [[ -f "$part" && "$(stat -c %s "$part")" -eq "$expected" ]]; then echo "REUSE_SIZE_CHUNK $i/$COUNT"; continue; fi
  rm -f "$part.tmp"
  echo "TRANSFER_CHUNK $((i+1))/$COUNT expected=$expected"
  curl -fLSs --connect-timeout 20 --max-time 180 --retry 3 --retry-delay 2 \
    -o "$part.tmp" "$BASE/$CODE/part/$i"
  [[ "$(stat -c %s "$part.tmp")" -eq "$expected" ]] || { echo "CHUNK_SIZE_MISMATCH:$i"; exit 1; }
  mv "$part.tmp" "$part"
done
: > "$TARGET.part"
for ((i=0;i<COUNT;i++)); do cat "$PARTDIR/$(printf '%03d' "$i")" >> "$TARGET.part"; done
printf '%s  %s\n' '5584d80b794cd611873c9069b91d89d2a09053c1bda301ee7a285b445c9b9e48' "$TARGET.part" | sha256sum -c -
mv "$TARGET.part" "$TARGET"
curl -fLSs --connect-timeout 20 --max-time 30 --retry 2 \
  -o /root/lingxi-cn3192-local-stage-promote.sh "$BASE/$CODE/stage-script"
printf '%s  %s\n' 'e9b2ad5fe7d07e6b6217af4d201c34898049aed8b7e25b83effa842b6c5493ce' /root/lingxi-cn3192-local-stage-promote.sh | sha256sum -c -
rm -rf "$PARTDIR"
echo 'WINDOWS_D_TO_ECS_TRANSFER_VERIFIED_SHA256'
echo 'NEXT: bash /root/lingxi-cn3192-local-stage-promote.sh'
