param([string]$RepoRoot="D:\lingxi-quantum")
$ErrorActionPreference="Stop"
Set-Location $RepoRoot

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " SASI V11.30 · PRODUCTION MIGRATION PREFLIGHT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/5] Local migration reconciliation..." -ForegroundColor Yellow
node "scripts\sasi-final\reconcile-cognitive-migrations-v1130.mjs" $RepoRoot
if($LASTEXITCODE -ne 0){throw "SASI_COGNITIVE_MIGRATION_RECONCILIATION_FAILED"}

Write-Host ""
Write-Host "[2/5] Production snapshot reminder..." -ForegroundColor Yellow
Write-Host "Production currently has foundation/kernel/BYOK SASI migrations." -ForegroundColor Cyan
Write-Host "Cognitive/self-evolution migrations are not yet confirmed applied." -ForegroundColor Cyan

Write-Host ""
Write-Host "[3/5] Operator allowlist..." -ForegroundColor Yellow
$envFile=".env.local"
if(Test-Path $envFile){
 $line=Get-Content $envFile -Encoding UTF8 | Where-Object {$_ -match "^\s*SASI_OPERATOR_EMAILS="} | Select-Object -First 1
 if($line){
   Write-Host "SASI_OPERATOR_EMAILS: SET / VALUE NOT PRINTED" -ForegroundColor Green
 }else{
   Write-Host "SASI_OPERATOR_EMAILS: MISSING" -ForegroundColor DarkYellow
 }
}else{
 Write-Host ".env.local missing" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "[4/5] Safety..." -ForegroundColor Yellow
Write-Host "No SQL executed against production." -ForegroundColor Green
Write-Host "No provider request made." -ForegroundColor Green
Write-Host "No deployment performed." -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] Result" -ForegroundColor Yellow
Write-Host "V11.30 PRODUCTION MIGRATION PREFLIGHT PASSED." -ForegroundColor Green
