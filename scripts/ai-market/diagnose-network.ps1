# Read-only network diagnosis. Results go only to D:.
param([string]$OutputDir='D:\30780\lingxi-ai-market-acceptance-ah\reports\ai-market-network')
$ErrorActionPreference='Continue'
if(-not $OutputDir.StartsWith('D:\',[System.StringComparison]::OrdinalIgnoreCase)){throw 'REPORT_MUST_BE_D_DRIVE'}
New-Item -ItemType Directory -Force -Path $OutputDir|Out-Null
$records=New-Object 'System.Collections.Generic.List[object]'
foreach($hostName in @('huggingface.co','github.com','api.github.com')){
 $dns=@();$dnsOk=$false;$tcpOk=$false
 try{$dns=@(Resolve-DnsName -Name $hostName -Type A -ErrorAction Stop|Where-Object IPAddress|Select-Object -ExpandProperty IPAddress);$dnsOk=$dns.Count -gt 0}catch{}
 $client=New-Object System.Net.Sockets.TcpClient
 try{$pending=$client.ConnectAsync($hostName,443);$tcpOk=$pending.Wait(5000) -and $client.Connected}catch{}finally{$client.Dispose()}
 $records.Add([pscustomobject]@{Host=$hostName;DNS=$dnsOk;IPv4=($dns -join ',');TCP443=$tcpOk})
}
$proxySettings=[pscustomobject]@{
 HTTPS_PROXY_configured=[bool]($env:HTTPS_PROXY -or $env:https_proxy)
 HTTP_PROXY_configured=[bool]($env:HTTP_PROXY -or $env:http_proxy)
 NODE_USE_ENV_PROXY=$env:NODE_USE_ENV_PROXY
}
$report=[pscustomobject]@{CapturedAt=(Get-Date).ToString('o');Checks=$records;Proxy=$proxySettings;Note='No passwords or proxy URL values recorded. DNS/TCP success does not guarantee TLS/API availability.'}
$report|ConvertTo-Json -Depth 6|Set-Content -LiteralPath (Join-Path $OutputDir 'network-diagnostic.json') -Encoding UTF8
$report|ConvertTo-Json -Depth 6
