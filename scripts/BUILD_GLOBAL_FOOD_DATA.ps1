param(
 [string]$RepoRoot="D:\lingxi-quantum",
 [string]$DataRoot="D:\lingxifield-food-data",
 [switch]$DownloadUSDA
)
$ErrorActionPreference="Stop"
$release="2026-04-30"
$url="https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_csv_2026-04-30.zip"
$zip=Join-Path $DataRoot "FoodData_Central_csv_$release.zip"
$extract=Join-Path $DataRoot "usda-$release"
New-Item -ItemType Directory -Force -Path $DataRoot | Out-Null
if($DownloadUSDA){
 Write-Host "USDA_DOWNLOAD_START=$url"
 Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
 if((Get-Item $zip).Length -lt 100MB){throw "USDA_DOWNLOAD_TOO_SMALL"}
 Write-Host "USDA_DOWNLOAD_BYTES=$((Get-Item $zip).Length)"
 if(Test-Path $extract){Remove-Item $extract -Recurse -Force}
 Expand-Archive -Path $zip -DestinationPath $extract -Force
 Write-Host "USDA_EXTRACT=PASS"
}
$food=Get-ChildItem $extract -Recurse -Filter "food.csv" -ErrorAction SilentlyContinue | Select-Object -First 1
if(!$food){throw "USDA_FOOD_CSV_NOT_FOUND. Run again with -DownloadUSDA."}
$dir=$food.Directory.FullName
Push-Location $RepoRoot
try{
 node ".\scripts\import-usda-fooddata.mjs" $dir
 if($LASTEXITCODE -ne 0){throw "USDA_SQL_BUILD_FAILED"}
 Write-Host "GLOBAL_FOOD_DATA_BUILD=PASS"
 Write-Host "PRODUCTION_IMPORT_APPLIED=NO"
}finally{Pop-Location}
