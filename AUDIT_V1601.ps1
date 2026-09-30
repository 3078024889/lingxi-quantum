param([string]$RepoRoot="D:\lingxi-quantum")
$ErrorActionPreference="Stop"
Set-Location $RepoRoot
function Fail($m){Write-Host "V1601_AUDIT=FAIL";throw $m}
Write-Host "========================================="
Write-Host "V1601 REAL ACCEPTANCE"
Write-Host "========================================="

$ratio = git grep -n -I -E '美元.{0,30}(一半|除以.?2)|USD.{0,30}(half|CNY.?/.?2)|amountUsd.{0,50}amountRmb|amountRmb.{0,50}amountUsd' -- '*.ts' '*.tsx' '*.js' '*.mjs' 2>$null
if($LASTEXITCODE -eq 0 -and $ratio){Write-Host $ratio;Fail "CNY/USD coupling remains"}
Write-Host "CNY_USD_INDEPENDENCE_STATIC=PASS"

$mult = git grep -n -I -E 'AI_RETAIL_MULTIPLIER.{0,40}([=:].*4|["'']4["''])' -- '*.ts' '*.tsx' '*.js' '*.mjs' 2>$null
if($LASTEXITCODE -eq 0 -and $mult){Write-Host $mult;Fail "Legacy 4x retail authority remains"}
Write-Host "LEGACY_4X_RETAIL_DEFAULT=REMOVED"

$margin = git grep -n -I -E 'targetGrossMargin|grossMargin|0\.45|0\.55' -- 'lib/**/*.ts' 'server/**/*.ts' 'app/**/*.ts' 2>$null
if(!($LASTEXITCODE -eq 0 -and $margin)){Fail "Margin guard not found"}
Write-Host "MARGIN_GUARD_PRESENT=PASS"

git diff --check
if($LASTEXITCODE -ne 0){Fail "git diff --check failed"}
Write-Host "GIT_DIFF_CHECK=PASS"

$pkg=Get-Content package.json -Raw|ConvertFrom-Json
if($pkg.scripts.typecheck){npm run typecheck;if($LASTEXITCODE -ne 0){Fail "typecheck failed"};Write-Host "TYPECHECK=PASS"}
if($pkg.scripts.lint){npm run lint;if($LASTEXITCODE -ne 0){Fail "lint failed"};Write-Host "LINT=PASS"}

npm run build
if($LASTEXITCODE -ne 0){Fail "production build failed"}
Write-Host "PRODUCTION_BUILD=PASS"

Write-Host "========================================="
Write-Host "V1601_AUDIT=PASS"
Write-Host "COMMIT=$((git rev-parse HEAD).Trim())"
Write-Host "DB_MIGRATION_AUTO_APPLIED=NO"
Write-Host "VERCEL_ENV_AUTO_CHANGED=NO"
Write-Host "========================================="
