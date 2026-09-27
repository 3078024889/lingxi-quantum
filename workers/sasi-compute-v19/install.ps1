param([string]$Python="python")
$ErrorActionPreference="Stop"
$Here=Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Here
if(-not (Test-Path ".\.venv")){& $Python -m venv .venv}
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt
Write-Host "SASI_NATIVE_WORKER_INSTALL=PASS"
Write-Host "Next: copy .env.example to .env, fill secrets/R2, then run:"
Write-Host ".\.venv\Scripts\python.exe run.py"
