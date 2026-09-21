$ErrorActionPreference = 'Continue'
$srcRoot = Join-Path $PSScriptRoot 'codex-digest-2026-09-18'
if (-not (Test-Path -LiteralPath $srcRoot)) {
  # when extracted from tgz beside script
  $srcRoot = Join-Path (Get-Location) 'codex-digest-2026-09-18'
}
$targets = @(
  'D:\lingxi-quantum\knowledge\codex-digest-2026-09-18',
  'D:\copernicus-twentywatts\copernicus-twentywatts\body\codex-digest-2026-09-18',
  'D:\copernicus-twentywatts\body\codex-digest-2026-09-18',
  'D:\二十瓦特\copernicus-twentywatts\body\codex-digest-2026-09-18'
)
# also check alternate twenty-watts roots
Get-ChildItem -Path 'D:\' -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'twenty|二十|copernicus' } | ForEach-Object {
  $cand = Join-Path $_.FullName 'body\codex-digest-2026-09-18'
  if ($targets -notcontains $cand) { $targets += $cand }
  $cand2 = Join-Path $_.FullName 'copernicus-twentywatts\body\codex-digest-2026-09-18'
  if ($targets -notcontains $cand2) { $targets += $cand2 }
}
Write-Output "SRC=$srcRoot"
$files = Get-ChildItem -LiteralPath $srcRoot -File
Write-Output "SRC_FILES=$($files.Count)"
foreach ($t in $targets) {
  $parent = Split-Path -Parent $t
  if (-not (Test-Path -LiteralPath $parent)) {
    Write-Output "SKIP_MISSING_PARENT=$t"
    continue
  }
  New-Item -ItemType Directory -Force -Path $t | Out-Null
  Copy-Item -Force -Path (Join-Path $srcRoot '*') -Destination $t
  $n = (Get-ChildItem -LiteralPath $t -File | Measure-Object).Count
  $align = Join-Path $t 'ALIGNMENT.json'
  Write-Output "WROTE=$t FILES=$n ALIGN=$(Test-Path -LiteralPath $align)"
}
# inventory source codex if present
$codex = 'D:\lingxi-quantum\content\cangxuan-feed\field-source-mind\extracts\codex'
if (Test-Path -LiteralPath $codex) {
  $cn = (Get-ChildItem -LiteralPath $codex -Filter '*.txt' -File | Measure-Object).Count
  Write-Output "LIVE_CODEX_TXT=$cn"
} else {
  Write-Output 'LIVE_CODEX_TXT=MISSING'
}
