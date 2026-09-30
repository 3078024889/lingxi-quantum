param([string]$RepoRoot="D:\lingxi-quantum",[string]$DataRoot="D:\lingxifield-food-data")
$ErrorActionPreference="Stop"
$food=Get-ChildItem $DataRoot -Recurse -Filter "food.csv" -ErrorAction SilentlyContinue|Select-Object -First 1
if(!$food){throw "USDA_EXTRACTED_DATA_NOT_FOUND"}
$dir=$food.Directory.FullName
$out=Join-Path $RepoRoot "docs\generated-fooddata-v2"
New-Item -ItemType Directory -Force -Path $out|Out-Null
Write-Host "USDA_REUSE_EXISTING_DATA=YES"
Write-Host "USDA_CSV_DIR=$dir"
Push-Location $RepoRoot
try{
 node ".\scripts\import-usda-fooddata-v2.mjs" $dir $out
 if($LASTEXITCODE -ne 0){throw "USDA_STREAM_BUILD_FAILED"}
 $manifest=Join-Path $out "IMPORT_MANIFEST.json"
 if(!(Test-Path $manifest)){throw "IMPORT_MANIFEST_MISSING"}
 $m=Get-Content $manifest -Raw|ConvertFrom-Json
 if([int64]$m.counts.food -lt 1 -or [int64]$m.counts.food_nutrient -lt 1){throw "IMPORT_COUNTS_INVALID"}
 Write-Host "USDA_STREAM_COUNTS=PASS"
 Write-Host "DATABASE_IMPORT_APPLIED=NO"
 Write-Host "PACKAGE_SAFE_TO_DELETE=NO"
 Write-Host "LINGXIFIELD_GLOBAL_FOOD_DATA_ENGINE_V2=PASS"
}finally{Pop-Location}
