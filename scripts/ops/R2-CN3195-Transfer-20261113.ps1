param([string]$Tag)
$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$Config='D:\LINGXIFIELDCN3192\rclone.conf'
$Root='D:\30780\lingxi-quantum'
$RemoteBase='cn3192r2:lingxi-cn3192-transfer/cn3195'
$ManifestName='cn3194-release-manifest.env'
if(!(Test-Path -LiteralPath $Config -PathType Leaf)){throw "R2_CONFIG_NOT_FOUND: $Config"}
if(!(Select-String -LiteralPath $Config -Pattern '^\s*\[cn3192r2\]\s*$' -Quiet)){throw 'R2_REMOTE_SECTION_MISSING'}
$env:RCLONE_CONFIG=$Config
New-Item -ItemType Directory -Force -Path $Root | Out-Null
$rc=Get-Command rclone -ErrorAction SilentlyContinue
if($rc){$Rclone=$rc.Source}else{
 $Rclone=@('D:\LINGXIFIELD\rclone\rclone.exe','D:\LINGXIFIELD\rclone.exe','D:\rclone\rclone.exe')|Where-Object{Test-Path -LiteralPath $_}|Select-Object -First 1
}
if(!$Rclone){throw 'RCLONE_NOT_FOUND'}
$ExpectedTag='ecs-cn-unified-20261110-fe253a6be0ea'
$ExpectedSourceSha='fe253a6be0eae2360245e0a183820a7e2c3be1ed'
$ManifestBytes=[Int64]621
$ManifestSha='5197da76e2c4298268a7c87011d875052bffc052a0e890836b7c8468e3f8093a'
if([string]::IsNullOrWhiteSpace($Tag)){$Tag=$ExpectedTag}
if($Tag -cne $ExpectedTag){throw "UNAPPROVED_EXACT_RELEASE_TAG: $Tag"}
$Short=$Tag.Substring($Tag.Length-12)
$ReleaseBase="https://github.com/3078024889/lingxi-quantum/releases/download/$Tag"
function Get-GitBlobSha1([string]$FilePath){
 $bytes=[IO.File]::ReadAllBytes($FilePath)
 $prefix=[Text.Encoding]::ASCII.GetBytes("blob $($bytes.Length)")
 $all=New-Object byte[] ($prefix.Length+1+$bytes.Length)
 [Array]::Copy($prefix,0,$all,0,$prefix.Length)
 $all[$prefix.Length]=0
 [Array]::Copy($bytes,0,$all,$prefix.Length+1,$bytes.Length)
 $sha=[Security.Cryptography.SHA1]::Create()
 try{return ([BitConverter]::ToString($sha.ComputeHash($all))).Replace('-','').ToLowerInvariant()}finally{$sha.Dispose()}
}
function Download-ReleaseAsset([string]$Name,[string]$Path,[Int64]$Bytes,[string]$Sha,[string]$BlobSha=''){
 if($Name -notmatch '^[A-Za-z0-9._-]+$'){throw "RELEASE_ASSET_NAME_INVALID: $Name"}
 if($BlobSha -and $BlobSha -notmatch '^[a-f0-9]{40}$'){throw "RELEASE_ASSET_GIT_BLOB_SHA1_INVALID: $Name"}
 $Uri="$ReleaseBase/$Name"
 if(Test-Path -LiteralPath $Path -PathType Leaf){
  $item=Get-Item -LiteralPath $Path
  $valid=(($Bytes -eq 0 -or $item.Length -eq $Bytes) -and (!$Sha -or (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant() -eq $Sha))
  if($valid -and $BlobSha){$valid=((Get-GitBlobSha1 $Path) -ceq $BlobSha)}
  if($valid){Write-Host "REUSE_VERIFIED: $Name";return}
  Write-Host "CACHE_REJECTED_AND_REDOWNLOAD: $Name"
 }
 $tmp="$Path.downloading"
 Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
 Write-Host "DOWNLOAD_RELEASE_ASSET: $Name"
 & curl.exe --fail --location --retry 8 --retry-delay 4 --connect-timeout 25 --max-time 3600 --output $tmp $Uri
 if($LASTEXITCODE -ne 0){throw "RELEASE_ASSET_DOWNLOAD_FAILED: $Name"}
 if($Bytes -gt 0 -and (Get-Item -LiteralPath $tmp).Length -ne $Bytes){throw "RELEASE_ASSET_LENGTH_MISMATCH: $Name"}
 if($Sha -and (Get-FileHash -LiteralPath $tmp -Algorithm SHA256).Hash.ToLowerInvariant() -ne $Sha){throw "RELEASE_ASSET_SHA256_MISMATCH: $Name"}
 if($BlobSha -and (Get-GitBlobSha1 $tmp) -cne $BlobSha){Remove-Item -LiteralPath $tmp -Force;throw "RELEASE_ASSET_GIT_BLOB_SHA1_MISMATCH: $Name"}
 Move-Item -LiteralPath $tmp -Destination $Path -Force
}
$ManifestPath=Join-Path $Root $ManifestName
Download-ReleaseAsset $ManifestName $ManifestPath $ManifestBytes $ManifestSha
$Manifest=@{}
foreach($line in Get-Content -LiteralPath $ManifestPath){
 if($line -match '^([A-Z][A-Z0-9_]*)=(.*)$'){$Manifest[$Matches[1]]=$Matches[2]}
}
foreach($key in @('SOURCE_SHA','TAG','SHORT','ARCHIVE_FILE','ARCHIVE_BYTES','ARCHIVE_SHA256','CHECK_FILE','CHECK_SHA256','STAGE_FILE','STAGE_BLOB_SHA1','PAYMENT_FILE','PAYMENT_BLOB_SHA1')){
 if(!$Manifest.ContainsKey($key) -or [string]::IsNullOrWhiteSpace([string]$Manifest[$key])){throw "RELEASE_MANIFEST_FIELD_MISSING: $key"}
}
if($Manifest.TAG -cne $Tag -or $Manifest.SHORT -cne $Short -or $Manifest.SOURCE_SHA -cne $ExpectedSourceSha){throw 'RELEASE_MANIFEST_IDENTITY_MISMATCH'}
$ArchiveFile=[string]$Manifest.ARCHIVE_FILE
$CheckFile=[string]$Manifest.CHECK_FILE
$StageFile=[string]$Manifest.STAGE_FILE
$PaymentFile=[string]$Manifest.PAYMENT_FILE
$ArchiveBytes=[Int64]$Manifest.ARCHIVE_BYTES
$ArchiveSha=[string]$Manifest.ARCHIVE_SHA256
$CheckSha=[string]$Manifest.CHECK_SHA256
$StageBlob=[string]$Manifest.STAGE_BLOB_SHA1
$PaymentBlob=[string]$Manifest.PAYMENT_BLOB_SHA1
if($ArchiveBytes -lt 1000000 -or $ArchiveBytes -gt 1300000000 -or $ArchiveSha -notmatch '^[a-f0-9]{64}$' -or $CheckSha -notmatch '^[a-f0-9]{64}$'){throw 'RELEASE_ARCHIVE_MANIFEST_INVALID'}
if($StageBlob -notmatch '^[a-f0-9]{40}$' -or $PaymentBlob -notmatch '^[a-f0-9]{40}$'){throw 'RELEASE_SCRIPT_BLOB_HASH_INVALID'}
$ArchivePath=Join-Path $Root $ArchiveFile
$CheckPath=Join-Path $Root $CheckFile
$StagePath=Join-Path $Root $StageFile
$PaymentPath=Join-Path $Root $PaymentFile
Download-ReleaseAsset $ArchiveFile $ArchivePath $ArchiveBytes $ArchiveSha
Download-ReleaseAsset $CheckFile $CheckPath 104 $CheckSha
Download-ReleaseAsset $StageFile $StagePath 0 '' $StageBlob
Download-ReleaseAsset $PaymentFile $PaymentPath 0 '' $PaymentBlob
if((Get-Content -LiteralPath $CheckPath -Raw).Trim() -ne "$ArchiveSha  $ArchiveFile"){throw 'CHECKSUM_MANIFEST_CONTENT_MISMATCH'}

if((Get-GitBlobSha1 $StagePath) -cne $StageBlob){throw 'STAGE_GIT_BLOB_SHA1_MISMATCH'}
if((Get-GitBlobSha1 $PaymentPath) -cne $PaymentBlob){throw 'PAYMENT_GIT_BLOB_SHA1_MISMATCH'}
$StageSha=(Get-FileHash -LiteralPath $StagePath -Algorithm SHA256).Hash.ToLowerInvariant()
$PaymentSha=(Get-FileHash -LiteralPath $PaymentPath -Algorithm SHA256).Hash.ToLowerInvariant()
$StageBytes=(Get-Item -LiteralPath $StagePath).Length
$PaymentBytes=(Get-Item -LiteralPath $PaymentPath).Length
& $Rclone lsd 'cn3192r2:lingxi-cn3192-transfer' | Out-Null
if($LASTEXITCODE -ne 0){throw 'R2_REMOTE_NOT_ACCESSIBLE'}
$RemoteRoot="$RemoteBase/$Short"
& $Rclone mkdir $RemoteRoot
if($LASTEXITCODE -ne 0){throw 'R2_RELEASE_PREFIX_CREATE_FAILED'}
function Get-R2ObjectList{
 $raw=& $Rclone lsjson $RemoteRoot --files-only --no-modtime --no-mimetype
 if($LASTEXITCODE -ne 0){throw 'R2_REMOTE_LIST_FAILED'}
 $json=[string]::Join([Environment]::NewLine,[string[]]@($raw))
 if([string]::IsNullOrWhiteSpace($json)){return ,@()}
 return ,@((ConvertFrom-Json -InputObject $json -ErrorAction Stop))
}
$Uploads=@(
 @{Local=$ArchivePath;Name=$ArchiveFile;Size=$ArchiveBytes},
 @{Local=$CheckPath;Name=$CheckFile;Size=[Int64]104},
 @{Local=$StagePath;Name=$StageFile;Size=$StageBytes},
 @{Local=$PaymentPath;Name=$PaymentFile;Size=$PaymentBytes},
 @{Local=$ManifestPath;Name=$ManifestName;Size=(Get-Item -LiteralPath $ManifestPath).Length}
)
$Remote=Get-R2ObjectList
foreach($u in $Uploads){
 $existing=@($Remote|Where-Object{[string]$_.Name -ceq [string]$u.Name})
 if($existing.Count -gt 0){
  if([Int64]$existing[0].Size -ne [Int64]$u.Size){throw "R2_EXISTING_OBJECT_SIZE_MISMATCH: $($u.Name)"}
  Write-Host "R2_EXISTING_OBJECT_SIZE_MATCH: $($u.Name)"
  continue
 }
 Write-Host "R2_UPLOAD: $($u.Name)"
 & $Rclone copyto $u.Local "$RemoteRoot/$($u.Name)" --s3-upload-cutoff 32Mi --s3-chunk-size 16Mi --s3-upload-concurrency 4 --s3-no-check-bucket --retries 8 --low-level-retries 8
 if($LASTEXITCODE -ne 0){throw "R2_UPLOAD_FAILED: $($u.Name)"}
}
$Remote=Get-R2ObjectList
foreach($u in $Uploads){
 $x=@($Remote|Where-Object{[string]$_.Name -ceq [string]$u.Name})
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
$ArchiveUrl=Get-SignedLink $ArchiveFile
$CheckUrl=Get-SignedLink $CheckFile
$StageUrl=Get-SignedLink $StageFile
$PaymentUrl=Get-SignedLink $PaymentFile
$Ecs=@'
#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
TAG='__TAG__'
SOURCE_SHA='__SOURCE_SHA__'
ARCHIVE_SHA='__ARCHIVE_SHA__'
ARCHIVE_BYTES='__ARCHIVE_BYTES__'
CHECK_SHA='__CHECK_SHA__'
STAGE_SHA='__STAGE_SHA__'
STAGE_BYTES='__STAGE_BYTES__'
PAYMENT_SHA='__PAYMENT_SHA__'
PAYMENT_BYTES='__PAYMENT_BYTES__'
ARCHIVE_URL='__ARCHIVE_URL__'
CHECK_URL='__CHECK_URL__'
STAGE_URL='__STAGE_URL__'
PAYMENT_URL='__PAYMENT_URL__'
BASE='/opt/lingxifield/cn-staged-releases'
DIR="$BASE/.download-$TAG"
FILE='__ARCHIVE_FILE__'
CHECK='__CHECK_FILE__'
STAGE="$DIR/__STAGE_FILE__"
PAYMENT="$DIR/__PAYMENT_FILE__"
mkdir -p "$DIR";chmod 700 "$DIR"
fetch_exact(){
 local url="$1" dest="$2" bytes="$3" sha="$4" got attempt
 local tmp
 tmp="${dest}.part"
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
fetch_exact "$STAGE_URL" "$STAGE" "$STAGE_BYTES" "$STAGE_SHA"
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
bash -n "$STAGE";bash -n "$PAYMENT"
echo 'CN3194_EXACT_ARCHIVE_AND_SCRIPT_HASHES_PASS'
echo 'STEP 2/6: READ-ONLY PLAN — CURRENT NGINX UPSTREAM REMAINS ACTIVE'
bash "$STAGE" --plan "$TAG"
echo 'STEP 3/6: STAGE EXACT RELEASE ON ISOLATED PORT 3195'
bash "$STAGE" --stage-local "$TAG"
echo 'STEP 4/6: VERIFY 3195 ROUTES AND AUTH BOUNDARIES'
bash "$STAGE" --verify-stage "$TAG"
echo 'STEP 5/6: PROMOTE CN3194 (3195 TEMPORARY STAGE; 3193 ROLLBACK BASELINE)'
bash "$STAGE" --promote "$TAG"
echo 'STEP 6/6: SIGNED MERCHANT AUDIT ONLY; PRESERVE EXISTING PROVIDER AND WALLET FLAGS'
bash "$PAYMENT" --audit "$TAG"
echo 'CN3194_SIGNED_MERCHANT_AUDIT_PASS_EXISTING_FLAGS_PRESERVED'
echo 'CN3194_NO_PAYMENT_OR_WALLET_FLAG_MUTATION'
echo 'SASI_SOFTWARE_SALES_REMAINS_CLOSED_UNTIL_REAL_SOURCE_ZIP_IS_UPLOADED_AND_HASH_VERIFIED'
echo 'CN3193_ROLLBACK_BASELINE_RETAINED'
'@
$Map=@{
 '__TAG__'=$Tag;'__SOURCE_SHA__'=$Manifest.SOURCE_SHA;'__ARCHIVE_SHA__'=$ArchiveSha;'__ARCHIVE_BYTES__'=[string]$ArchiveBytes;
 '__CHECK_SHA__'=$CheckSha;'__STAGE_SHA__'=$StageSha;'__STAGE_BYTES__'=[string]$StageBytes;
 '__PAYMENT_SHA__'=$PaymentSha;'__PAYMENT_BYTES__'=[string]$PaymentBytes;
 '__ARCHIVE_FILE__'=$ArchiveFile;'__CHECK_FILE__'=$CheckFile;'__STAGE_FILE__'=$StageFile;'__PAYMENT_FILE__'=$PaymentFile;
 '__ARCHIVE_URL__'=$ArchiveUrl;'__CHECK_URL__'=$CheckUrl;'__STAGE_URL__'=$StageUrl;'__PAYMENT_URL__'=$PaymentUrl
}
foreach($k in $Map.Keys){$Ecs=$Ecs.Replace($k,[string]$Map[$k])}
$EcsPath=Join-Path $Root "PASTE-IN-ALIYUN-CN3194-$Short.sh"
[IO.File]::WriteAllText($EcsPath,$Ecs,(New-Object Text.UTF8Encoding($false)))
try{Set-Clipboard -Value $Ecs;Write-Host 'ECS_SCRIPT_COPIED_TO_CLIPBOARD'}catch{Write-Host 'OPEN_THE_GENERATED_ECS_SCRIPT_FILE'}
Write-Host "R2_RELEASE_UPLOAD_COMPLETE: $RemoteRoot"
Write-Host "ECS_SCRIPT_SAVED: $EcsPath"
Write-Host 'SIGNED_URLS_EXPIRE_IN_6_HOURS_AND_ARE_NOT_PRINTED'
Write-Host 'NEXT: Paste the clipboard script into the Alibaba Cloud root Workbench terminal.'
