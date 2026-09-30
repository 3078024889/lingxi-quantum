param([string]$RepoRoot="D:\lingxi-quantum")
$ErrorActionPreference="Stop"
Set-Location $RepoRoot
function Fail($m){Write-Host "V1601_VERIFY=FAIL";throw $m}
Write-Host "========================================="
Write-Host "LINGXIFIELD V1601 REAL VERIFY"
Write-Host "========================================="

$ratio=git grep -n -I -E 'USD_HALF_RMB|amountFen/2|amountFen / 2|USD number is always half' -- '*.ts' '*.tsx' '*.js' '*.mjs' 2>$null
if($LASTEXITCODE -eq 0 -and $ratio){Write-Host $ratio;Fail "Fixed CNY/USD ratio remains"}
Write-Host "CNY_USD_FIXED_RATIO_REMOVED=PASS"

$legacy=git grep -n -I 'AI_RETAIL_MULTIPLIER' -- '*.ts' '*.tsx' '*.js' '*.mjs' 2>$null
if($LASTEXITCODE -eq 0 -and $legacy){Write-Host $legacy;Fail "Legacy AI_RETAIL_MULTIPLIER remains"}
Write-Host "LEGACY_RETAIL_MULTIPLIER_REMOVED=PASS"

node -e "const fs=require('fs');const s=fs.readFileSync('lib/pricing/policy.ts','utf8');if(!s.includes('MINIMUM_GROSS_MARGIN = 0.45')||!s.includes('1-targetGrossMargin'))process.exit(2)"
if($LASTEXITCODE -ne 0){Fail "45% margin policy missing"}
Write-Host "MARGIN_45_POLICY=PASS"

node -e "const fs=require('fs');const s=fs.readFileSync('lib/sasi/video-pricing.ts','utf8');for(const x of ['retailFenPerSecond','supplierFenPerSecond','retailUsdCentsPerSecond','supplierUsdCentsPerSecond','assertMarginFloor'])if(!s.includes(x))process.exit(2)"
if($LASTEXITCODE -ne 0){Fail "Independent video rate fields missing"}
Write-Host "DUAL_RATE_BOOK=PASS"

git diff --check
if($LASTEXITCODE -ne 0){Fail "git diff --check failed"}
Write-Host "GIT_DIFF_CHECK=PASS"

# TypeScript compiler directly because package.json has no typecheck script.
npx tsc --noEmit
if($LASTEXITCODE -ne 0){Fail "TypeScript failed"}
Write-Host "TYPECHECK=PASS"

npm run audit:security
if($LASTEXITCODE -ne 0){Fail "security audit failed"}
Write-Host "SECURITY_AUDIT=PASS"

npm run audit:sasi-v5
if($LASTEXITCODE -ne 0){Fail "SASI V5 audit failed"}
Write-Host "SASI_V5_AUDIT=PASS"

npm run build
if($LASTEXITCODE -ne 0){Fail "production build failed"}
Write-Host "PRODUCTION_BUILD=PASS"

Write-Host "========================================="
Write-Host "V1601_VERIFY=PASS"
Write-Host "CURRENT_HEAD=$((git rev-parse HEAD).Trim())"
Write-Host "WORKTREE_HAS_UNCOMMITTED_V1601=YES"
Write-Host "DB_MIGRATION_AUTO_APPLIED=NO"
Write-Host "VERCEL_ENV_AUTO_CHANGED=NO"
Write-Host "PACKAGE_SAFE_TO_DELETE=NO"
Write-Host "NEXT=Send this complete output to ChatGPT for diff review before commit/push."
Write-Host "========================================="
