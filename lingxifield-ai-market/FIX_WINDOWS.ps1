$ErrorActionPreference = 'Stop'
$Project = 'D:\30780\lingxi-quantum\lingxifield-ai-market-demo\lingxifield-ai-market-demo'
Set-Location -LiteralPath $Project
if (-not (Test-Path -LiteralPath (Join-Path $Project 'package.json'))) { throw 'PROJECT_NOT_FOUND' }
$backup = Join-Path $Project ('.build_config_backup_' + (Get-Date -Format 'yyyyMMdd_HHmmss'))
New-Item -ItemType Directory -Path $backup -Force | Out-Null
foreach ($filename in @('package.json','next.config.js','postcss.config.cjs')) {
    $original = Join-Path $Project $filename
    if (Test-Path -LiteralPath $original) { Copy-Item -LiteralPath $original -Destination $backup }
}
@'
module.exports = { plugins: { autoprefixer: {} } };
'@ | Set-Content -LiteralPath (Join-Path $Project 'postcss.config.cjs') -Encoding UTF8
@'
/** @type {import('next').NextConfig} */
module.exports = { outputFileTracingRoot: __dirname };
'@ | Set-Content -LiteralPath (Join-Path $Project 'next.config.js') -Encoding UTF8
Write-Host '=== Install project-local PostCSS dependencies ===' -ForegroundColor Cyan
& npm.cmd install --save-dev autoprefixer@^10 postcss@^8
if ($LASTEXITCODE -ne 0) { throw 'NPM_INSTALL_FAILED' }
Write-Host '=== Check local dependency resolution ===' -ForegroundColor Cyan
& node -e "for(const n of ['next','postcss','autoprefixer']) console.log(n, require.resolve(n, {paths:[process.cwd()]}))"
if ($LASTEXITCODE -ne 0) { throw 'MODULE_RESOLUTION_FAILED' }
Write-Host '=== Production build ===' -ForegroundColor Cyan
& npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'BUILD_FAILED' }
Write-Host 'BUILD_PASS' -ForegroundColor Green
Write-Host "Config backup: $backup"
Write-Host 'Now run: npm.cmd run dev -- -p 3001'
