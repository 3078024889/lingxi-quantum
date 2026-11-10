# LINGXIFIELD CN3195 exact release transfer + private R2 staging.
# Run in Windows PowerShell 5.1 or PowerShell 7. Uses existing D:\ rclone config.
$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$Config='D:\LINGXIFIELDCN3192\rclone.conf'
$Root='D:\30780\lingxi-quantum'
$Tag='__TAG__'
$Short='__SHORT__'
$SourceSha='__SOURCE_SHA__'
$File='__ARCHIVE_FILE__'
$Check='__CHECK_FILE__'
$UpgradeName='__UPGRADE_NAME__'
$PaymentName='__PAYMENT_NAME__'
$ArchiveSha='__ARCHIVE_SHA__'
$ArchiveBytes=[Int64]'__ARCHIVE_BYTES__'
$CheckSha='__CHECK_SHA__'
$UpgradeSha='__UPGRADE_SHA__'
$UpgradeBytes=[Int64]'__UPGRADE_BYTES__'
$PaymentSha='__PAYMENT_SHA__'
$PaymentBytes=[Int64]'__PAYMENT_BYTES__'
$RemoteRoot="cn3192r2:lingxi-cn3192-transfer/cn3195/$Short"
$EcsScript=Join-Path $Root "PASTE-IN-ALIYUN-CN3195-$Short.sh"
if(!(Test-Path -LiteralPath $Config -PathType Leaf)){throw "R2_CONFIG_NOT_FOUND: $Config"}
if(!(Select-String -LiteralPath $Config -Pattern '^\s*\[cn3192r2\]\s*$' -Quiet)){throw 'R2_REMOTE_SECTION_MISSING'}
$env:RCLONE_CONFIG=$Config
New-Item -ItemType Directory -Force -Path $Root | Out-Null
$rc=Get-Command rclone -ErrorAction SilentlyContinue
if($rc){$Rclone=$rc.Source}else{
 $Rclone=@('D:\LINGXIFIELD\rclone\rclone.exe','D:\LINGXIFIELD\rclone.exe','D:\rclone\rclone.exe')|Where-Object{Test-Path -LiteralPath $_}|Select-Object -First 1
}
if(!$Rclone){throw 'RCLONE_NOT_FOUND'}
function Download-Verified([string]$Url,[string]$Path,[Int64]$Bytes,[string]$Sha){
 if(Test-Path -LiteralPath $Path -PathType Leaf){
  $i=Get-Item -LiteralPath $Path
  if($i.Length -eq $Bytes -and (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant() -eq $Sha){
   Write-Host "REUSE_VERIFIED: $(Split-Path -Leaf $Path)";return
  }
  Remove-Item -LiteralPath $Path -Force
 }
 $tmp="$Path.downloading"
 Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
 Write-Host "DOWNLOADING: $(Split-Path -Leaf $Path)"
 & curl.exe --fail --location --retry 8 --retry-delay 4 --connect-timeout 25 --max-time 3600 --output $tmp $Url
 if($LASTEXITCODE -ne 0){throw "DOWNLOAD_FAILED: $(Split-Path -Leaf $Path)"}
 if((Get-Item -LiteralPath $tmp).Length -ne $Bytes){throw "DOWNLOAD_LENGTH_MISMATCH: $(Split-Path -Leaf $Path)"}
 if((Get-FileHash -LiteralPath $tmp -Algorithm SHA256).Hash.ToLowerInvariant() -ne $Sha){throw "DOWNLOAD_SHA256_MISMATCH: $(Split-Path -Leaf $Path)"}
 Move-Item -LiteralPath $tmp -Destination $Path -Force
 Write-Host "DOWNLOAD_SHA256_PASS: $(Split-Path -Leaf $Path)"
}
$ArchivePath=Join-Path $Root $File
$CheckPath=Join-Path $Root $Check
$UpgradePath=Join-Path $Root $UpgradeName
$PaymentPath=Join-Path $Root $PaymentName
$ReleaseRoot="https://github.com/3078024889/lingxi-quantum/releases/download/$Tag"
Download-Verified "$ReleaseRoot/$File" $ArchivePath $ArchiveBytes $ArchiveSha
Download-Verified "$ReleaseRoot/$Check" $CheckPath 104 $CheckSha
Download-Verified "$ReleaseRoot/$UpgradeName" $UpgradePath $UpgradeBytes $UpgradeSha
Download-Verified "$ReleaseRoot/$PaymentName" $PaymentPath $PaymentBytes $PaymentSha
if((Get-Content -LiteralPath $CheckPath -Raw).Trim() -ne "$ArchiveSha  $File"){throw 'CHECKSUM_MANIFEST_CONTENT_MISMATCH'}
& $Rclone lsd 'cn3192r2:lingxi-cn3192-transfer' | Out-Null
if($LASTEXITCODE -ne 0){throw 'R2_REMOTE_NOT_ACCESSIBLE'}
& $Rclone mkdir $RemoteRoot
if($LASTEXITCODE -ne 0){throw 'R2_RELEASE_PREFIX_CREATE_FAILED'}
function Get-R2ObjectList{
 $raw=& $Rclone lsjson $RemoteRoot --files-only --no-modtime --no-mimetype
 if($LASTEXITCODE -ne 0){throw 'R2_REMOTE_LIST_FAILED'}
 $json=[string]::Join([Environment]::NewLine,[string[]]@($raw))
 if([string]::IsNullOrWhiteSpace($json)){return ,@()}
 return ,@((ConvertFrom-Json -InputObject $json -ErrorAction Stop))
}
$uploads=@(
 @{Local=$ArchivePath;Name=$File;Size=$ArchiveBytes},
 @{Local=$CheckPath;Name=$Check;Size=[Int64]104},
 @{Local=$UpgradePath;Name=$UpgradeName;Size=$UpgradeBytes},
 @{Local=$PaymentPath;Name=$PaymentName;Size=$PaymentBytes}
)
$remote=Get-R2ObjectList
foreach($u in $uploads){
 $existing=@($remote|Where-Object{[string]$_.Name -ceq [string]$u.Name})
 if($existing.Count -gt 0){
  if([Int64]$existing[0].Size -ne [Int64]$u.Size){throw "R2_EXISTING_OBJECT_SIZE_MISMATCH: $($u.Name)"}
  Write-Host "R2_EXISTING_OBJECT_SIZE_MATCH: $($u.Name)"
  continue
 }
 Write-Host "R2_UPLOAD: $($u.Name)"
 & $Rclone copyto $u.Local "$RemoteRoot/$($u.Name)" --s3-upload-cutoff 32Mi --s3-chunk-size 16Mi --s3-upload-concurrency 4 --s3-no-check-bucket --retries 8 --low-level-retries 8
 if($LASTEXITCODE -ne 0){throw "R2_UPLOAD_FAILED: $($u.Name)"}
}
$remote=Get-R2ObjectList
foreach($u in $uploads){
 $x=@($remote|Where-Object{[string]$_.Name -ceq [string]$u.Name})
 if($x.Count -ne 1 -or [Int64]$x[0].Size -ne [Int64]$u.Size){throw "R2_REMOTE_SIZE_VERIFY_FAILED: $($u.Name)"}
 Write-Host "R2_REMOTE_SIZE_VERIFIED: $($u.Name) $($u.Size)"
}
function Get-SignedLink([string]$Name){
 $out=@(& $Rclone link "$RemoteRoot/$Name" --expire 6h 2>&1)
 if($LASTEXITCODE -ne 0){throw "R2_SIGNED_LINK_FAILED: $Name"}
 $url=([string]($out|Select-Object -Last 1)).Trim()
 if($url -notmatch '^https://' -or $url.Contains("'") -or $url.Contains([string][char]10) -or $url.Contains([string][char]13)){throw "R2_SIGNED_LINK_INVALID: $Name"}
 return $url
}
$ArchiveUrl=Get-SignedLink $File
$CheckUrl=Get-SignedLink $Check
$UpgradeUrl=Get-SignedLink $UpgradeName
$PaymentUrl=Get-SignedLink $PaymentName
$Ecs=@'
#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
TAG='__TAG__'
SOURCE_SHA='__SOURCE_SHA__'
ARCHIVE_SHA='__ARCHIVE_SHA__'
ARCHIVE_BYTES='__ARCHIVE_BYTES__'
CHECK_SHA='__CHECK_SHA__'
UPGRADE_SHA='__UPGRADE_SHA__'
UPGRADE_BYTES='__UPGRADE_BYTES__'
PAYMENT_SHA='__PAYMENT_SHA__'
PAYMENT_BYTES='__PAYMENT_BYTES__'
ARCHIVE_URL='__ARCHIVE_URL__'
CHECK_URL='__CHECK_URL__'
UPGRADE_URL='__UPGRADE_URL__'
PAYMENT_URL='__PAYMENT_URL__'
BASE='/opt/lingxifield/cn-staged-releases'
DIR="$BASE/.download-$TAG"
FILE='__ARCHIVE_FILE__'
CHECK='__CHECK_FILE__'
UPGRADE="$DIR/__UPGRADE_NAME__"
PAYMENT="$DIR/__PAYMENT_NAME__"
mkdir -p "$DIR";chmod 700 "$DIR"
fetch_exact(){
 local url="$1" dest="$2" bytes="$3" sha="$4" tmp="$dest.part" got attempt
 if [[ -f "$dest" && ! -L "$dest" ]] && [[ "$(stat -c %s "$dest")" == "$bytes" ]] && [[ "$(sha256sum "$dest"|awk '{print $1}')" == "$sha" ]];then
  echo "R2_REUSE_VERIFIED: $(basename "$dest")";return 0
 fi
 rm -f "$dest"
 for attempt in $(seq 1 12);do
  if [[ -s "$tmp" ]];then curl -4fLsS --retry 3 --retry-delay 3 --connect-timeout 25 --max-time 3600 --continue-at - -o "$tmp" "$url" || true
  else rm -f "$tmp";curl -4fLsS --retry 3 --retry-delay 3 --connect-timeout 25 --max-time 3600 -o "$tmp" "$url" || true;fi
  got="$(stat -c %s "$tmp" 2>/dev/null || echo 0)"
  if [[ "$got" == "$bytes" ]] && [[ "$(sha256sum "$tmp"|awk '{print $1}')" == "$sha" ]];then mv -f "$tmp" "$dest";echo "R2_DOWNLOAD_SHA256_PASS: $(basename "$dest")";return 0;fi
  if (( got >= bytes ));then rm -f "$tmp";fi
  echo "R2_DOWNLOAD_RETRY $attempt/12 $(basename "$dest") bytes=$got/$bytes" >&2;sleep 4
 done
 echo "R2_DOWNLOAD_OR_HASH_FAILED: $dest" >&2;return 1
}
echo 'STEP 1/6: DOWNLOAD EXACT RELEASE FROM PRIVATE R2 LINKS'
fetch_exact "$ARCHIVE_URL" "$DIR/$FILE" "$ARCHIVE_BYTES" "$ARCHIVE_SHA"
fetch_exact "$CHECK_URL" "$DIR/$CHECK" 104 "$CHECK_SHA"
fetch_exact "$UPGRADE_URL" "$UPGRADE" "$UPGRADE_BYTES" "$UPGRADE_SHA"
fetch_exact "$PAYMENT_URL" "$PAYMENT" "$PAYMENT_BYTES" "$PAYMENT_SHA"
grep -Fxq "$ARCHIVE_SHA  $FILE" "$DIR/$CHECK"
(cd "$DIR" && sha256sum -c "$CHECK")
test "$(sha256sum "$DIR/$CHECK"|awk '{print $1}')" = "$CHECK_SHA"
test "$(tar -xOzf "$DIR/$FILE" ./RELEASE_SOURCE_SHA|tr -d '\r\n')" = "$SOURCE_SHA"
tar -tzf "$DIR/$FILE" > "$DIR/archive.manifest"
grep -Fxq './server.js' "$DIR/archive.manifest"
grep -Fxq './RELEASE_SOURCE_SHA' "$DIR/archive.manifest"
grep -Fxq './cn-payment-signed-live-probe.mjs' "$DIR/archive.manifest"
if grep -Eq '(^/|(^|/)\.\.(/|$))' "$DIR/archive.manifest";then echo UNSAFE_ARCHIVE_PATH_BLOCKED;exit 1;fi
bash -n "$UPGRADE";bash -n "$PAYMENT"
echo 'CN3195_EXACT_ARCHIVE_AND_SCRIPT_HASHES_PASS'
echo 'STEP 2/6: READ-ONLY PLAN — CURRENT NGINX UPSTREAM REMAINS ACTIVE'
bash "$UPGRADE" --plan "$TAG"
echo 'STEP 3/6: STAGE EXACT RELEASE ON ISOLATED PORT 3195'
bash "$UPGRADE" --stage-local "$TAG"
echo 'STEP 4/6: VERIFY 3195 ROUTES AND AUTH BOUNDARIES'
bash "$UPGRADE" --verify-stage "$TAG"
echo 'STEP 5/6: PROMOTE 3195 WITH AUTOMATIC PREVIOUS-UPSTREAM ROLLBACK'
bash "$UPGRADE" --promote "$TAG"
echo 'STEP 6/6: SIGNED MERCHANT AUDIT; ENABLE ONLY WHEN ALL PROVIDERS PASS'
bash "$PAYMENT" --audit "$TAG"
bash "$PAYMENT" --enable "$TAG"
echo 'CN3195_PAYMENT_AND_TOOLPASS_LIVE_FLAGS_ENABLED'
echo 'SASI_SOFTWARE_SALES_REMAINS_CLOSED_UNTIL_REAL_SOURCE_ZIP_IS_UPLOADED_AND_HASH_VERIFIED'
echo 'PREVIOUS_UPSTREAM_SERVICE_RETAINED_FOR_ROLLBACK'
'@
$Ecs=$Ecs.Replace('__ARCHIVE_URL__',$ArchiveUrl).Replace('__CHECK_URL__',$CheckUrl).Replace('__UPGRADE_URL__',$UpgradeUrl).Replace('__PAYMENT_URL__',$PaymentUrl)
[IO.File]::WriteAllText($EcsScript,$Ecs,(New-Object Text.UTF8Encoding($false)))
try{Set-Clipboard -Value $Ecs;Write-Host 'ECS_SCRIPT_COPIED_TO_CLIPBOARD'}catch{Write-Host 'OPEN_THE_GENERATED_ECS_SCRIPT_FILE'}
Write-Host "R2_RELEASE_UPLOAD_COMPLETE: $RemoteRoot"
Write-Host "ECS_SCRIPT_SAVED: $EcsScript"
Write-Host 'SIGNED_URLS_EXPIRE_IN_6_HOURS_AND_ARE_NOT_PRINTED'
Write-Host 'NEXT: Paste the clipboard script into the Alibaba Cloud root Workbench terminal.'
