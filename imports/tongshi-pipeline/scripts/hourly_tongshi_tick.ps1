$ErrorActionPreference='Continue'
$root='D:\lingxi-quantum\imports\tongshi-pipeline'
$log=Join-Path $root 'manifests\hourly-tick.log'
"$(Get-Date -Format o) tick" | Add-Content $log
$feed=Join-Path $root 'scripts\daily_tongshi_feed.ps1'
if(Test-Path $feed){ & $feed }
