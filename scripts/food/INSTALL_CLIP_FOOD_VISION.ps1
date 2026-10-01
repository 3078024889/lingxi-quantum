param([string]$RepoRoot="D:\lingxi-quantum")
$ErrorActionPreference="Stop"
$dest=Join-Path $RepoRoot "public\models\Xenova\clip-vit-base-patch32"
New-Item -ItemType Directory -Force -Path (Join-Path $dest "onnx") | Out-Null
$revision=(Invoke-RestMethod 'https://huggingface.co/api/models/Xenova/clip-vit-base-patch32').sha
$base="https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/$revision"
$files=@("config.json","merges.txt","preprocessor_config.json","special_tokens_map.json","tokenizer.json","tokenizer_config.json","vocab.json")
foreach($name in $files){ & curl.exe -f -L --retry 2 --max-time 120 "$base/$name" -o (Join-Path $dest $name); if($LASTEXITCODE -ne 0){throw "Download failed: $name"} }
$hashes=@{"text_model_quantized.onnx"="73baab855d406190da9faa498cfedf65f15cf309f4cc7385b7b032e6d08e5c3a";"vision_model_quantized.onnx"="583fd1110a514667812fee7d684952aaf82a99b959760c8d7dca7e0ab9839299"}
foreach($name in $hashes.Keys){
 $target=Join-Path $dest "onnx\$name"
 if(-not(Test-Path -LiteralPath $target)){ & curl.exe -f -L --retry 2 --max-time 300 "$base/onnx/$name" -o $target; if($LASTEXITCODE -ne 0){throw "Download failed: $name"} }
 if((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hashes[$name]){throw "Hash mismatch: $name"}
}
$manifest=@{installed=$true;variant="q8-split";remoteModels=$false;revision=$revision;model="Xenova/clip-vit-base-patch32";sha256=$hashes;source="https://huggingface.co/Xenova/clip-vit-base-patch32";license="MIT (OpenAI CLIP)"}|ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText((Join-Path $dest "lingxifield-manifest.json"),$manifest,(New-Object System.Text.UTF8Encoding($false)))
& curl.exe -f -L 'https://raw.githubusercontent.com/openai/CLIP/main/LICENSE' -o (Join-Path $dest 'LICENSE')
Write-Host "CLIP_FOOD_VISION_INSTALL=PASS"
