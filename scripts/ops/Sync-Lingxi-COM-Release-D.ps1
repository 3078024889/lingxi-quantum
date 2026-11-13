$ErrorActionPreference = 'Stop'
$RepoRoot = 'D:\30780\lingxi-quantum'
$Worktree = 'D:\30780\lingxi-quantum-com-release'
$Branch = 'cleanup/com-retired-sasi-full-20261113'
$TempRoot = 'D:\30780\_tmp'

if (-not (Get-Volume -DriveLetter D -ErrorAction SilentlyContinue)) { throw 'D_DRIVE_NOT_AVAILABLE' }
if ($RepoRoot -notmatch '^D:\\' -or $Worktree -notmatch '^D:\\' -or $TempRoot -notmatch '^D:\\') { throw 'PROJECT_TEMP_AND_WORKTREE_MUST_REMAIN_ON_D_DRIVE' }
if (-not (Test-Path -LiteralPath $RepoRoot -PathType Container)) { throw "REPOSITORY_NOT_FOUND: $RepoRoot" }

New-Item -ItemType Directory -Force -Path $TempRoot | Out-Null
$env:TEMP = $TempRoot
$env:TMP = $TempRoot

Write-Host 'D_DRIVE_ONLY_COM_SYNC_START'
git -C $RepoRoot fetch --prune origin $Branch
if ($LASTEXITCODE -ne 0) { throw 'GIT_FETCH_FAILED' }

if (Test-Path -LiteralPath $Worktree) {
    $status = @(git -C $Worktree status --porcelain)
    if ($LASTEXITCODE -ne 0) { throw 'WORKTREE_STATUS_FAILED' }
    if ($status.Count -gt 0) { throw 'WORKTREE_DIRTY_STOP_NO_FILES_OVERWRITTEN' }
    git -C $Worktree reset --hard "origin/$Branch"
    if ($LASTEXITCODE -ne 0) { throw 'WORKTREE_FAST_FORWARD_RESET_FAILED' }
} else {
    git -C $RepoRoot worktree add --detach $Worktree "origin/$Branch"
    if ($LASTEXITCODE -ne 0) { throw 'GIT_WORKTREE_ADD_FAILED' }
}

$Head = (git -C $Worktree rev-parse HEAD).Trim()
$RemoteHead = (git -C $RepoRoot rev-parse "origin/$Branch").Trim()
if ($Head -ne $RemoteHead) { throw 'WORKTREE_SOURCE_SHA_MISMATCH' }

$Tracked = @(git -C $Worktree ls-tree -r --name-only HEAD)
if ($LASTEXITCODE -ne 0) { throw 'GIT_TREE_READ_FAILED' }

$ReportPath = Join-Path $Worktree 'docs/operations/legacy-sasi-retirement-20261108.json'
$Report = Get-Content -LiteralPath $ReportPath -Raw | ConvertFrom-Json
foreach ($p in $Report.removed) {
    if ($Tracked -contains [string]$p) { throw "RETIRED_PATH_STILL_TRACKED: $p" }
    if ($Tracked | Where-Object { $_.StartsWith(([string]$p).TrimEnd('/') + '/') }) { throw "RETIRED_DIRECTORY_CONTENT_REMAINS: $p" }
}

$LibFiles = @($Tracked | Where-Object { $_ -match '^lib/sasi/.*\.ts$' } | Sort-Object)
$Allowed = @($Report.preservedLibFiles | Sort-Object)
if (($LibFiles -join "`n") -ne ($Allowed -join "`n")) { throw 'LIB_SASI_PRESERVE_ALLOWLIST_MISMATCH' }

$ApiFiles = @($Tracked | Where-Object { $_ -match '^app/api/sasi/.*/route\.ts$' })
$Unexpected = @($ApiFiles | Where-Object {
    $_ -ne 'app/api/sasi/[[...legacy]]/route.ts' -and
    $_ -ne 'app/api/sasi/account/route.ts' -and
    -not $_.StartsWith('app/api/sasi/marketplace/') -and
    -not $_.StartsWith('app/api/sasi/software/')
})
if ($Unexpected.Count -gt 0) { throw ('LEGACY_SASI_API_REMAINS: ' + ($Unexpected -join ',')) }

$ForbiddenCopy = '(?i)AI短剧生成|短剧生成|AI视频生成|文生视频|图生视频|书本智能体|学习智能体|科研智能体|AI网站生成|AI short drama generator|AI video generator|book to AI agent|AI research assistant|AI study assistant|AI website builder'
foreach ($f in @('lib/lingxi-i18n.ts','components/HomeProblemHub.tsx','components/SasiLegalBody.tsx','miniapp/README.md','docs/seo/keyword-map-v216.md','public/seo-keywords-9lang.json','public/llms.txt','public/llms-full.txt')) {
    $content = Get-Content -LiteralPath (Join-Path $Worktree $f) -Raw
    if ($content -match $ForbiddenCopy) { throw "RETIRED_PUBLIC_COPY_FOUND: $f" }
}
if (-not (Test-Path -LiteralPath (Join-Path $Worktree 'public/images/sasi/sasi-market-hero-lingxifield.png'))) { throw 'NEW_SASI_MARKET_HERO_MISSING' }
if (Test-Path -LiteralPath (Join-Path $Worktree 'lib/sasi/site-origin.ts')) { throw 'RETIRED_SASI_SITE_ORIGIN_HELPER_REMAINS' }

Write-Host 'D_DRIVE_ONLY_COM_SYNC_PASS'
Write-Host "BRANCH=$Branch"
Write-Host "SOURCE_SHA=$Head"
Write-Host "WORKTREE=$Worktree"
Write-Host 'NO_C_DRIVE_PROJECT_DATA_WRITTEN'
