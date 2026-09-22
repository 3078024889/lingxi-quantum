param(
  [string]$RepoRoot="D:\lingxi-quantum",
  [int]$Port=3011
)
$ErrorActionPreference="Stop"
if(!(Test-Path $RepoRoot)){throw "RepoRoot not found: $RepoRoot"}

Set-Location $RepoRoot
$base="http://127.0.0.1:$Port"
$stdout=Join-Path $RepoRoot ".v101-acceptance-server.out.log"
$stderr=Join-Path $RepoRoot ".v101-acceptance-server.err.log"

Remove-Item $stdout,$stderr -Force -ErrorAction SilentlyContinue

Write-Host "Starting production server on port $Port..." -ForegroundColor Cyan
$proc=Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npm run start -- -p $Port" -WorkingDirectory $RepoRoot -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -WindowStyle Hidden

try{
  $ready=$false
  for($i=0;$i -lt 45;$i++){
    Start-Sleep -Seconds 1
    try{
      $r=Invoke-WebRequest -Uri $base -UseBasicParsing -TimeoutSec 2
      if($r.StatusCode -eq 200){$ready=$true;break}
    }catch{}
    if($proc.HasExited){break}
  }

  if(!$ready){
    Write-Host "Server did not become ready." -ForegroundColor Red
    if(Test-Path $stdout){Get-Content $stdout -Tail 80}
    if(Test-Path $stderr){Get-Content $stderr -Tail 80}
    throw "Acceptance server startup failed."
  }

  Write-Host "Server ready. Running acceptance..." -ForegroundColor Green
  node .\scripts\accept-v101.mjs $RepoRoot $base
  if($LASTEXITCODE -ne 0){throw "Acceptance checks failed."}
}
finally{
  if($proc -and !$proc.HasExited){
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  }
  Write-Host "Acceptance server stopped." -ForegroundColor DarkGray
}
