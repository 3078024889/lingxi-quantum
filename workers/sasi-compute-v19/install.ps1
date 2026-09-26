param([string]$Python="python")
$ErrorActionPreference="Stop"
$Here=Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Here
if(-not (Test-Path ".\.venv")){& $Python -m venv .venv}
if($LASTEXITCODE -ne 0){ throw "venv creation failed" }
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
if($LASTEXITCODE -ne 0){ throw "pip upgrade failed" }
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt
if($LASTEXITCODE -ne 0){ throw "dependency installation failed" }
Write-Host "SASI_NATIVE_WORKER_INSTALL=PASS"
Write-Host "Next: copy .env.example to .env, fill secrets/R2, then run:"
Write-Host ".\.venv\Scripts\python.exe run.py"
