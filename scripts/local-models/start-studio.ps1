param([string]$RuntimeRoot='D:\SASI-local-runtime')
$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath($RuntimeRoot)
$python=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\workers\sasi-compute-v19\.venv\Scripts\python.exe'))
if (!(Test-Path -LiteralPath $python)) { throw 'Create the worker Python venv first. local_studio.py uses only Python standard libraries.' }
$model=Join-Path $root 'models\Qwen3-0.6B-Q8_0.gguf'
$exe=Join-Path $root 'llama\llama-server.exe'
if (!(Test-Path -LiteralPath $model) -or !(Test-Path -LiteralPath $exe)) { throw 'Provision text-runtime and text-model first.' }
if (!(Get-NetTCPConnection -LocalPort 8766 -State Listen -ErrorAction SilentlyContinue)) {
  Start-Process -FilePath $exe -ArgumentList @('-m',('"'+$model+'"'),'--host','127.0.0.1','--port','8766','-c','4096','-t','4','-ngl','0','--parallel','1','--alias','SASI-local-Qwen') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'llama.stdout.log') -RedirectStandardError (Join-Path $root 'llama.stderr.log') | Out-Null
}
if (!(Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue)) {
  $script=Join-Path $PSScriptRoot 'local_studio.py'
  Start-Process -FilePath $python -ArgumentList @(('"'+$script+'"'),'--root',('"'+$root+'"')) -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'studio.stdout.log') -RedirectStandardError (Join-Path $root 'studio.stderr.log') | Out-Null
}
Write-Host 'Open http://127.0.0.1:8765 in your browser. Startup may take a few seconds.'
Write-Host 'This is local testing, not a public production deployment. No paid model API is used.'
