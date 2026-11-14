param()
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Exact, CI-built CN3194 candidate. This script only uploads to R2 and stages 3195.
$Tag = 'ecs-cn-unified-20261110-f07d7a7bb7b7'
$SourceSha = 'f07d7a7bb7b79adc0664217044404a75c578aa25'
$Short = 'f07d7a7bb7b7'

$Config = 'D:\LINGXIFIELDCN3192\rclone.conf'
$Root = 'D:\30780\lingxi-quantum'
$RemoteBase = 'cn3192r2:lingxi-cn3192-transfer/cn3195'
$ReleaseBase = "https://github.com/3078024889/lingxi-quantum/releases/download/$Tag"

$Expected = @{
    'cn3194-release-manifest.env' = @{ Bytes = 621; Sha = '027ddcd3c3e011bdf7054e4fa9ecd0f319817e9ba518f07114eb70f7b7cbc732' }
    'cn-20261110-unified-standalone.tar.gz' = @{ Bytes = 337502592; Sha = '5815baa7fdd220c2d9fe0f966f8b1a189d74a3131a8954ae8f9d9c4e280cd9bd' }
    'cn-20261110-unified-standalone.sha256' = @{ Bytes = 104; Sha = 'c0036e19d54b20a9397963b811c9e668e41a8a1f4bd7abeca0b8bd9eacd03ea6' }
    'ecs-cn3194-unified-standalone-upgrade-20261110.sh' = @{ Bytes = 26803; Sha = 'ecc567284d169dee32d74e46b2952839044b9a3a47239ce6b24947e992e290f7' }
    'cn-payment-activate-3194-20261110.sh' = @{ Bytes = 12147; Sha = '64762dd7378083f55926a912502d99a8c28da71d3494c2e7ea327c9e8fd29172' }
}

if (!(Test-Path -LiteralPath $Config -PathType Leaf)) { throw "R2_CONFIG_NOT_FOUND: $Config" }
if (!(Select-String -LiteralPath $Config -Pattern '^\s*\[cn3192r2\]\s*$' -Quiet)) { throw 'R2_REMOTE_SECTION_MISSING' }
$env:RCLONE_CONFIG = $Config

$RcloneCommand = Get-Command rclone -ErrorAction SilentlyContinue
if ($RcloneCommand) {
    $Rclone = $RcloneCommand.Source
} else {
    $Rclone = @(
        'D:\LINGXIFIELD\rclone\rclone.exe',
        'D:\LINGXIFIELD\rclone.exe',
        'D:\rclone\rclone.exe'
    ) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
}
if (!$Rclone) { throw 'RCLONE_NOT_FOUND' }

New-Item -ItemType Directory -Force -Path $Root | Out-Null

function Get-Sha256([string]$Path) {
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}
function Get-GitBlobSha1([string]$Path) {
    $bytes = [IO.File]::ReadAllBytes($Path)
    $prefix = [Text.Encoding]::ASCII.GetBytes("blob $($bytes.Length)")
    $all = New-Object byte[] ($prefix.Length + 1 + $bytes.Length)
    [Array]::Copy($prefix, 0, $all, 0, $prefix.Length)
    $all[$prefix.Length] = 0
    [Array]::Copy($bytes, 0, $all, $prefix.Length + 1, $bytes.Length)
    $sha = [Security.Cryptography.SHA1]::Create()
    try {
        return ([BitConverter]::ToString($sha.ComputeHash($all))).Replace('-', '').ToLowerInvariant()
    } finally {
        $sha.Dispose()
    }
}
function Download-Asset([string]$Name, [string]$Path, [Int64]$Bytes, [string]$Sha, [string]$Url) {
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $item = Get-Item -LiteralPath $Path
        if ($item.Length -eq $Bytes -and (Get-Sha256 $Path) -ceq $Sha) {
            Write-Host "LOCAL_ASSET_REUSE_VERIFIED: $Name"
            return
        }
        Write-Host "LOCAL_ASSET_CACHE_REJECTED: $Name"
    }
    $tmp = "$Path.downloading"
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    Write-Host "DOWNLOAD_EXACT_GITHUB_RELEASE_ASSET: $Name ($Bytes bytes)"
    & curl.exe --fail --location --retry 8 --retry-delay 4 --connect-timeout 25 --max-time 3600 --output $tmp $Url
    if ($LASTEXITCODE -ne 0) { throw "RELEASE_ASSET_DOWNLOAD_FAILED: $Name" }
    if (!(Test-Path -LiteralPath $tmp -PathType Leaf)) { throw "RELEASE_ASSET_MISSING_AFTER_DOWNLOAD: $Name" }
    if ((Get-Item -LiteralPath $tmp).Length -ne $Bytes) { throw "RELEASE_ASSET_LENGTH_MISMATCH: $Name" }
    if ((Get-Sha256 $tmp) -cne $Sha) { throw "RELEASE_ASSET_SHA256_MISMATCH: $Name" }
    Move-Item -LiteralPath $tmp -Destination $Path -Force
    Write-Host "GITHUB_ASSET_SHA256_PASS: $Name"
}

Write-Host 'STEP 1/5: VERIFY EXACT RELEASE ASSETS WITHOUT GITHUB REST API'
Write-Host 'NO_GITHUB_API_CALL_NO_RATE_LIMIT_DEPENDENCY'
Write-Host 'GITHUB_API_NOT_USED: no unauthenticated API quota is required'
# The exact tag, source SHA, asset names, byte lengths and SHA256 values are
# pinned in this script from the successful CI release build. Download URLs
# are constructed only from the immutable tag and allow-listed asset names.
$AssetUrls = @{}
foreach ($name in $Expected.Keys) {
    $AssetUrls[$name] = "$ReleaseBase/$([uri]::EscapeDataString($name))"
}
Write-Host "EXACT_TAG_PIN_PASS: $Tag"
Write-Host "SOURCE_SHA_PIN_PASS: $SourceSha"
Write-Host 'ASSET_LENGTH_AND_SHA256_PINS_LOADED: 5'

foreach ($name in $Expected.Keys) {
    $path = Join-Path $Root $name
    Download-Asset $name $path ([Int64]$Expected[$name].Bytes) ([string]$Expected[$name].Sha) ([string]$AssetUrls[$name])
}

Write-Host 'STEP 2/5: VERIFY RELEASE MANIFEST, CHECKSUM FILE AND GIT SCRIPT BLOBS'
$ManifestPath = Join-Path $Root 'cn3194-release-manifest.env'
$Manifest = @{}
foreach ($line in Get-Content -LiteralPath $ManifestPath) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line -notmatch '^([A-Z][A-Z0-9_]*)=(.*)$') { throw 'RELEASE_MANIFEST_LINE_INVALID' }
    $key = $Matches[1]
    if ($Manifest.ContainsKey($key)) { throw "RELEASE_MANIFEST_DUPLICATE_KEY: $key" }
    $Manifest[$key] = $Matches[2]
}
if ($Manifest.Count -ne 12) { throw 'RELEASE_MANIFEST_FIELD_COUNT_INVALID' }
if ($Manifest.TAG -cne $Tag -or $Manifest.SHORT -cne $Short -or $Manifest.SOURCE_SHA -cne $SourceSha) {
    throw 'RELEASE_MANIFEST_IDENTITY_MISMATCH'
}
if ($Manifest.ARCHIVE_FILE -cne 'cn-20261110-unified-standalone.tar.gz' -or
    $Manifest.CHECK_FILE -cne 'cn-20261110-unified-standalone.sha256' -or
    $Manifest.STAGE_FILE -cne 'ecs-cn3194-unified-standalone-upgrade-20261110.sh' -or
    $Manifest.PAYMENT_FILE -cne 'cn-payment-activate-3194-20261110.sh') {
    throw 'RELEASE_MANIFEST_ASSET_NAMES_MISMATCH'
}
if ([Int64]$Manifest.ARCHIVE_BYTES -ne 337502592 -or
    $Manifest.ARCHIVE_SHA256 -cne $Expected['cn-20261110-unified-standalone.tar.gz'].Sha -or
    $Manifest.CHECK_SHA256 -cne $Expected['cn-20261110-unified-standalone.sha256'].Sha) {
    throw 'RELEASE_MANIFEST_ARCHIVE_DIGEST_MISMATCH'
}
$CheckPath = Join-Path $Root $Manifest.CHECK_FILE
if ((Get-Content -LiteralPath $CheckPath -Raw).Trim() -cne "$($Manifest.ARCHIVE_SHA256)  $($Manifest.ARCHIVE_FILE)") {
    throw 'CHECKSUM_FILE_CONTENT_MISMATCH'
}
$StagePath = Join-Path $Root $Manifest.STAGE_FILE
$PaymentPath = Join-Path $Root $Manifest.PAYMENT_FILE
if ((Get-GitBlobSha1 $StagePath) -cne $Manifest.STAGE_BLOB_SHA1) { throw 'STAGE_GIT_BLOB_SHA1_MISMATCH' }
if ((Get-GitBlobSha1 $PaymentPath) -cne $Manifest.PAYMENT_BLOB_SHA1) { throw 'PAYMENT_GIT_BLOB_SHA1_MISMATCH' }
Write-Host 'MANIFEST_CHECKSUM_AND_SCRIPT_BLOB_PASS'

Write-Host 'STEP 3/5: UPLOAD EXACT RELEASE ASSETS TO PRIVATE R2 USING 8-WAY S3 MULTIPART'
& $Rclone lsd 'cn3192r2:lingxi-cn3192-transfer' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'R2_REMOTE_NOT_ACCESSIBLE' }
$RemoteRoot = "$RemoteBase/$Short"
& $Rclone mkdir $RemoteRoot
if ($LASTEXITCODE -ne 0) { throw 'R2_RELEASE_PREFIX_CREATE_FAILED' }

function Get-R2ObjectList {
    $raw = & $Rclone lsjson $RemoteRoot --files-only --no-modtime --no-mimetype
    if ($LASTEXITCODE -ne 0) { throw 'R2_REMOTE_LIST_FAILED' }
    $json = [string]::Join([Environment]::NewLine, [string[]]@($raw))
    if ([string]::IsNullOrWhiteSpace($json)) { return ,@() }
    return ,@((ConvertFrom-Json -InputObject $json -ErrorAction Stop))
}
$Uploads = @(
    @{ Local = (Join-Path $Root 'cn-20261110-unified-standalone.tar.gz'); Name = 'cn-20261110-unified-standalone.tar.gz'; Size = [Int64]337502592 },
    @{ Local = (Join-Path $Root 'cn-20261110-unified-standalone.sha256'); Name = 'cn-20261110-unified-standalone.sha256'; Size = [Int64]104 },
    @{ Local = $StagePath; Name = [string]$Manifest.STAGE_FILE; Size = [Int64]26803 },
    @{ Local = $PaymentPath; Name = [string]$Manifest.PAYMENT_FILE; Size = [Int64]12147 },
    @{ Local = $ManifestPath; Name = 'cn3194-release-manifest.env'; Size = [Int64]621 }
)
$Remote = Get-R2ObjectList
if (@($Remote).Count -gt 5) { throw 'R2_PREFIX_CONTAINS_UNEXPECTED_OBJECTS' }
foreach ($u in $Uploads) {
    $existing = @($Remote | Where-Object { [string]$_.Name -ceq [string]$u.Name })
    if ($existing.Count -gt 0) {
        if ([Int64]$existing[0].Size -ne [Int64]$u.Size) { throw "R2_EXISTING_OBJECT_SIZE_MISMATCH: $($u.Name)" }
        Write-Host "R2_OBJECT_ALREADY_PRESENT_SIZE_MATCH: $($u.Name)"
        continue
    }
    Write-Host "R2_MULTIPART_UPLOAD_8WAY: $($u.Name)"
    & $Rclone copyto $u.Local "$RemoteRoot/$($u.Name)" `
        --s3-upload-cutoff 32Mi `
        --s3-chunk-size 16Mi `
        --s3-upload-concurrency 8 `
        --transfers 8 `
        --checkers 8 `
        --s3-no-check-bucket `
        --retries 8 `
        --low-level-retries 8 `
        --stats 5s `
        --stats-one-line
    if ($LASTEXITCODE -ne 0) { throw "R2_MULTIPART_UPLOAD_FAILED: $($u.Name)" }
}
$Remote = Get-R2ObjectList
if (@($Remote).Count -ne 5) { throw 'R2_OBJECT_COUNT_NOT_EXACTLY_FIVE' }
foreach ($u in $Uploads) {
    $found = @($Remote | Where-Object { [string]$_.Name -ceq [string]$u.Name })
    if ($found.Count -ne 1 -or [Int64]$found[0].Size -ne [Int64]$u.Size) {
        throw "R2_REMOTE_SIZE_VERIFY_FAILED: $($u.Name)"
    }
    Write-Host "R2_REMOTE_SIZE_PASS: $($u.Name) $($u.Size)"
}
Write-Host 'R2_CONTENT_CHECK_DOWNLOAD_VERIFY_START'
& $Rclone check $Root $RemoteRoot --one-way --download --include 'cn-20261110-unified-standalone.tar.gz' --include 'cn-20261110-unified-standalone.sha256' --include 'ecs-cn3194-unified-standalone-upgrade-20261110.sh' --include 'cn-payment-activate-3194-20261110.sh' --include 'cn3194-release-manifest.env'
if ($LASTEXITCODE -ne 0) { throw 'R2_REMOTE_CONTENT_CHECK_FAILED' }
Write-Host 'R2_REMOTE_CONTENT_SHA256_COMPARE_PASS'

Write-Host 'STEP 4/5: CREATE SIX-HOUR PRIVATE R2 SIGNED LINKS'
function Get-SignedLink([string]$Name) {
    $out = @(& $Rclone link "$RemoteRoot/$Name" --expire 6h 2>&1)
    if ($LASTEXITCODE -ne 0) { throw "R2_SIGNED_LINK_FAILED: $Name" }
    $url = ([string]($out | Select-Object -Last 1)).Trim()
    if ($url -notmatch '^https://' -or $url.Contains("'") -or $url.Contains([string][char]10) -or $url.Contains([string][char]13)) {
        throw "R2_SIGNED_LINK_INVALID: $Name"
    }
    return $url
}
$ArchiveUrl = Get-SignedLink 'cn-20261110-unified-standalone.tar.gz'
$CheckUrl = Get-SignedLink 'cn-20261110-unified-standalone.sha256'
$StageUrl = Get-SignedLink ([string]$Manifest.STAGE_FILE)
$PaymentUrl = Get-SignedLink ([string]$Manifest.PAYMENT_FILE)

Write-Host 'STEP 5/5: GENERATE ECS 8-PART RANGE DOWNLOAD + 3195 STAGE SCRIPT'
$Ecs = @'
#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
TAG='__TAG__'
SOURCE_SHA='__SOURCE_SHA__'
ARCHIVE_SHA='__ARCHIVE_SHA__'
ARCHIVE_BYTES='__ARCHIVE_BYTES__'
CHECK_SHA='__CHECK_SHA__'
STAGE_SHA256='__STAGE_SHA256__'
STAGE_BYTES='__STAGE_BYTES__'
PAYMENT_SHA256='__PAYMENT_SHA256__'
PAYMENT_BYTES='__PAYMENT_BYTES__'
ARCHIVE_URL='__ARCHIVE_URL__'
CHECK_URL='__CHECK_URL__'
STAGE_URL='__STAGE_URL__'
PAYMENT_URL='__PAYMENT_URL__'
BASE='/opt/lingxifield/cn-staged-releases'
DIR="$BASE/.download-$TAG"
FILE='cn-20261110-unified-standalone.tar.gz'
CHECK='cn-20261110-unified-standalone.sha256'
STAGE="$DIR/ecs-cn3194-unified-standalone-upgrade-20261110.sh"
PAYMENT="$DIR/cn-payment-activate-3194-20261110.sh"
mkdir -p "$DIR"
chmod 700 "$DIR"

fetch_small_exact() {
  local url="$1" dest="$2" bytes="$3" sha="$4" tmp="${2}.part" got attempt
  if [[ -f "$dest" && ! -L "$dest" ]] &&
     [[ "$(stat -c %s "$dest")" == "$bytes" ]] &&
     [[ "$(sha256sum "$dest" | awk '{print $1}')" == "$sha" ]]; then
    echo "R2_REUSE_VERIFIED: $(basename "$dest")"
    return 0
  fi
  rm -f "$dest" "$tmp"
  for attempt in $(seq 1 8); do
    curl -4fLsS --retry 2 --retry-delay 2 --connect-timeout 25 --max-time 900 \
      --max-filesize "$bytes" -o "$tmp" "$url" || true
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
  local idx="$1" start="$2" end="$3" expected="$4"
  local name part tmp hdr log status got range attempt curl_rc err
  name="$(printf '%02d' "$idx")"
  part="$DIR/$FILE.part$name"
  tmp="$part.tmp"
  hdr="$part.headers"
  log="$part.curl.log"
  rm -f "$part" "$tmp" "$hdr" "$log"

  for attempt in $(seq 1 7); do
    rm -f "$tmp" "$hdr" "$log"
    curl_rc=0
    status="$(curl -4sS \
      --connect-timeout 25 \
      --max-time 1800 \
      --max-filesize "$expected" \
      -H "Range: bytes=$start-$end" \
      -D "$hdr" \
      -o "$tmp" \
      -w '%{http_code}' \
      "$ARCHIVE_URL" 2>"$log")" || curl_rc=$?

    got="$(stat -c %s "$tmp" 2>/dev/null || echo 0)"
    if [[ -f "$hdr" ]]; then
      range="$(awk 'tolower($1)=="content-range:" {gsub("\r","");print $2" "$3}' "$hdr" 2>/dev/null | tail -n1 || true)"
    else
      range='NO_RESPONSE_HEADERS'
    fi

    if [[ "$curl_rc" == 0 && "$status" == 206 &&
          "$got" == "$expected" &&
          "$range" == "bytes $start-$end/$ARCHIVE_BYTES" ]]; then
      mv -f "$tmp" "$part"
      rm -f "$hdr" "$log"
      echo "R2_RANGE_PART_PASS index=$idx range=$start-$end bytes=$expected"
      return 0
    fi

    err="$(tail -n 4 "$log" 2>/dev/null || true)"
    echo "R2_RANGE_PART_RETRY index=$idx attempt=$attempt/7 curl_rc=$curl_rc http=$status bytes=$got/$expected range=$range" >&2
    if [[ -n "$err" ]]; then
      printf '%s\n' "$err" >&2
    fi

    # A 403 means the presigned URL is expired/invalid; repeating the same
    # signed URL cannot repair it. Stop with a precise reason.
    if [[ "$status" == 403 ]]; then
      echo 'R2_SIGNED_URL_REJECTED_REFRESH_SIGNED_URL' >&2
      return 1
    fi
    if [[ "$status" == 416 ]]; then
      echo 'R2_RANGE_NOT_SATISFIABLE_CHECK_OBJECT_SIZE_AND_RANGE' >&2
      return 1
    fi

    rm -f "$tmp"
    sleep 3
  done

  echo "R2_RANGE_PART_FAILED index=$idx range=$start-$end curl_rc=$curl_rc http=$status" >&2
  return 1
}

echo 'STEP 1/7: FETCH SMALL SIGNED ASSETS WITH EXACT HASHES'
fetch_small_exact "$CHECK_URL" "$DIR/$CHECK" 104 "$CHECK_SHA"
fetch_small_exact "$STAGE_URL" "$STAGE" "$STAGE_BYTES" "$STAGE_SHA256"
fetch_small_exact "$PAYMENT_URL" "$PAYMENT" "$PAYMENT_BYTES" "$PAYMENT_SHA256"
# The checksum manifest is verified now; the large archive is intentionally
# downloaded later through eight HTTP Range requests.
grep -Fxq "$ARCHIVE_SHA  $FILE" "$DIR/$CHECK"
test "$(sha256sum "$DIR/$CHECK" | awk '{print $1}')" = "$CHECK_SHA"
echo 'ARCHIVE_CHECKSUM_MANIFEST_VERIFIED_ARCHIVE_DOWNLOAD_PENDING'

echo 'CURL_RUNTIME:'
curl --version | head -n 1
echo 'STEP 2/7: PROBE R2 HTTP RANGE SUPPORT BEFORE LARGE TRANSFER'
PROBE_HDR="$DIR/range-probe.headers"
PROBE_BODY="$DIR/range-probe.body"
PROBE_LOG="$DIR/range-probe.log"
PROBE_STATUS="$(curl -4sS --connect-timeout 20 --max-time 60 --max-filesize 2 \
  -H 'Range: bytes=0-0' -D "$PROBE_HDR" -o "$PROBE_BODY" -w '%{http_code}' \
  "$ARCHIVE_URL" 2>"$PROBE_LOG" || true)"
if [[ -f "$PROBE_HDR" ]]; then
  PROBE_RANGE="$(awk 'tolower($1)=="content-range:" {gsub("\r","");print $2" "$3}' "$PROBE_HDR" 2>/dev/null | tail -n1 || true)"
else
  PROBE_RANGE='NO_RESPONSE_HEADERS'
fi
PROBE_SIZE="$(stat -c %s "$PROBE_BODY" 2>/dev/null || echo 0)"
if [[ "$PROBE_STATUS" != 206 || "$PROBE_RANGE" != "bytes 0-0/$ARCHIVE_BYTES" || "$PROBE_SIZE" != 1 ]]; then
  echo "R2_RANGE_UNSUPPORTED_OR_INVALID status=$PROBE_STATUS range=$PROBE_RANGE bytes=$PROBE_SIZE"
  [[ ! -f "$PROBE_LOG" ]] || cat "$PROBE_LOG" >&2
  echo 'STOPPED_BEFORE_ARCHIVE_DOWNLOAD_NO_PRODUCTION_CHANGE'
  exit 1
fi
rm -f "$PROBE_HDR" "$PROBE_BODY" "$PROBE_LOG"
echo 'R2_RANGE_SUPPORT_PASS'

echo 'STEP 3/7: DOWNLOAD ARCHIVE IN EIGHT PARALLEL BYTE-RANGE SLICES'
# Remove the old single-stream .part file left by the interrupted transfer.
rm -f "$DIR/$FILE.part"
test "$(df -PB1 "$BASE" | awk 'END{print $4}')" -gt 2500000000 || { echo CN3195_INSUFFICIENT_FREE_DISK; exit 1; }
CHUNK=$(((ARCHIVE_BYTES + 7) / 8))
for round in 1 2; do
  echo "R2_EIGHT_PART_ROUND=$round"
  rm -f "$DIR/$FILE.part"[0-9][0-9] "$DIR/$FILE.assembled.part"
  declare -a PIDS=()
  for idx in 0 1 2 3 4 5 6 7; do
    start=$((idx * CHUNK))
    end=$((start + CHUNK - 1))
    (( end >= ARCHIVE_BYTES )) && end=$((ARCHIVE_BYTES - 1))
    expected=$((end - start + 1))
    download_range_part "$idx" "$start" "$end" "$expected" &
    PIDS+=("$!")
  done
  failed=0
  for pid in "${PIDS[@]}"; do
    if ! wait "$pid"; then failed=1; fi
  done
  if [[ "$failed" != 0 ]]; then
    echo "R2_EIGHT_PART_DOWNLOAD_FAILED_ROUND=$round"
    [[ "$round" == 1 ]] || exit 1
    continue
  fi
  : > "$DIR/$FILE.assembled.part"
  for idx in 0 1 2 3 4 5 6 7; do
    name="$(printf '%02d' "$idx")"
    cat "$DIR/$FILE.part$name" >> "$DIR/$FILE.assembled.part"
  done
  got="$(stat -c %s "$DIR/$FILE.assembled.part")"
  sha="$(sha256sum "$DIR/$FILE.assembled.part" | awk '{print $1}')"
  if [[ "$got" == "$ARCHIVE_BYTES" && "$sha" == "$ARCHIVE_SHA" ]]; then
    mv -f "$DIR/$FILE.assembled.part" "$DIR/$FILE"
    rm -f "$DIR/$FILE.part"[0-9][0-9]
    echo "R2_EIGHT_PART_MERGE_SHA256_PASS bytes=$got"
    break
  fi
  echo "R2_EIGHT_PART_MERGE_MISMATCH round=$round bytes=$got sha=$sha" >&2
  rm -f "$DIR/$FILE.assembled.part"
  [[ "$round" == 1 ]] || exit 1
done
[[ -f "$DIR/$FILE" ]] || { echo CN3195_ARCHIVE_NOT_ASSEMBLED; exit 1; }
[[ "$(stat -c %s "$DIR/$FILE")" == "$ARCHIVE_BYTES" ]]
[[ "$(sha256sum "$DIR/$FILE" | awk '{print $1}')" == "$ARCHIVE_SHA" ]]
(cd "$DIR" && sha256sum -c "$CHECK")
echo 'CN3194_EXACT_ARCHIVE_SHA256_PASS'

echo 'STEP 4/7: VERIFY SOURCE SHA AND ARCHIVE PATH SAFETY'
test "$(tar -xOzf "$DIR/$FILE" ./RELEASE_SOURCE_SHA | tr -d '\r\n')" = "$SOURCE_SHA"
tar -tzf "$DIR/$FILE" > "$DIR/archive.manifest"
grep -Fxq './server.js' "$DIR/archive.manifest"
grep -Fxq './RELEASE_SOURCE_SHA' "$DIR/archive.manifest"
grep -Fxq './cn-payment-signed-live-probe.mjs' "$DIR/archive.manifest"
if grep -Eq '(^/|(^|/)\.\.(/|$))' "$DIR/archive.manifest"; then
  echo CN3195_UNSAFE_ARCHIVE_PATH_BLOCKED
  exit 1
fi
bash -n "$STAGE"
bash -n "$PAYMENT"
echo 'CN3194_EXACT_ARCHIVE_AND_SCRIPT_HASHES_PASS'

echo 'STEP 5/7: READ-ONLY PLAN — CURRENT NGINX UPSTREAM REMAINS ACTIVE'
bash "$STAGE" --plan "$TAG"
echo 'STEP 6/7: STAGE EXACT RELEASE ON ISOLATED PORT 3195'
bash "$STAGE" --stage-local "$TAG"
echo 'STEP 7/7: VERIFY 3195 ROUTES AND AUTH BOUNDARIES'
bash "$STAGE" --verify-stage "$TAG"
SELLER_3195="$(curl --noproxy '*' -fLsS --connect-timeout 5 --max-time 25 -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' http://127.0.0.1:3195/sasi/seller)"
grep -Fq '卖家工作台' <<<"$SELLER_3195"
grep -Fq '发布新软件' <<<"$SELLER_3195"
echo 'CN3195_SELLER_WORKSPACE_CONTENT_PASS'
echo "CN3195_STAGING_PASS SOURCE_SHA=$SOURCE_SHA"
echo 'CN3195_ACTIVE_NGINX_UPSTREAM_UNCHANGED'
echo 'CN3194_PRODUCTION_PROMOTION_NOT_EXECUTED'
echo 'CN3193_ROLLBACK_BASELINE_RETAINED'
'@

$Map = @{
    '__TAG__' = $Tag
    '__SOURCE_SHA__' = $SourceSha
    '__ARCHIVE_SHA__' = [string]$Manifest.ARCHIVE_SHA256
    '__ARCHIVE_BYTES__' = [string]$Manifest.ARCHIVE_BYTES
    '__CHECK_SHA__' = [string]$Manifest.CHECK_SHA256
    '__STAGE_SHA256__' = [string]$Expected['ecs-cn3194-unified-standalone-upgrade-20261110.sh'].Sha
    '__STAGE_BYTES__' = [string]$Expected['ecs-cn3194-unified-standalone-upgrade-20261110.sh'].Bytes
    '__PAYMENT_SHA256__' = [string]$Expected['cn-payment-activate-3194-20261110.sh'].Sha
    '__PAYMENT_BYTES__' = [string]$Expected['cn-payment-activate-3194-20261110.sh'].Bytes
    '__ARCHIVE_URL__' = $ArchiveUrl
    '__CHECK_URL__' = $CheckUrl
    '__STAGE_URL__' = $StageUrl
    '__PAYMENT_URL__' = $PaymentUrl
}
foreach ($key in $Map.Keys) { $Ecs = $Ecs.Replace($key, [string]$Map[$key]) }
if ($Ecs -match '__[A-Z0-9_]+__') { throw 'UNRESOLVED_ECS_SCRIPT_PLACEHOLDER' }
$EcsPath = Join-Path $Root "PASTE-IN-ALIYUN-CN3195-STAGE-$Short.sh"
[IO.File]::WriteAllText($EcsPath, $Ecs, (New-Object Text.UTF8Encoding($false)))

$Promote = @'
#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
TAG='__TAG__'
SHORT='__SHORT__'
SOURCE_SHA='__SOURCE_SHA__'
STAGE_SHA256='__STAGE_SHA256__'
PAYMENT_SHA256='__PAYMENT_SHA256__'
BASE='/opt/lingxifield/cn-staged-releases'
DIR="$BASE/.download-$TAG"
STAGE="$DIR/ecs-cn3194-unified-standalone-upgrade-20261110.sh"
PAYMENT="$DIR/cn-payment-activate-3194-20261110.sh"
[[ "$TAG" == "ecs-cn-unified-20261110-$SHORT" ]] || { echo CN_PROMOTION_TAG_MISMATCH; exit 1; }
[[ "$SOURCE_SHA" =~ ^[a-f0-9]{40}$ && "$TAG" == "ecs-cn-unified-20261110-${SOURCE_SHA:0:12}" ]] || { echo CN_PROMOTION_SOURCE_TAG_BINDING_FAILED; exit 1; }
[[ -f "$STAGE" && ! -L "$STAGE" && -f "$PAYMENT" && ! -L "$PAYMENT" ]] || { echo CN_PROMOTION_SCRIPTS_MISSING; exit 1; }
[[ "$(sha256sum "$STAGE" | awk '{print $1}')" == "$STAGE_SHA256" ]] || { echo CN_PROMOTION_STAGE_SCRIPT_SHA256_MISMATCH; exit 1; }
[[ "$(sha256sum "$PAYMENT" | awk '{print $1}')" == "$PAYMENT_SHA256" ]] || { echo CN_PROMOTION_PAYMENT_SCRIPT_SHA256_MISMATCH; exit 1; }
bash -n "$STAGE"
bash -n "$PAYMENT"
echo 'CN_PROMOTION_PREFLIGHT: REVERIFY ISOLATED 3195'
bash "$STAGE" --verify-stage "$TAG"
SELLER_3195="$(curl --noproxy '*' -fLsS --connect-timeout 5 --max-time 25 -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' http://127.0.0.1:3195/sasi/seller)"
grep -Fq '卖家工作台' <<<"$SELLER_3195"
grep -Fq '发布新软件' <<<"$SELLER_3195"
echo 'CN3195_SELLER_WORKSPACE_CONTENT_PASS'
CONFIRM="PROMOTE-CN3194-$SHORT"
printf 'Type %s to switch production traffic: ' "$CONFIRM"
read -r ANSWER
[[ "$ANSWER" == "$CONFIRM" ]] || { echo CN3194_PROMOTION_CANCELLED; exit 1; }
echo 'CN3194_EXPLICIT_PROMOTION_CONFIRMATION_ACCEPTED'
bash "$STAGE" --promote "$TAG"
if ! SELLER_3194="$(curl --noproxy '*' -fLsS --connect-timeout 5 --max-time 25 -H 'Host: lingxifield.cn' -H 'X-Forwarded-Proto: https' http://127.0.0.1:3194/sasi/seller)" ||
   ! grep -Fq '卖家工作台' <<<"$SELLER_3194" ||
   ! grep -Fq '发布新软件' <<<"$SELLER_3194"; then
  echo 'CN3194_SELLER_WORKSPACE_POSTCHECK_FAILED_ROLLBACK_TO_3193'
  bash "$STAGE" --rollback "$TAG" || { echo CN3194_SELLER_WORKSPACE_ROLLBACK_FAILED_MANUAL_REVIEW_REQUIRED >&2; exit 1; }
  exit 1
fi
if ! PUBLIC_SELLER="$(curl -fLsS --connect-timeout 8 --max-time 35 https://lingxifield.cn/sasi/seller)" ||
   ! grep -Fq '卖家工作台' <<<"$PUBLIC_SELLER" ||
   ! grep -Fq '发布新软件' <<<"$PUBLIC_SELLER"; then
  echo 'CN_PUBLIC_SELLER_WORKSPACE_POSTCHECK_FAILED_ROLLBACK_TO_3193'
  bash "$STAGE" --rollback "$TAG" || { echo CN3194_PUBLIC_SELLER_WORKSPACE_ROLLBACK_FAILED_MANUAL_REVIEW_REQUIRED >&2; exit 1; }
  exit 1
fi
echo 'CN3194_LOCAL_AND_PUBLIC_SELLER_WORKSPACE_PASS'

echo 'CN3194_POST_PROMOTION_SIGNED_MERCHANT_AUDIT_NO_CHARGE'
if ! bash "$PAYMENT" --audit "$TAG"; then
  echo 'CN3194_POST_PROMOTION_AUDIT_FAILED_ROLLBACK_TO_3193'
  bash "$STAGE" --rollback "$TAG" || { echo CN3194_POST_PROMOTION_AUDIT_ROLLBACK_FAILED_MANUAL_REVIEW_REQUIRED >&2; exit 1; }
  exit 1
fi

PROVIDERS="$(mktemp /run/cn3194-providers-XXXXXX)"
trap 'rm -f "$PROVIDERS"' EXIT
if ! curl --noproxy '*' -fsS --max-time 20 -H 'Host: lingxifield.cn' \
  http://127.0.0.1:3194/api/pay/providers > "$PROVIDERS"; then
  echo 'CN3194_PROVIDER_ENDPOINT_POSTCHECK_FAILED_ROLLBACK_TO_3193'
  bash "$STAGE" --rollback "$TAG" || { echo CN3194_PROVIDER_ENDPOINT_ROLLBACK_FAILED_MANUAL_REVIEW_REQUIRED >&2; exit 1; }
  exit 1
fi
if ! python3 - "$PROVIDERS" <<'PY'
import json,sys
with open(sys.argv[1],encoding="utf-8") as f:
    data=json.load(f)
for name in ("wechat","alipay","paypal"):
    enabled=data.get(name) is True
    print("CN3194_PROVIDER_FLAG_"+name.upper()+"="+("ENABLED" if enabled else "DISABLED"))
    if not enabled: raise SystemExit("EXISTING_PROVIDER_FLAG_NOT_ENABLED:"+name)
PY
then
  echo 'CN3194_PROVIDER_FLAGS_POSTCHECK_FAILED_ROLLBACK_TO_3193'
  bash "$STAGE" --rollback "$TAG" || { echo CN3194_PROVIDER_FLAGS_ROLLBACK_FAILED_MANUAL_REVIEW_REQUIRED >&2; exit 1; }
  exit 1
fi
echo 'CN3194_PROMOTION_AND_SIGNED_AUDIT_PASS'
echo 'CN3194_NO_PAYMENT_OR_WALLET_FLAG_MUTATION'
echo 'SASI_SOFTWARE_SALES_REMAINS_CLOSED_UNTIL_PRIVATE_SOURCE_ZIP_SCAN_AND_VERIFICATION'
echo 'CN3193_ROLLBACK_BASELINE_RETAINED'
'@
$PromoteMap = @{
    '__TAG__' = $Tag
    '__SHORT__' = $Short
    '__SOURCE_SHA__' = $SourceSha
    '__STAGE_SHA256__' = [string]$Expected['ecs-cn3194-unified-standalone-upgrade-20261110.sh'].Sha
    '__PAYMENT_SHA256__' = [string]$Expected['cn-payment-activate-3194-20261110.sh'].Sha
}
foreach ($key in $PromoteMap.Keys) { $Promote = $Promote.Replace($key, [string]$PromoteMap[$key]) }
if ($Promote -match '__[A-Z0-9_]+__') { throw 'UNRESOLVED_PROMOTION_SCRIPT_PLACEHOLDER' }
$PromotePath = Join-Path $Root "PASTE-IN-ALIYUN-CN3194-PROMOTE-$Short.sh"
[IO.File]::WriteAllText($PromotePath, $Promote, (New-Object Text.UTF8Encoding($false)))

try {
    Set-Clipboard -Value $Ecs
    Write-Host 'CN3195_STAGE_SCRIPT_COPIED_TO_CLIPBOARD'
} catch {
    Write-Host 'CLIPBOARD_UNAVAILABLE_OPEN_THE_GENERATED_STAGE_SCRIPT_FILE'
}
Write-Host "R2_UPLOAD_AND_REMOTE_CONTENT_VERIFY_PASS: $RemoteRoot"
Write-Host "CN3195_STAGE_SCRIPT_SAVED: $EcsPath"
Write-Host "CN3194_PROMOTION_SCRIPT_SAVED_SEPARATELY: $PromotePath"
Write-Host 'SIGNED_URLS_EXPIRE_IN_6_HOURS_AND_ARE_NOT_PRINTED'
Write-Host 'NEXT: Paste the clipboard script into the Alibaba Cloud ECS root terminal.'