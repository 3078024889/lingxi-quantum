param([int]$Port=8787,[string]$Secret="")
$ErrorActionPreference="Stop"
$Soffice="C:\Program Files\LibreOffice\program\soffice.exe"
if(-not(Test-Path -LiteralPath $Soffice)){throw "LibreOffice Writer is required: $Soffice"}
if([string]::IsNullOrWhiteSpace($Secret)){$Secret=[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).ToLowerInvariant()}
$env:SOFFICE_PATH=$Soffice;$env:PORT="$Port";$env:HOST="127.0.0.1";$env:LINGXIFIELD_DOCUMENT_CONVERTER_SECRET=$Secret
Write-Host "LINGXIFIELD_DOCUMENT_CONVERTER_URL=http://127.0.0.1:$Port"
Write-Host "LINGXIFIELD_DOCUMENT_CONVERTER_SECRET=$Secret"
node "$PSScriptRoot\server.mjs"
