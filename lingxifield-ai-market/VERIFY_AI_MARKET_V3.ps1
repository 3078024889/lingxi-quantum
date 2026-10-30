# LINGXIFIELD AI Market V3: read-only Windows acceptance for local source.
# Directory: D:\30780\lingxi-quantum\lingxifield-ai-market
# PowerShell: powershell -NoProfile -ExecutionPolicy Bypass -File .\VERIFY_AI_MARKET_V3.ps1
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$Project = $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $Project 'package.json'))) {
    throw 'AI_MARKET_PROJECT_NOT_FOUND'
}
Push-Location -LiteralPath $Project
try {
    Write-Host '=== Source ===' -ForegroundColor Cyan
    Write-Host "PROJECT=$Project"
    $CurrentBranch = (& git rev-parse --abbrev-ref HEAD 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { throw 'GIT_STATUS_FAILED' }
    Write-Host "GIT_BRANCH=$CurrentBranch"
    Write-Host '=== Preserve local changes ===' -ForegroundColor Cyan
    & git status --short
    if ($LASTEXITCODE -ne 0) { throw 'GIT_STATUS_FAILED' }
    Write-Host '=== Toolchain ===' -ForegroundColor Cyan
    & node.exe --version
    if ($LASTEXITCODE -ne 0) { throw 'NODE_NOT_FOUND' }
    & npm.cmd --version
    if ($LASTEXITCODE -ne 0) { throw 'NPM_NOT_FOUND' }
    if (-not (Test-Path -LiteralPath (Join-Path $Project 'node_modules'))) {
        Write-Host 'Installing dependencies pinned by package-lock.json' -ForegroundColor Yellow
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw "NPM_CI_FAILED_$LASTEXITCODE" }
    }
    Write-Host '=== Data contracts, TypeScript and production build ===' -ForegroundColor Cyan
    & npm.cmd run gate
    if ($LASTEXITCODE -ne 0) { throw "AI_MARKET_GATE_FAILED_$LASTEXITCODE" }
    Write-Host '=== Static dependency audit (no source deleted) ===' -ForegroundColor Cyan
    & node.exe scripts/audit-obsolete-workspace.mjs
    if ($LASTEXITCODE -ne 0) { throw "AI_MARKET_AUDIT_FAILED_$LASTEXITCODE" }
    Write-Host '=== Result ===' -ForegroundColor Green
    Write-Host 'BUILD_GATE=PASS'
    Write-Host 'DELETION_PERFORMED=NO'
    Write-Host ('AUDIT_REPORT=' + (Join-Path $Project 'reports\obsolete-workspace-audit.json'))
    Write-Host 'Production deployment and 2GB server load tests require separate verification.'
}
finally { Pop-Location }
