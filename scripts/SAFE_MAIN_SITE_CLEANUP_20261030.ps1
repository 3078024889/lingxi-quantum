param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$Root = 'D:\30780\lingxi-quantum'
$ReportDir = 'D:\30780\AI_MARKET_CLEANUP_AUDIT'
if (-not (Test-Path -LiteralPath (Join-Path $Root '.git'))) { throw 'MAIN_REPOSITORY_NOT_FOUND' }
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
$Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
# Only explicitly named, reproducible caches. Never recursively search for arbitrary names.
$CachePaths = @('.next','test-results','test-out','tsconfig.tsbuildinfo')
$Candidates = @()
$GitRoot = (& git -C $Root rev-parse --show-toplevel)
if ($LASTEXITCODE -ne 0 -or [IO.Path]::GetFullPath(($GitRoot -join '').Trim()).TrimEnd('\') -ne [IO.Path]::GetFullPath($Root).TrimEnd('\')) { throw 'GIT_ROOT_MISMATCH' }
$Active = @(Get-CimInstance Win32_Process | Where-Object {
  $_.Name -match '^(node|npm|pnpm|yarn|next)(\.exe|\.cmd)?$' -and $_.CommandLine -and $_.CommandLine.Contains($Root)
})
if ($Apply -and $Active.Count -gt 0) { throw 'MAIN_SITE_PROCESS_RUNNING_NO_CLEANUP' }
foreach ($Relative in $CachePaths) {
 $Path = Join-Path $Root $Relative
 if (-not (Test-Path -LiteralPath $Path)) { continue }
 $Item = Get-Item -LiteralPath $Path -Force
 if (($Item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw "CACHE_IS_REPARSE_POINT: $Relative" }
 $Tracked = @(& git -C $Root ls-files -- $Relative)
 if ($LASTEXITCODE -ne 0) { throw 'GIT_TRACK_CHECK_FAILED' }
 $InIndex = @(& git -C $Root ls-files --cached -- $Relative)
 if ($Tracked.Count -gt 0 -or $InIndex.Count -gt 0) { throw "TRACKED_CACHE_BLOCKED: $Relative" }
 $Candidates += [pscustomobject]@{Relative=$Relative;Path=$Path;Type=if($Item.PSIsContainer){'directory'}else{'file'};Action=if($Apply){'DELETE'}else{'PREVIEW_ONLY'}}
}
$Report = Join-Path $ReportDir "main-safe-caches-$Stamp.json"
$Candidates | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $Report -Encoding UTF8
$Candidates | Format-Table -AutoSize
if ($Apply) {
 foreach ($Item in $Candidates) {
  # No links within a cache directory: stop rather than traversing uncertain paths.
  if ($Item.Type -eq 'directory') {
   $Links = @(Get-ChildItem -LiteralPath $Item.Path -Recurse -Force -Attributes ReparsePoint -ErrorAction SilentlyContinue)
   if ($Links.Count -gt 0) { throw "CACHE_CONTAINS_LINKS: $($Item.Relative)" }
  }
  Remove-Item -LiteralPath $Item.Path -Recurse -Force
  if (Test-Path -LiteralPath $Item.Path) { throw "DELETE_FAILED: $($Item.Relative)" }
  Write-Host "[REMOVED] $($Item.Relative)" -ForegroundColor Green
 }
}
Write-Host "MODE=$(if($Apply){'APPLIED'}else{'PREVIEW'})"
Write-Host "REPORT=$Report"
Write-Host "CORE_SOURCE_DELETED=0"
Write-Host "HISTORICAL_BACKUPS_DELETED=0"
