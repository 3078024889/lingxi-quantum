param(
 [Parameter(Mandatory=$true)][string]$Domain,
 [string]$OutputPath=".env"
)
$ErrorActionPreference="Stop"
function New-Secret([int]$bytes=48){
 $b=New-Object byte[] $bytes
 [System.Security.Cryptography.RandomNumberGenerator]::Fill($b)
 return [Convert]::ToBase64String($b).Replace("+","-").Replace("/","_").TrimEnd("=")
}
$got=New-Secret 36
$gw=New-Secret 48
@"
DOCUMENT_GATEWAY_DOMAIN=$Domain
GOTENBERG_BASIC_USER=lingxifield
GOTENBERG_BASIC_PASSWORD=$got
LINGXIFIELD_DOCUMENT_GATEWAY_SECRET=$gw
LINGXIFIELD_ALLOWED_ORIGINS=https://lingxifield.com,https://lingxifield.cn
"@ | Set-Content -Path $OutputPath -Encoding UTF8
Write-Host "ENV_FILE=$OutputPath"
Write-Host "VERCEL_LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL=https://$Domain"
Write-Host "VERCEL_LINGXIFIELD_DOCUMENT_GATEWAY_SECRET=$gw"
Write-Host "SECRETS_GENERATED=PASS"
