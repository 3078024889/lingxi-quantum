$ErrorActionPreference="Continue"
$stamp = Get-Date -Format "yyyy-MM-dd"
$root = "D:\lingxi-quantum\imports\tongshi-pipeline"
$tw = "D:\copernicus-twentywatts\body\imports\tongshi-pipeline"
$logDir = Join-Path $root "manifests"
New-Item -ItemType Directory -Force -Path $logDir,(Join-Path $root "compressed\cards"),(Join-Path $tw "compressed\cards"),(Join-Path $tw "manifests") | Out-Null
$log = Join-Path $logDir ("daily-feed-" + $stamp + ".log")
function W([string]$m){ Add-Content -Path $log -Value ((Get-Date -Format o) + " " + $m) -Encoding UTF8 }
W "START real daily tongshi feed (anti-theater) v2"

$crawler = "C:\Users\30780\fill-hist-first.ps1"
if (-not (Test-Path $crawler)) { W "FAIL missing crawler"; exit 2 }

# Run with explicit exit capture (nested powershell)
$p = Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoProfile","-ExecutionPolicy","Bypass","-File",$crawler) -Wait -PassThru -WindowStyle Hidden
$code = $p.ExitCode
W ("crawler exit=" + $code)

$cardName = "tongshi-science-hist-geo-" + $stamp + ".jsonl"
$cardPath = Join-Path $root ("compressed\cards\" + $cardName)
$n = 0
if (Test-Path $cardPath) {
  $n = @(Get-Content $cardPath -ErrorAction SilentlyContinue | Where-Object { $_.Trim().Length -gt 0 }).Count
}
W ("cards_on_disk n=" + $n + " path=" + $cardPath)

# Dual-feed whatever exists for stamp
foreach ($srcRoot in @($root)) {
  $srcCards = Join-Path $srcRoot "compressed\cards"
  Get-ChildItem $srcCards -Filter ("*" + $stamp + "*") -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $tw ("compressed\cards\" + $_.Name)) -Force
    W ("dual " + $_.Name)
  }
}

$status = if ($n -gt 0) { "ok" } else { "fail_empty" }
$yield = [ordered]@{
  at = (Get-Date -Format o)
  n_cards = $n
  file = $cardName
  crawler_exit = $code
  anti_theater = $true
  status = $status
  note = "v2 wake-hardened; empty=fail"
}
$yj = $yield | ConvertTo-Json -Depth 5
$yp = Join-Path $logDir ("YIELD-daily-" + $stamp + ".json")
[System.IO.File]::WriteAllText($yp, $yj, [System.Text.UTF8Encoding]::new($false))
Copy-Item $yp (Join-Path $tw ("manifests\YIELD-daily-" + $stamp + ".json")) -Force
W ("YIELD status=" + $status + " n=" + $n)
if ($n -le 0) { W "DONE_FAIL"; exit 1 }
W "DONE_OK"
exit 0