param([string]$Tag)
$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$Config='D:\LINGXIFIELDCN3192\rclone.conf'
$Root='D:\30780\CN3195Transfer\20261112-envfile16-minimal-overlay'
$RemoteBase='cn3192r2:lingxi-cn3192-transfer/cn3195-staged-20261112-envfile16-minimal-overlay'
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
$ExpectedTag='ecs-cn-unified-20261110-21367c6fb8d4'
$ExpectedSourceSha='21367c6fb8d4067f23f9982256eacffc1c540d5c'
if([string]::IsNullOrWhiteSpace($Tag)){throw 'EXACT_RELEASE_TAG_REQUIRED'}
$Tag=$Tag.Trim()
if($Tag -cne $ExpectedTag){throw 'CN_RELEASE_TAG_NOT_APPROVED'}
$Short=$Tag.Substring($Tag.Length-12)
$ReleaseBase="https://github.com/3078024889/lingxi-quantum/releases/download/$Tag"
$ReleaseAssets=@{}
$ReleaseAssets[$ManifestName]="$ReleaseBase/$ManifestName"
function Download-ReleaseAsset([string]$Name,[string]$Path,[Int64]$Bytes,[string]$Sha){
 if(!$ReleaseAssets.ContainsKey($Name)){throw "RELEASE_ASSET_MISSING: $Name"}
 if(Test-Path -LiteralPath $Path -PathType Leaf){
  $item=Get-Item -LiteralPath $Path
  if(($Bytes -eq 0 -or $item.Length -eq $Bytes) -and (!$Sha -or (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant() -eq $Sha)){
   Write-Host "REUSE_VERIFIED: $Name";return
  }
 }
 $tmp="$Path.downloading"
 Write-Host "DOWNLOAD_RELEASE_ASSET: $Name"
 & curl.exe --fail --location --retry 8 --retry-delay 4 --connect-timeout 25 --max-time 3600 --output $tmp $ReleaseAssets[$Name]
 if($LASTEXITCODE -ne 0){throw "RELEASE_ASSET_DOWNLOAD_FAILED: $Name"}
 if($Bytes -gt 0 -and (Get-Item -LiteralPath $tmp).Length -ne $Bytes){throw "RELEASE_ASSET_LENGTH_MISMATCH: $Name"}
 if($Sha -and (Get-FileHash -LiteralPath $tmp -Algorithm SHA256).Hash.ToLowerInvariant() -ne $Sha){throw "RELEASE_ASSET_SHA256_MISMATCH: $Name"}
 Move-Item -LiteralPath $tmp -Destination $Path -Force
}
$ManifestPath=Join-Path $Root $ManifestName
Download-ReleaseAsset $ManifestName $ManifestPath 621 ''
$Manifest=@{}
foreach($line in Get-Content -LiteralPath $ManifestPath){
 if($line -match '^([A-Z][A-Z0-9_]*)=(.*)$'){$Manifest[$Matches[1]]=$Matches[2]}
}
foreach($key in @('SOURCE_SHA','TAG','SHORT','ARCHIVE_FILE','ARCHIVE_BYTES','ARCHIVE_SHA256','CHECK_FILE','CHECK_SHA256','STAGE_FILE','STAGE_BLOB_SHA1','PAYMENT_FILE','PAYMENT_BLOB_SHA1')){
 if(!$Manifest.ContainsKey($key) -or [string]::IsNullOrWhiteSpace([string]$Manifest[$key])){throw "RELEASE_MANIFEST_FIELD_MISSING: $key"}
}
if($Manifest.TAG -cne $Tag -or $Manifest.SHORT -cne $Short -or $Manifest.SOURCE_SHA -notmatch '^[a-f0-9]{40}$'){throw 'RELEASE_MANIFEST_IDENTITY_MISMATCH'}
if($Manifest.SOURCE_SHA -cne $ExpectedSourceSha){throw 'CN_RELEASE_SOURCE_SHA_MISMATCH'}
$ArchiveFile=[string]$Manifest.ARCHIVE_FILE
$CheckFile=[string]$Manifest.CHECK_FILE
$StageFile=[string]$Manifest.STAGE_FILE
$PaymentFile=[string]$Manifest.PAYMENT_FILE
foreach($assetName in @($ArchiveFile,$CheckFile,$StageFile,$PaymentFile)){
 if($assetName -notmatch '^[A-Za-z0-9._-]+$' -or $assetName -in @('.','..')){throw 'RELEASE_ASSET_NAME_INVALID'}
 $ReleaseAssets[$assetName]="$ReleaseBase/$([uri]::EscapeDataString($assetName))"
}
if($ArchiveFile -cne 'cn-20261110-unified-standalone.tar.gz' -or $CheckFile -cne 'cn-20261110-unified-standalone.sha256' -or $StageFile -cne 'ecs-cn3194-unified-standalone-upgrade-20261110.sh' -or $PaymentFile -cne 'cn-payment-activate-3194-20261110.sh'){throw 'CN_RELEASE_ASSET_IDENTITY_MISMATCH'}
if([Int64]$Manifest.ARCHIVE_BYTES -ne 455835233){throw 'CN_RELEASE_ARCHIVE_SIZE_NOT_APPROVED'}
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
$StageOriginalPath=Join-Path $Root ($StageFile+'.release-original')
$PaymentPath=Join-Path $Root $PaymentFile
Download-ReleaseAsset $ArchiveFile $ArchivePath $ArchiveBytes $ArchiveSha
Download-ReleaseAsset $CheckFile $CheckPath 104 $CheckSha
Download-ReleaseAsset $StageFile $StageOriginalPath 26779 ''
Download-ReleaseAsset $PaymentFile $PaymentPath 11972 ''
if((Get-Content -LiteralPath $CheckPath -Raw).Trim() -ne "$ArchiveSha  $ArchiveFile"){throw 'CHECKSUM_MANIFEST_CONTENT_MISMATCH'}
function Get-GitBlobSha1([string]$Path){
 $bytes=[IO.File]::ReadAllBytes($Path)
 $prefix=[Text.Encoding]::ASCII.GetBytes("blob $($bytes.Length)")
 $all=New-Object byte[] ($prefix.Length+1+$bytes.Length)
 [Array]::Copy($prefix,0,$all,0,$prefix.Length)
 $all[$prefix.Length]=0
 [Array]::Copy($bytes,0,$all,$prefix.Length+1,$bytes.Length)
 $sha=[Security.Cryptography.SHA1]::Create()
 try{return ([BitConverter]::ToString($sha.ComputeHash($all))).Replace('-','').ToLowerInvariant()}finally{$sha.Dispose()}
}
if((Get-GitBlobSha1 $StageOriginalPath) -cne $StageBlob){throw 'STAGE_GIT_BLOB_SHA1_MISMATCH'}
$StageText=[IO.File]::ReadAllText($StageOriginalPath)
$OldEnvLine=' (( ${#LIVE_ENV_FILES[@]} >= 1 && ${#LIVE_ENV_FILES[@]} <= 8 )) || { echo CN3194_SOURCE_ENVFILE_COUNT_INVALID >&2;exit 1; }'
$NewEnvLine1=' (( ${#LIVE_ENV_FILES[@]} >= 1 && ${#LIVE_ENV_FILES[@]} <= 16 )) || { echo CN3194_SOURCE_ENVFILE_COUNT_INVALID >&2;exit 1; }'
$NewEnvLine2=' [[ "${#LIVE_ENV_FILES[@]}" -eq "$(printf ''%s\n'' "${LIVE_ENV_FILES[@]}" | sort -u | wc -l)" ]] || { echo CN3194_SOURCE_ENVFILE_DUPLICATE >&2;exit 1; }'
$First=$StageText.IndexOf($OldEnvLine,[StringComparison]::Ordinal)
if($First -lt 0 -or $First -ne $StageText.LastIndexOf($OldEnvLine,[StringComparison]::Ordinal)){throw 'STAGE_ENVFILE_PATCH_SOURCE_NOT_EXACT'}
$StageText=$StageText.Replace($OldEnvLine,$NewEnvLine1+"`n"+$NewEnvLine2)
if($StageText.Contains($OldEnvLine) -or !$StageText.Contains('CN3194_SOURCE_ENVFILE_DUPLICATE')){throw 'STAGE_ENVFILE_PATCH_VERIFY_FAILED'}
$OldEnvSafetyLine='  [[ "$f" =~ ^/etc/lingxifield/[a-zA-Z0-9_.-]+\.env$ && -f "$f" && ! -L "$f" && "$(stat -c %u "$f")" == 0 ]] || {'
$NewEnvSafetyLine='  [[ "$f" =~ ^/etc/lingxifield/[a-zA-Z0-9_.-]+\.env$ && -f "$f" && ! -L "$f" && "$(stat -c %u "$f")" == 0 && "$(stat -c %a "$f")" == 600 ]] || {'
if($StageText.Split($OldEnvSafetyLine,[StringSplitOptions]::None).Length -ne 2){throw 'STAGE_ENVFILE_SAFETY_SOURCE_NOT_EXACT'}
$StageText=$StageText.Replace($OldEnvSafetyLine,$NewEnvSafetyLine)
$StageStartMarker='python3 - "$ENV" "$STAGE_ENV" <<''PY'''
$StageEndMarker="`nPY"
$StageStart=$StageText.IndexOf($StageStartMarker,[StringComparison]::Ordinal)
$StageEnd=if($StageStart -ge 0){$StageText.IndexOf($StageEndMarker,$StageStart,[StringComparison]::Ordinal)}else{-1}
if($StageStart -lt 0 -or $StageEnd -lt 0 -or $StageText.IndexOf($StageStartMarker,$StageStart+1,[StringComparison]::Ordinal) -ge 0){throw 'STAGE_ENV_OVERLAY_SOURCE_NOT_EXACT'}
$MinimalStageBlock=@'
echo 'CN3195_STAGE_ENV_MINIMAL_OVERLAY_V1'
python3 - "$STAGE_ENV" <<'PY'
import os,sys,tempfile
dst=sys.argv[1]
disabled={
 "TOOL_PASS_COMMERCE_READY","ALIPAY_ENABLED","PAYPAL_ENABLED","WECHAT_ENABLED",
 "SASI_RMB_BALANCE_V1_ENABLED","USD_BALANCE_TOPUP_ENABLED","SASI_REFUND_FLOW_TESTED",
 "SASI_MARKET_SALES_ENABLED","SASI_MARKET_UPLOADS_ENABLED","SASI_MARKET_DELIVERY_ENABLED",
 "SASI_MARKET_PAYOUTS_ENABLED","SASI_MARKETPLACE_COMMERCE_READY","SOFTWARE_COMMERCE_READY"
}
out=[k+"=false" for k in sorted(disabled)]
out.extend(["TOOL_PASS_BACKEND_READY=true","NEXT_PUBLIC_TOOL_PASS_ENFORCED=true",
 "NEXT_PUBLIC_SITE_URL=https://lingxifield.cn","ALIPAY_SITE_URL=https://lingxifield.cn",
 "NODE_ENV=production","NODE_OPTIONS=--max-old-space-size=500",
 "PORT=3195","HOSTNAME=127.0.0.1"])
fd,tmp=tempfile.mkstemp(prefix=".cn3195-stage-",dir=os.path.dirname(dst) or ".")
try:
 os.fchmod(fd,0o600)
 with os.fdopen(fd,"w",encoding="utf8") as f:f.write("\n".join(out)+"\n");f.flush();os.fsync(f.fileno())
 os.replace(tmp,dst)
finally:
 if os.path.exists(tmp):os.unlink(tmp)
PY
'@
$StageText=$StageText.Substring(0,$StageStart)+$MinimalStageBlock.TrimEnd("`r","`n")+$StageText.Substring($StageEnd+3)
if($StageText.Contains('python3 - "$ENV" "$STAGE_ENV"') -or !$StageText.Contains('CN3195_STAGE_ENV_MINIMAL_OVERLAY_V1') -or $StageText.Contains('lines=open(src,encoding="utf8").read().splitlines()')){throw 'STAGE_ENV_OVERLAY_PATCH_VERIFY_FAILED'}
[IO.File]::WriteAllText($StagePath,$StageText,(New-Object Text.UTF8Encoding($false)))
$PatchedStageBlob=Get-GitBlobSha1 $StagePath
Write-Host "STAGE_OVERLAY_PATCH_PASS: ENVFILE_LIMIT=16 MINIMAL_ENV=PASS PATCHED_GIT_BLOB=$PatchedStageBlob"
if((Get-GitBlobSha1 $PaymentPath) -cne $PaymentBlob){throw 'PAYMENT_GIT_BLOB_SHA1_MISMATCH'}
$StageSha=(Get-FileHash -LiteralPath $StagePath -Algorithm SHA256).Hash.ToLowerInvariant()
$PaymentSha=(Get-FileHash -LiteralPath $PaymentPath -Algorithm SHA256).Hash.ToLowerInvariant()
$StageBytes=(Get-Item -LiteralPath $StagePath).Length
$OverlayPath=Join-Path $Root 'cn3195-stage-overlay.env'
$OverlayContent=@(
 'FORMAT=CN3195_STAGE_OVERLAY_V1'
 "TAG=$Tag"
 "SOURCE_SHA=$($Manifest.SOURCE_SHA)"
 "UPSTREAM_STAGE_GIT_BLOB_SHA1=$StageBlob"
 "PATCHED_STAGE_GIT_BLOB_SHA1=$PatchedStageBlob"
 "PATCHED_STAGE_SHA256=$StageSha"
 "PATCHED_STAGE_BYTES=$StageBytes"
 'PATCH=CN3194_SOURCE_ENVFILE_LIMIT_8_TO_16'
 'PATCH=CN3194_SOURCE_ENVFILE_DUPLICATE_PATH_GUARD'
 'PATCH=CN3195_STAGE_ENV_MINIMAL_OVERLAY_NO_PRODUCTION_ENV_COPY'
 'PATCH=CN3194_SOURCE_ENVFILES_REQUIRE_ROOT_MODE_600'
 'PATCH=CN3194_SOURCE_ENVFILES_REQUIRE_ROOT_MODE_600'
) -join "`n"
[IO.File]::WriteAllText($OverlayPath,$OverlayContent+"`n",(New-Object Text.UTF8Encoding($false)))
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
 @{Local=$ManifestPath;Name=$ManifestName;Size=(Get-Item -LiteralPath $ManifestPath).Length},
  @{Local=$OverlayPath;Name='cn3195-stage-overlay.env';Size=(Get-Item -LiteralPath $OverlayPath).Length}
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
Write-Host 'R2_CONTENT_CHECK_DOWNLOAD_VERIFY_START'
$VerifyRoot=Join-Path $Root ('.r2-verify-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $VerifyRoot | Out-Null
try{
 foreach($u in $Uploads){Copy-Item -LiteralPath $u.Local -Destination (Join-Path $VerifyRoot $u.Name) -Force}
 & $Rclone check $VerifyRoot $RemoteRoot --one-way --download
 if($LASTEXITCODE -ne 0){throw 'R2_REMOTE_CONTENT_CHECK_FAILED'}
 Write-Host 'R2_REMOTE_CONTENT_CHECK_DOWNLOAD_VERIFY_PASS_EXACT_SIX_ASSETS'
}finally{
 Remove-Item -LiteralPath $VerifyRoot -Recurse -Force -ErrorAction SilentlyContinue
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
 local tmp="${dest}.part"
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
echo 'STEP 5/6: STAGE-ONLY MODE — PRODUCTION PROMOTION IS NOT RUN'
echo "CN3195_STAGE_ONLY_PASS SOURCE_SHA=$SOURCE_SHA"
echo 'CN3195_ACTIVE_NGINX_UPSTREAM_UNCHANGED'
echo 'CN3194_PRODUCTION_PROMOTION_NOT_EXECUTED'
echo 'REVIEW_ALL_CN3195_ROUTE_AUTH_AND_HEALTH_OUTPUTS_BEFORE_SEPARATE_PROMOTION'
'@
$PromoteEcs=@'
#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
TAG='__TAG__'
SHORT='__SHORT__'
SOURCE_SHA='__SOURCE_SHA__'
STAGE_SHA='__STAGE_SHA__'
PAYMENT_SHA='__PAYMENT_SHA__'
BASE='/opt/lingxifield/cn-staged-releases'
DIR="$BASE/.download-$TAG"
STAGE="$DIR/__STAGE_FILE__"
PAYMENT="$DIR/__PAYMENT_FILE__"
[[ "$TAG" == "ecs-cn-unified-20261110-$SHORT" ]] || { echo CN_PROMOTION_TAG_MISMATCH;exit 1; }
[[ "$SOURCE_SHA" == '21367c6fb8d4067f23f9982256eacffc1c540d5c' ]] || { echo CN_PROMOTION_SOURCE_SHA_NOT_APPROVED;exit 1; }
[[ -f "$STAGE" && ! -L "$STAGE" && -f "$PAYMENT" && ! -L "$PAYMENT" ]] || { echo CN_PROMOTION_SCRIPTS_MISSING;exit 1; }
[[ "$(sha256sum "$STAGE" | awk '{print $1}')" == "$STAGE_SHA" ]] || { echo CN_PROMOTION_STAGE_SCRIPT_HASH_MISMATCH;exit 1; }
[[ "$(sha256sum "$PAYMENT" | awk '{print $1}')" == "$PAYMENT_SHA" ]] || { echo CN_PROMOTION_PAYMENT_SCRIPT_HASH_MISMATCH;exit 1; }
bash -n "$STAGE"
bash -n "$PAYMENT"
echo 'PROMOTION_PREFLIGHT: REVERIFY ISOLATED 3195 BEFORE ASKING FOR APPROVAL'
bash "$STAGE" --verify-stage "$TAG"
CONFIRM="PROMOTE-CN3194-$SHORT"
printf 'Type %s to switch production traffic from the current upstream to the verified CN3194 release: ' "$CONFIRM"
read -r ANSWER
[[ "$ANSWER" == "$CONFIRM" ]] || { echo CN3194_PROMOTION_CANCELLED;exit 1; }
echo 'CN3194_EXPLICIT_PROMOTION_CONFIRMATION_ACCEPTED'
bash "$STAGE" --promote "$TAG"
echo 'CN3194_POST_PROMOTION_SIGNED_MERCHANT_AUDIT_NO_CHARGE'
bash "$PAYMENT" --audit "$TAG"
PROVIDERS="$(mktemp /run/cn3194-providers-XXXXXX)"
trap 'rm -f "$PROVIDERS"' EXIT
curl --noproxy '*' -fsS --max-time 20 -H 'Host: lingxifield.cn' \
  http://127.0.0.1:3194/api/pay/providers > "$PROVIDERS"
python3 - "$PROVIDERS" <<'PY'
import json,sys
with open(sys.argv[1],encoding="utf-8") as f:
    data=json.load(f)
for name in ("wechat","alipay","paypal"):
    enabled=data.get(name) is True
    print("CN3194_PROVIDER_FLAG_"+name.upper()+"="+("ENABLED" if enabled else "DISABLED"))
    if not enabled: raise SystemExit("EXISTING_PROVIDER_FLAG_NOT_ENABLED:"+name)
PY
echo 'CN3194_PROMOTION_AND_SIGNED_AUDIT_PASS'
echo 'CN3194_NO_PAYMENT_OR_WALLET_FLAG_MUTATION'
echo 'SASI_SOFTWARE_SALES_REMAINS_CLOSED_UNTIL_REAL_SOURCE_ZIP_IS_UPLOADED_AND_HASH_VERIFIED'
echo 'CN3193_ROLLBACK_BASELINE_RETAINED'
'@
$PromoteMap=@{
 '__TAG__'=$Tag;'__SHORT__'=$Short;'__SOURCE_SHA__'=$Manifest.SOURCE_SHA;
 '__STAGE_SHA__'=$StageSha;'__PAYMENT_SHA__'=$PaymentSha;
 '__STAGE_FILE__'=$StageFile;'__PAYMENT_FILE__'=$PaymentFile
}
foreach($k in $PromoteMap.Keys){$PromoteEcs=$PromoteEcs.Replace($k,[string]$PromoteMap[$k])}
$PromotePath=Join-Path $Root "PASTE-IN-ALIYUN-CN3194-PROMOTE-$Short.sh"
[IO.File]::WriteAllText($PromotePath,$PromoteEcs,(New-Object Text.UTF8Encoding($false)))

$Map=@{
 '__TAG__'=$Tag;'__SOURCE_SHA__'=$Manifest.SOURCE_SHA;'__ARCHIVE_SHA__'=$ArchiveSha;'__ARCHIVE_BYTES__'=[string]$ArchiveBytes;
 '__CHECK_SHA__'=$CheckSha;'__STAGE_SHA__'=$StageSha;'__STAGE_BYTES__'=[string]$StageBytes;
 '__PAYMENT_SHA__'=$PaymentSha;'__PAYMENT_BYTES__'=[string]$PaymentBytes;
 '__ARCHIVE_FILE__'=$ArchiveFile;'__CHECK_FILE__'=$CheckFile;'__STAGE_FILE__'=$StageFile;'__PAYMENT_FILE__'=$PaymentFile;
 '__ARCHIVE_URL__'=$ArchiveUrl;'__CHECK_URL__'=$CheckUrl;'__STAGE_URL__'=$StageUrl;'__PAYMENT_URL__'=$PaymentUrl
}
foreach($k in $Map.Keys){$Ecs=$Ecs.Replace($k,[string]$Map[$k])}
$EcsPath=Join-Path $Root "PASTE-IN-ALIYUN-CN3195-STAGE-$Short.sh"
[IO.File]::WriteAllText($EcsPath,$Ecs,(New-Object Text.UTF8Encoding($false)))
try{Set-Clipboard -Value $Ecs;Write-Host 'CN3195_STAGE_SCRIPT_COPIED_TO_CLIPBOARD'}catch{Write-Host 'OPEN_THE_GENERATED_CN3195_STAGE_SCRIPT_FILE'}
Write-Host "R2_RELEASE_UPLOAD_COMPLETE: $RemoteRoot"
Write-Host "CN3195_STAGE_SCRIPT_SAVED: $EcsPath"
Write-Host "CN3194_PROMOTE_SCRIPT_SAVED_NOT_COPIED: $PromotePath"
Write-Host 'PRODUCTION_PROMOTION_REQUIRES_A_SEPARATE_SCRIPT_AND_TYPED_CONFIRMATION'
Write-Host 'SIGNED_URLS_EXPIRE_IN_6_HOURS_AND_ARE_NOT_PRINTED'
Write-Host 'NEXT: Paste the clipboard script into the Alibaba Cloud root Workbench terminal.'
