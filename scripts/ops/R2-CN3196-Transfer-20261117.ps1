param()
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Exact CI-built archive. This script uploads to private R2 and prepares an isolated CN3196 candidate only.
$ReleaseTag = 'ecs-cn-unified-20261110-6f72f3dc23dc'
$SourceSha = '6f72f3dc23dc7716bc64f6735e470dc4b527547a'
$Short = '6f72f3dc23dc'
$CandidateTag = "cn3196-candidate-20261116-$Short"

$Config = 'D:\LINGXIFIELDCN3192\rclone.conf'
$Root = 'D:\30780'
$WorkDir = Join-Path $Root "cn3196-candidate-$Short"
$RemoteBase = 'cn3192r2:lingxi-cn3192-transfer/cn3196'
$RemoteRoot = "$RemoteBase/$CandidateTag"
$ReleaseBase = "https://github.com/3078024889/lingxi-quantum/releases/download/$ReleaseTag"
$StageSourceCommit = '0cb89353b2d9e376a37921324247cf96840371c8'
$StageRawUrl = "https://raw.githubusercontent.com/3078024889/lingxi-quantum/$StageSourceCommit/scripts/ops/cn3196-candidate-stage-20261116.sh"

$SourceArchiveName = 'cn-20261110-unified-standalone.tar.gz'
$SourceChecksumName = 'cn-20261110-unified-standalone.sha256'
$ArchiveName = 'cn-20261116-cn3196-candidate.tar.gz'
$ChecksumName = 'cn-20261116-cn3196-candidate.sha256'
$StageName = 'cn3196-candidate-stage-20261116.sh'

$ArchiveBytes = [Int64]340040719
$ArchiveSha = '0782807ad4903efd7ff6a7a96385e44bcb56fc16118647feeab3802ed1db0b6c'
$SourceChecksumBytes = [Int64]104
$SourceChecksumSha = '9311882bd57ba2a5ea56736df616c4bf05e040b7b3a4a76370b9ec18e6599891'
$StageGitBlobSha = '7d91ef0cecca5c7aa8245e31236fe9e6ec3e06bc'
$StageBytes = [Int64]10581

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
if (!(Get-Command curl.exe -ErrorAction SilentlyContinue)) { throw 'CURL_EXE_NOT_FOUND' }

New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null
$Drive = [IO.Path]::GetPathRoot($WorkDir)
$Free = (Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='$($Drive.TrimEnd('\'))'").FreeSpace
if ([Int64]$Free -lt 1500000000) { throw 'INSUFFICIENT_LOCAL_DISK_SPACE_1_5GB_REQUIRED' }

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
        Remove-Item -LiteralPath $Path -Force
    }
    $tmp = "$Path.downloading"
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    Write-Host "DOWNLOAD_EXACT_RELEASE_ASSET: $Name ($Bytes bytes)"
    & curl.exe --fail --location --retry 8 --retry-delay 4 --connect-timeout 25 --max-time 3600 --output $tmp $Url
    if ($LASTEXITCODE -ne 0) { throw "RELEASE_ASSET_DOWNLOAD_FAILED: $Name" }
    if (!(Test-Path -LiteralPath $tmp -PathType Leaf)) { throw "RELEASE_ASSET_MISSING: $Name" }
    if ((Get-Item -LiteralPath $tmp).Length -ne $Bytes) { throw "RELEASE_ASSET_LENGTH_MISMATCH: $Name" }
    if ((Get-Sha256 $tmp) -cne $Sha) { throw "RELEASE_ASSET_SHA256_MISMATCH: $Name" }
    Move-Item -LiteralPath $tmp -Destination $Path -Force
    Write-Host "GITHUB_RELEASE_ASSET_SHA256_PASS: $Name"
}
function Get-R2ObjectList {
    $raw = & $Rclone lsjson $RemoteRoot --files-only --no-modtime --no-mimetype
    if ($LASTEXITCODE -ne 0) { throw 'R2_REMOTE_LIST_FAILED' }
    $json = [string]::Join([Environment]::NewLine, [string[]]@($raw))
    if ([string]::IsNullOrWhiteSpace($json)) { return ,@() }
    return ,@((ConvertFrom-Json -InputObject $json -ErrorAction Stop))
}
function Get-SignedLink([string]$Name) {
    $out = @(& $Rclone link "$RemoteRoot/$Name" --expire 6h 2>&1)
    if ($LASTEXITCODE -ne 0) { throw "R2_SIGNED_LINK_FAILED: $Name" }
    $url = ([string]($out | Select-Object -Last 1)).Trim()
    if ($url -notmatch '^https://' -or $url.Contains("'") -or $url.Contains([string][char]10) -or $url.Contains([string][char]13)) {
        throw "R2_SIGNED_LINK_INVALID: $Name"
    }
    return $url
}

Write-Host 'STEP 1/5: DOWNLOAD AND VERIFY EXACT CI RELEASE ASSETS'
$SourceArchivePath = Join-Path $WorkDir $SourceArchiveName
$SourceChecksumPath = Join-Path $WorkDir $SourceChecksumName
$ArchivePath = Join-Path $WorkDir $ArchiveName
$ChecksumPath = Join-Path $WorkDir $ChecksumName
$StagePath = Join-Path $WorkDir $StageName

Download-Asset $SourceArchiveName $SourceArchivePath $ArchiveBytes $ArchiveSha "$ReleaseBase/$SourceArchiveName"
Download-Asset $SourceChecksumName $SourceChecksumPath $SourceChecksumBytes $SourceChecksumSha "$ReleaseBase/$SourceChecksumName"
$sourceLine = (Get-Content -LiteralPath $SourceChecksumPath -Raw).Trim()
if ($sourceLine -cne "$ArchiveSha  $SourceArchiveName") { throw 'SOURCE_CHECKSUM_CONTENT_MISMATCH' }

Write-Host 'STEP 2/5: RENAME TO IMMUTABLE CN3196 CANDIDATE ASSET NAMES'
if (Test-Path -LiteralPath $ArchivePath) {
    if ((Get-Item -LiteralPath $ArchivePath).Length -ne $ArchiveBytes -or (Get-Sha256 $ArchivePath) -cne $ArchiveSha) {
        throw 'CANDIDATE_ARCHIVE_CACHE_MISMATCH'
    }
} else {
    Move-Item -LiteralPath $SourceArchivePath -Destination $ArchivePath
}
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($ChecksumPath, [string]::Concat($ArchiveSha, '  ', $ArchiveName, [Environment]::NewLine), $utf8NoBom)
if ((Get-Sha256 $ArchivePath) -cne $ArchiveSha) { throw 'CANDIDATE_ARCHIVE_SHA256_MISMATCH' }
if ((Get-Item -LiteralPath $ArchivePath).Length -ne $ArchiveBytes) { throw 'CANDIDATE_ARCHIVE_LENGTH_MISMATCH' }

Write-Host 'STEP 3/5: DOWNLOAD AND VERIFY PINNED CN3196 CANDIDATE STAGE SCRIPT'
if (!(Test-Path -LiteralPath $StagePath -PathType Leaf) -or (Get-GitBlobSha1 $StagePath) -cne $StageGitBlobSha) {
    Remove-Item -LiteralPath $StagePath -Force -ErrorAction SilentlyContinue
    & curl.exe --fail --location --retry 8 --retry-delay 3 --connect-timeout 25 --max-time 300 --output $StagePath $StageRawUrl
    if ($LASTEXITCODE -ne 0) { throw 'CANDIDATE_STAGE_SCRIPT_DOWNLOAD_FAILED' }
}
if ((Get-Item -LiteralPath $StagePath).Length -ne $StageBytes) { throw 'CANDIDATE_STAGE_SCRIPT_LENGTH_MISMATCH' }
if ((Get-GitBlobSha1 $StagePath) -cne $StageGitBlobSha) { throw 'CANDIDATE_STAGE_SCRIPT_GIT_BLOB_SHA1_MISMATCH' }
$StageSha256 = Get-Sha256 $StagePath
$ChecksumBytes = [Int64](Get-Item -LiteralPath $ChecksumPath).Length
$ChecksumSha256 = Get-Sha256 $ChecksumPath
Write-Host 'PINNED_CANDIDATE_STAGE_SCRIPT_PASS'

Write-Host 'STEP 4/5: UPLOAD THREE VERIFIED OBJECTS TO PRIVATE R2 WITH 8-WAY MULTIPART'
& $Rclone lsd 'cn3192r2:lingxi-cn3192-transfer' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'R2_REMOTE_NOT_ACCESSIBLE' }
& $Rclone mkdir $RemoteRoot
if ($LASTEXITCODE -ne 0) { throw 'R2_CANDIDATE_PREFIX_CREATE_FAILED' }

$Uploads = @(
    @{ Local = $ArchivePath; Name = $ArchiveName; Size = $ArchiveBytes },
    @{ Local = $ChecksumPath; Name = $ChecksumName; Size = $ChecksumBytes },
    @{ Local = $StagePath; Name = $StageName; Size = $StageBytes }
)
$Remote = Get-R2ObjectList
if (@($Remote).Count -gt 3) { throw 'R2_CANDIDATE_PREFIX_HAS_UNEXPECTED_OBJECTS' }
foreach ($u in $Uploads) {
    $existing = @($Remote | Where-Object { [string]$_.Name -ceq [string]$u.Name })
    if ($existing.Count -gt 0) {
        if ([Int64]$existing[0].Size -ne [Int64]$u.Size) { throw "R2_EXISTING_OBJECT_SIZE_MISMATCH: $($u.Name)" }
        Write-Host "R2_OBJECT_ALREADY_PRESENT_SIZE_MATCH: $($u.Name)"
        continue
    }
    Write-Host "R2_MULTIPART_UPLOAD_8WAY: $($u.Name)"
    $rcloneArgs = @(
        '--s3-upload-cutoff','32Mi',
        '--s3-chunk-size','16Mi',
        '--s3-upload-concurrency','8',
        '--transfers','8',
        '--checkers','8',
        '--s3-no-check-bucket',
        '--retries','8',
        '--low-level-retries','8',
        '--stats','5s',
        '--stats-one-line'
    )
    & $Rclone copyto $u.Local "$RemoteRoot/$($u.Name)" @rcloneArgs
    if ($LASTEXITCODE -ne 0) { throw "R2_MULTIPART_UPLOAD_FAILED: $($u.Name)" }
}
$Remote = Get-R2ObjectList
if (@($Remote).Count -ne 3) { throw 'R2_CANDIDATE_OBJECT_COUNT_NOT_EXACTLY_THREE' }
foreach ($u in $Uploads) {
    $found = @($Remote | Where-Object { [string]$_.Name -ceq [string]$u.Name })
    if ($found.Count -ne 1 -or [Int64]$found[0].Size -ne [Int64]$u.Size) {
        throw "R2_REMOTE_SIZE_VERIFY_FAILED: $($u.Name)"
    }
    Write-Host "R2_REMOTE_SIZE_PASS: $($u.Name) $($u.Size)"
}
Write-Host 'R2_CONTENT_CHECK_DOWNLOAD_VERIFY_START'
& $Rclone check $WorkDir $RemoteRoot --one-way --download --include $ArchiveName --include $ChecksumName --include $StageName
if ($LASTEXITCODE -ne 0) { throw 'R2_REMOTE_CONTENT_CHECK_FAILED' }
Write-Host 'R2_REMOTE_CONTENT_SHA256_COMPARE_PASS'

Write-Host 'STEP 5/5: GENERATE ENS ROOT 8-PART RANGE-DOWNLOAD STAGING SCRIPT'
$ArchiveUrl = Get-SignedLink $ArchiveName
$CheckUrl = Get-SignedLink $ChecksumName
$StageUrl = Get-SignedLink $StageName

$Ecs = @'
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
ARCHIVE_URL='__ARCHIVE_URL__'
CHECK_URL='__CHECK_URL__'
STAGE_URL='__STAGE_URL__'
BASE='/opt/lingxifield/cn-staged-releases'
DIR="$BASE/.download-$TAG"
FILE='cn-20261116-cn3196-candidate.tar.gz'
CHECK='cn-20261116-cn3196-candidate.sha256'
STAGE="$DIR/cn3196-candidate-stage-20261116.sh"
mkdir -p "$DIR"
chmod 700 "$DIR"

fetch_small_exact() {
  local url="$1" dest="$2" bytes="$3" sha="$4" tmp="$dest.part" got attempt
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
  local index="$1" start="$2" end="$3" expected="$4" part="$DIR/archive.part.$index"
  curl -4fLsS --retry 8 --retry-delay 2 --connect-timeout 25 --max-time 1800 --range "$start-$end" -o "$part" "$ARCHIVE_URL"
  [[ "$(stat -c %s "$part")" == "$expected" ]] || { echo "R2_RANGE_PART_LENGTH_MISMATCH:$index" >&2; return 1; }
  echo "R2_RANGE_PART_PASS:$index:$expected"
}

fetch_small_exact "$CHECK_URL" "$DIR/$CHECK" "$CHECK_BYTES" "$CHECK_SHA"
fetch_small_exact "$STAGE_URL" "$STAGE" "$STAGE_BYTES" "$STAGE_SHA256"

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
bash "$STAGE" --plan
bash "$STAGE" --stage-local
bash "$STAGE" --verify-stage
echo 'CN3196_CANDIDATE_READY_NO_PRODUCTION_SWITCH'
'@

$Ecs = $Ecs.Replace('__TAG__', $CandidateTag).
    Replace('__SOURCE_SHA__', $SourceSha).
    Replace('__ARCHIVE_SHA__', $ArchiveSha).
    Replace('__ARCHIVE_BYTES__', [string]$ArchiveBytes).
    Replace('__CHECK_SHA__', $ChecksumSha256).
    Replace('__CHECK_BYTES__', [string]$ChecksumBytes).
    Replace('__STAGE_SHA256__', $StageSha256).
    Replace('__STAGE_BYTES__', [string]$StageBytes).
    Replace('__ARCHIVE_URL__', $ArchiveUrl).
    Replace('__CHECK_URL__', $CheckUrl).
    Replace('__STAGE_URL__', $StageUrl)

$RootScript = Join-Path $Root "PASTE-IN-ALIYUN-CN3196-STAGE-$Short.sh"
[IO.File]::WriteAllText($RootScript, $Ecs, $utf8NoBom)
$RootScriptSha = Get-Sha256 $RootScript
try {
    Set-Clipboard -Value $Ecs
    Write-Host 'ENS_ROOT_SCRIPT_COPIED_TO_CLIPBOARD'
} catch {
    Write-Host 'CLIPBOARD_UNAVAILABLE_USE_SAVED_SCRIPT'
}
Write-Host 'CN3196_R2_UPLOAD_AND_REMOTE_VERIFY_PASS'
Write-Host "CANDIDATE_TAG=$CandidateTag"
Write-Host "SOURCE_SHA=$SourceSha"
Write-Host "ARCHIVE_SHA256=$ArchiveSha"
Write-Host "ARCHIVE_BYTES=$ArchiveBytes"
Write-Host "R2_PREFIX=$RemoteRoot"
Write-Host "ENS_ROOT_SCRIPT=$RootScript"
Write-Host "ENS_ROOT_SCRIPT_SHA256=$RootScriptSha"
Write-Host 'NEXT: paste the copied Bash script into ENS root; it stages 3196 only and does not switch production.'
