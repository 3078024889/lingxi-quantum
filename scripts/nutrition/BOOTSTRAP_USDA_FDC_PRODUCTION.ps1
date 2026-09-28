param(
  [string]$RepoRoot="D:\lingxi-quantum",
  [switch]$IncludeBranded
)
$ErrorActionPreference="Stop"
function Fail([string]$m){Write-Host "FAIL=$m" -ForegroundColor Red;exit 1}
Set-Location $RepoRoot

function Load-DotEnv([string]$path){
 if(-not(Test-Path $path)){return}
 foreach($line in Get-Content $path -Encoding UTF8){
  $x=$line.Trim()
  if(-not $x -or $x.StartsWith("#") -or -not $x.Contains("=")){continue}
  $pair=$x.Split("=",2);$name=$pair[0].Trim();$value=$pair[1].Trim().Trim('"').Trim("'")
  if($name -in @("NEXT_PUBLIC_SUPABASE_URL","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY") -and -not [Environment]::GetEnvironmentVariable($name)){
   [Environment]::SetEnvironmentVariable($name,$value,"Process")
  }
 }
}
Load-DotEnv (Join-Path $RepoRoot ".env.local")
Load-DotEnv (Join-Path $RepoRoot ".env")

if(-not($env:NEXT_PUBLIC_SUPABASE_URL -or $env:SUPABASE_URL)){Fail "SUPABASE_URL_REQUIRED"}
if(-not $env:SUPABASE_SERVICE_ROLE_KEY){Fail "SUPABASE_SERVICE_ROLE_KEY_REQUIRED"}

$stage=Join-Path $RepoRoot "_local\usda-fdc-2026"
New-Item -ItemType Directory -Force -Path $stage|Out-Null

$sets=@(
 @{Name="foundation-2026-04";Url="https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_csv_2026-04-30.zip";Kinds="foundation"},
 @{Name="sr-legacy-2018-04";Url="https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip";Kinds="legacy"},
 @{Name="fndds-2021-2023";Url="https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_survey_food_csv_2024-10-31.zip";Kinds="survey"}
)
if($IncludeBranded){
 $sets+=@{Name="branded-2026-04";Url="https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_branded_food_csv_2026-04-30.zip";Kinds="branded"}
}

foreach($set in $sets){
 $zip=Join-Path $stage "$($set.Name).zip"
 $dest=Join-Path $stage $set.Name
 if(-not(Test-Path $zip)){
  Write-Host "DOWNLOAD=$($set.Name)"
  Invoke-WebRequest -Uri $set.Url -OutFile $zip -UseBasicParsing
 }
 if(-not(Test-Path $dest)){
  New-Item -ItemType Directory -Force -Path $dest|Out-Null
  Expand-Archive -LiteralPath $zip -DestinationPath $dest -Force
 }
 $food=Get-ChildItem -Path $dest -Filter "food.csv" -Recurse -File | Select-Object -First 1
 if(-not $food){Fail "FOOD_CSV_NOT_FOUND_$($set.Name)"}
 $folder=$food.Directory.FullName
 Write-Host "IMPORT=$($set.Name) FOLDER=$folder"
 node scripts/nutrition/import-usda-fdc.mjs "$folder" "$($set.Kinds)"
 if($LASTEXITCODE -ne 0){Fail "USDA_IMPORT_$($set.Name)"}
}

node scripts/nutrition/seed-common-food-aliases.mjs
if($LASTEXITCODE -ne 0){Fail "USDA_ALIAS_SEED"}

node scripts/nutrition/verify-usda-import.mjs
if($LASTEXITCODE -ne 0){Fail "USDA_VERIFY"}

Write-Host "USDA_FDC_PRODUCTION_BOOTSTRAP=PASS"
Write-Host "USDA_STAGE=$stage"
