param()
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Exact 6.0 source archive. Stream GitHub -> private R2; do not download the 339 MB archive to D:.
$ReleaseTag = 'ecs-cn-unified-20261117-22c7558dcf40'
$SourceSha = '22c7558dcf4059b690493c150f0ff5993c71c6a8'
$Short = '22c7558dcf40'
$CandidateTag = "cn3196-candidate-20261117-$Short"

$Config = 'D:\LINGXIFIELDCN3192\rclone.conf'
$Root = 'D:\30780'
$WorkDir = Join-Path $Root "cn3196-candidate-$Short"
$RemoteBase = 'cn3192r2:lingxi-cn3192-transfer/cn3196'
$RemoteRoot = "$RemoteBase/$CandidateTag"
$ReleaseBase = "https://github.com/3078024889/lingxi-quantum/releases/download/$ReleaseTag"
$StageSourceCommit = '3b3db7ed0c4067cf96da87f3572f96820d804bd1'
$StageRawUrl = "https://raw.githubusercontent.com/3078024889/lingxi-quantum/$StageSourceCommit/scripts/ops/cn3196-candidate-stage-20261116.sh"
$AuditRawUrl = "https://raw.githubusercontent.com/3078024889/lingxi-quantum/$StageSourceCommit/scripts/ops/cn3195-payment-readiness-audit-20261116.sh"
$TemplateName = 'cn3196-r2-ens-stage-20261117.template.sh'
$TemplateRawUrl = "https://raw.githubusercontent.com/3078024889/lingxi-quantum/$StageSourceCommit/scripts/ops/$TemplateName"
$TemplateGitBlobSha = '0de8892fe696a35dbb1d5277214dfbf36e3b9a3b'
$TemplateBytes = [Int64]4276

$SourceArchiveName = 'cn-20261115-unified-standalone.tar.gz'
$ArchiveName = 'cn-20261117-cn3196-candidate.tar.gz'
$ChecksumName = 'cn-20261117-cn3196-candidate.sha256'
$StageName = 'cn3196-candidate-stage-20261116.sh'
$AuditName = 'cn3195-payment-readiness-audit-20261116.sh'

$ArchiveBytes = [Int64]339005873
$ArchiveSha = '533bf65e97c14b255b03742c6d552f3dc7b74c61c21c550c43b77839ca5e1c4b'
$ChecksumBytes = [Int64]102
$ChecksumSha = 'a393efabd50ca3db13b325876223660afe0ea40714cbe3a4a6b35f7ccd7c6ca2'
$StageGitBlobSha = '60da604ce31a96ae24c9eff5f8942c0a27783e31'
$StageBytes = [Int64]12615
$AuditGitBlobSha = 'ce6242d61f75ab185851b26e2192b3d1e166154b'
$AuditBytes = [Int64]7380

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
if ([Int64]$Free -lt 100000000) { throw 'INSUFFICIENT_LOCAL_DISK_SPACE_100MB_REQUIRED_FOR_SMALL_VERIFIED_FILES' }

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
function Download-GitBlobAsset([string]$Name, [string]$Path, [Int64]$Bytes, [string]$GitBlobSha, [string]$Url) {
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $item = Get-Item -LiteralPath $Path
        if ($item.Length -eq $Bytes -and (Get-GitBlobSha1 $Path) -ceq $GitBlobSha) {
            Write-Host "LOCAL_GIT_BLOB_REUSE_VERIFIED: $Name"
            return
        }
        Remove-Item -LiteralPath $Path -Force
    }
    $tmp = "$Path.downloading"
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    Write-Host "DOWNLOAD_SMALL_PINNED_GIT_BLOB: $Name ($Bytes bytes)"
    & curl.exe --fail --location --retry 8 --retry-delay 3 --connect-timeout 25 --max-time 300 --output $tmp $Url
    if ($LASTEXITCODE -ne 0) { throw "PINNED_ASSET_DOWNLOAD_FAILED: $Name" }
    if (!(Test-Path -LiteralPath $tmp -PathType Leaf)) { throw "PINNED_ASSET_MISSING: $Name" }
    if ((Get-Item -LiteralPath $tmp).Length -ne $Bytes) { throw "PINNED_ASSET_LENGTH_MISMATCH: $Name" }
    if ((Get-GitBlobSha1 $tmp) -cne $GitBlobSha) { throw "PINNED_ASSET_GIT_BLOB_SHA1_MISMATCH: $Name" }
    Move-Item -LiteralPath $tmp -Destination $Path -Force
    Write-Host "PINNED_GIT_BLOB_SHA1_PASS: $Name"
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

$ArchiveUrl = "$ReleaseBase/$SourceArchiveName"
$ChecksumPath = Join-Path $WorkDir $ChecksumName
$StagePath = Join-Path $WorkDir $StageName
$AuditPath = Join-Path $WorkDir $AuditName
$TemplatePath = Join-Path $WorkDir $TemplateName

Write-Host 'STEP 1/5: VERIFY EXACT 6.0 SOURCE AND SMALL PINNED STAGING ASSETS'
Download-GitBlobAsset $StageName $StagePath $StageBytes $StageGitBlobSha "https://raw.githubusercontent.com/3078024889/lingxi-quantum/$StageSourceCommit/scripts/ops/$StageName"
Download-GitBlobAsset $AuditName $AuditPath $AuditBytes $AuditGitBlobSha $AuditRawUrl
Download-GitBlobAsset $TemplateName $TemplatePath $TemplateBytes $TemplateGitBlobSha $TemplateRawUrl
$StageSha256 = Get-Sha256 $StagePath
$AuditSha256 = Get-Sha256 $AuditPath

Write-Host 'STEP 2/5: MATERIALIZE THE 102-BYTE CANDIDATE CHECKSUM ONLY'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllText($ChecksumPath, [string]::Concat($ArchiveSha, '  ', $ArchiveName, [char]10), $utf8NoBom)
if ((Get-Item -LiteralPath $ChecksumPath).Length -ne $ChecksumBytes) { throw 'CANDIDATE_CHECKSUM_LENGTH_MISMATCH' }
if ((Get-Sha256 $ChecksumPath) -cne $ChecksumSha) { throw 'CANDIDATE_CHECKSUM_SHA256_MISMATCH' }

Write-Host 'STEP 3/5: STREAM THE 340-MB RELEASE ASSET DIRECTLY FROM GITHUB TO PRIVATE R2'
& $Rclone lsd 'cn3192r2:lingxi-cn3192-transfer' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'R2_REMOTE_NOT_ACCESSIBLE' }
& $Rclone mkdir $RemoteRoot
if ($LASTEXITCODE -ne 0) { throw 'R2_CANDIDATE_PREFIX_CREATE_FAILED' }

$Remote = Get-R2ObjectList
if (@($Remote).Count -gt 4) { throw 'R2_CANDIDATE_PREFIX_HAS_UNEXPECTED_OBJECTS' }
$existingArchive = @($Remote | Where-Object { [string]$_.Name -ceq $ArchiveName })
if ($existingArchive.Count -gt 0) {
    if ($existingArchive.Count -ne 1 -or [Int64]$existingArchive[0].Size -ne $ArchiveBytes) {
        throw 'R2_EXISTING_CANDIDATE_ARCHIVE_SIZE_MISMATCH'
    }
    Write-Host 'R2_EXACT_ARCHIVE_OBJECT_ALREADY_PRESENT_SIZE_PASS'
} else {
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
    & $Rclone copyurl $ArchiveUrl "$RemoteRoot/$ArchiveName" @rcloneArgs
    if ($LASTEXITCODE -ne 0) { throw 'GITHUB_TO_R2_STREAM_COPY_FAILED' }
}
Write-Host 'GITHUB_TO_R2_STREAM_COPY_COMMAND_PASS'

Write-Host 'STEP 4/5: UPLOAD SMALL VERIFIED MANIFESTS AND VERIFY REMOTE OBJECT SIZES'
$Uploads = @(
    @{ Local = $ChecksumPath; Name = $ChecksumName; Size = $ChecksumBytes },
    @{ Local = $StagePath; Name = $StageName; Size = $StageBytes },
    @{ Local = $AuditPath; Name = $AuditName; Size = $AuditBytes }
)
$Remote = Get-R2ObjectList
foreach ($u in $Uploads) {
    $existing = @($Remote | Where-Object { [string]$_.Name -ceq [string]$u.Name })
    if ($existing.Count -gt 0) {
        if ($existing.Count -ne 1 -or [Int64]$existing[0].Size -ne [Int64]$u.Size) {
            throw "R2_EXISTING_OBJECT_SIZE_MISMATCH: $($u.Name)"
        }
        Write-Host "R2_OBJECT_ALREADY_PRESENT_SIZE_MATCH: $($u.Name)"
        continue
    }
    & $Rclone copyto $u.Local "$RemoteRoot/$($u.Name)" --s3-upload-cutoff 32Mi --s3-chunk-size 16Mi --s3-upload-concurrency 8 --s3-no-check-bucket --retries 8 --low-level-retries 8
    if ($LASTEXITCODE -ne 0) { throw "R2_SMALL_ASSET_UPLOAD_FAILED: $($u.Name)" }
}
$Remote = Get-R2ObjectList
if (@($Remote).Count -ne 4) { throw 'R2_CANDIDATE_OBJECT_COUNT_NOT_EXACTLY_FOUR' }
$Expected = @(
    @{ Name = $ArchiveName; Size = $ArchiveBytes },
    @{ Name = $ChecksumName; Size = $ChecksumBytes },
    @{ Name = $StageName; Size = $StageBytes },
    @{ Name = $AuditName; Size = $AuditBytes }
)
foreach ($u in $Expected) {
    $found = @($Remote | Where-Object { [string]$_.Name -ceq [string]$u.Name })
    if ($found.Count -ne 1 -or [Int64]$found[0].Size -ne [Int64]$u.Size) {
        throw "R2_REMOTE_SIZE_VERIFY_FAILED: $($u.Name)"
    }
    Write-Host "R2_REMOTE_SIZE_PASS: $($u.Name) $($u.Size)"
}
Write-Host 'R2_REMOTE_OBJECT_SIZE_GATE_PASS; ENS WILL VERIFY SHA256 AFTER RANGE DOWNLOAD'

Write-Host 'STEP 5/5: GENERATE ENS ROOT 8-PART RANGE-DOWNLOAD STAGING SCRIPT'
$ArchiveSignedUrl = Get-SignedLink $ArchiveName
$CheckUrl = Get-SignedLink $ChecksumName
$StageUrl = Get-SignedLink $StageName
$AuditUrl = Get-SignedLink $AuditName

$Ecs = Get-Content -LiteralPath $TemplatePath -Raw
if ($Ecs -match '__[A-Z0-9_]+__') { throw 'CN3196_ENS_TEMPLATE_UNRESOLVED_PLACEHOLDER' }

$Ecs = $Ecs.Replace('__TAG__', $CandidateTag).
    Replace('__SOURCE_SHA__', $SourceSha).
    Replace('__ARCHIVE_SHA__', $ArchiveSha).
    Replace('__ARCHIVE_BYTES__', [string]$ArchiveBytes).
    Replace('__CHECK_SHA__', $ChecksumSha).
    Replace('__CHECK_BYTES__', [string]$ChecksumBytes).
    Replace('__STAGE_SHA256__', $StageSha256).
    Replace('__STAGE_BYTES__', [string]$StageBytes).
    Replace('__AUDIT_SHA256__', $AuditSha256).
    Replace('__AUDIT_BYTES__', [string]$AuditBytes).
    Replace('__ARCHIVE_URL__', $ArchiveSignedUrl).
    Replace('__CHECK_URL__', $CheckUrl).
    Replace('__STAGE_URL__', $StageUrl).
    Replace('__AUDIT_URL__', $AuditUrl)

$RootScript = Join-Path $Root "PASTE-IN-ALIYUN-CN3196-STAGE-$Short.sh"
[IO.File]::WriteAllText($RootScript, $Ecs, $utf8NoBom)
$RootScriptSha = Get-Sha256 $RootScript
try {
    Set-Clipboard -Value $Ecs
    Write-Host 'ENS_ROOT_SCRIPT_COPIED_TO_CLIPBOARD'
} catch {
    Write-Host 'CLIPBOARD_UNAVAILABLE_USE_SAVED_SCRIPT'
}
Write-Host 'CN3196_R2_STREAM_UPLOAD_AND_REMOTE_SIZE_VERIFY_PASS'
Write-Host "CANDIDATE_TAG=$CandidateTag"
Write-Host "SOURCE_SHA=$SourceSha"
Write-Host "ARCHIVE_SHA256=$ArchiveSha"
Write-Host "ARCHIVE_BYTES=$ArchiveBytes"
Write-Host "R2_PREFIX=$RemoteRoot"
Write-Host "ENS_ROOT_SCRIPT=$RootScript"
Write-Host "ENS_ROOT_SCRIPT_SHA256=$RootScriptSha"
Write-Host 'NEXT: paste the copied Bash script into ENS root; it stages 3196 only and does not switch production.'
