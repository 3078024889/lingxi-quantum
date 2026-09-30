param([string]$RepoRoot="D:\lingxi-quantum")
$ErrorActionPreference="Stop"
Set-Location $RepoRoot
function Fail([string]$m){Write-Host "LINGXIFIELD_FINAL_VERIFY=FAIL";throw $m}
function Pass([string]$m){Write-Host ($m+"=PASS")}

$need=@(
"lib/pricing/policy.ts",
"lib/sasi/video-pricing.ts",
"app/api/account/notifications/route.ts",
"app/account/notifications/page.tsx",
"components/AccountNotificationsPanel.tsx",
"supabase/migrations/20260929030000_lingxifield_notifications_v1602.sql"
)
foreach($p in $need){if(!(Test-Path $p)){Fail("MISSING: "+$p)}}
Pass "INTEGRATED_FILES_PRESENT"

$pricing=[IO.File]::ReadAllText((Resolve-Path "lib/pricing/policy.ts"))
if(!$pricing.Contains("0.45")){Fail("45 percent margin policy missing")}
Pass "MARGIN_POLICY_PRESENT"

$video=[IO.File]::ReadAllText((Resolve-Path "lib/sasi/video-pricing.ts"))
if(!$video.Contains("retailUsdCentsPerSecond")){Fail("independent USD video book missing")}
if($video.Contains("Math.ceil(amountFen/2)")){Fail("legacy RMB-to-USD half conversion remains in video pricing")}
Pass "INDEPENDENT_CNY_USD_VIDEO_PRICING"

$api=[IO.File]::ReadAllText((Resolve-Path "app/api/account/notifications/route.ts"))
if(!$api.Contains("isSameOriginMutation(req)")){Fail("notification mutation origin guard missing")}
if(!$api.Contains("balance_withdrawals")){Fail("withdrawal events missing")}
if(!$api.Contains("lingxifield_announcements")){Fail("announcement events missing")}
Pass "FUNDS_NOTIFICATION_API"

$m=[IO.File]::ReadAllText((Resolve-Path "supabase/migrations/20260929030000_lingxifield_notifications_v1602.sql"))
if(!$m.Contains("enable row level security")){Fail("notification RLS missing")}
if(!$m.Contains("service_role")){Fail("notification service role boundary missing")}
Pass "NOTIFICATION_RLS"

$empty="supabase/migrations/20260929005612_sasi_byok_video_service_fee.sql"
if((Test-Path $empty) -and ((Get-Item $empty).Length -eq 0)){Fail("zero-byte migration remains")}
Pass "ZERO_BYTE_MIGRATION_GUARD"

git diff --check
if($LASTEXITCODE -ne 0){Fail("git diff check failed")}
Pass "GIT_DIFF_CHECK"

npx tsc --noEmit
if($LASTEXITCODE -ne 0){Fail("typescript failed")}
Pass "TYPECHECK"

npm run audit:security
if($LASTEXITCODE -ne 0){Fail("security audit failed")}
Pass "SECURITY_AUDIT"

npm run audit:sasi-v5
if($LASTEXITCODE -ne 0){Fail("SASI V5 audit failed")}
Pass "SASI_V5_AUDIT"

npm run build
if($LASTEXITCODE -ne 0){Fail("production build failed")}
Pass "PRODUCTION_BUILD"

Write-Host "========================================="
Write-Host "LINGXIFIELD_FINAL_VERIFY=PASS"
Write-Host "INCLUDES_V1601_PRICING_CHECK=YES"
Write-Host "INCLUDES_V1602_NOTIFICATIONS_CHECK=YES"
Write-Host "DB_MIGRATION_AUTO_APPLIED=NO"
Write-Host "GIT_PUSH_AUTO=NO"
Write-Host "PRODUCTION_DEPLOYED=NO"
Write-Host "PACKAGE_SAFE_TO_DELETE=NO"
Write-Host "NEXT=Send final output to ChatGPT for migration/commit/deploy gate."
Write-Host "========================================="
