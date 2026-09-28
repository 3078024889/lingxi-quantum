param([string]$RepoRoot="D:\lingxi-quantum")
$ErrorActionPreference="Stop"
function Fail([string]$m){Write-Host "FAIL=$m" -ForegroundColor Red;exit 1}
Set-Location $RepoRoot
$dest=Join-Path $RepoRoot "public\models\Xenova\clip-vit-base-patch32"
$onnx=Join-Path $dest "onnx"
New-Item -ItemType Directory -Force -Path $onnx|Out-Null
$base="https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/main"
$small=@("config.json","merges.txt","preprocessor_config.json","special_tokens_map.json","tokenizer.json","tokenizer_config.json","vocab.json")
foreach($name in $small){
 $target=Join-Path $dest $name
 if(-not(Test-Path $target)){Invoke-WebRequest -Uri "$base/$name" -OutFile $target -UseBasicParsing}
}
$model=Join-Path $onnx "model_q4f16.onnx"
if(-not(Test-Path $model)){
 Write-Host "DOWNLOADING_CLIP_Q4F16=~126MB"
 Invoke-WebRequest -Uri "$base/onnx/model_q4f16.onnx" -OutFile $model -UseBasicParsing
}
$hash=(Get-FileHash -Algorithm SHA256 -LiteralPath $model).Hash.ToLowerInvariant()
$expected="0fa5651801a45889d15576d445b23172f706be5b5d17f6d96a61b486cf4a5252"
if($hash -ne $expected){Remove-Item $model -Force;Fail "CLIP_SHA256_MISMATCH"}
$manifest=@{
 installed=$true
 model="Xenova/clip-vit-base-patch32"
 task="zero-shot-image-classification"
 file="onnx/model_q4f16.onnx"
 sha256=$expected
 license="MIT model wrapper; upstream OpenAI CLIP weights. Verify redistribution terms before bundling in commercial release."
 source="https://huggingface.co/Xenova/clip-vit-base-patch32"
 installedAt=(Get-Date).ToUniversalTime().ToString("o")
}|ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText((Join-Path $dest "lingxifield-manifest.json"),$manifest,(New-Object System.Text.UTF8Encoding($false)))
Write-Host "CLIP_FOOD_VISION_INSTALL=PASS"
Write-Host "MODEL_PATH=$model"
