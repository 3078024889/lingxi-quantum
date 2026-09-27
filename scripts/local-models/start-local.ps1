param(
  [ValidateSet('text','image','video')][string]$Capability = 'text',
  [string]$RuntimeRoot = 'D:\SASI-local-runtime',
  [string]$Prompt = 'A small red house beside a lake, watercolor illustration',
  [ValidateRange(128,512)][int]$Size = 256,
  [ValidateRange(1,30)][int]$Steps = 8
)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($RuntimeRoot)
if ($Capability -eq 'video') {
  throw 'Video is not validated on this 4GB GPU. No paid API fallback will be used. See README.md.'
}
if ($Capability -eq 'text') {
  $exe = Join-Path $root 'llama\llama-server.exe'
  $model = Join-Path $root 'models\Qwen3-0.6B-Q8_0.gguf'
  if (!(Test-Path -LiteralPath $exe) -or !(Test-Path -LiteralPath $model)) { throw 'Run provision.py text-runtime text-model first.' }
  Write-Host 'SASI local text: http://127.0.0.1:8766 (no paid model API; keep this terminal running)'
  & $exe -m $model --host 127.0.0.1 --port 8766 -c 4096 -t 4 -ngl 0 --parallel 1 --alias SASI-local-Qwen
} else {
  $exe = Join-Path $root 'sd\sd-cli.exe'
  $model = Join-Path $root 'models\sd-v1-5.safetensors'
  if (!(Test-Path -LiteralPath $exe) -or !(Test-Path -LiteralPath $model)) { throw 'Run provision.py image-runtime image-model first.' }
  if ($Prompt.Length -gt 2000) { throw 'Prompt must be at most 2000 characters.' }
  if ($Size % 64 -ne 0) { throw 'Size must be a multiple of 64.' }
  $folder = Join-Path $root 'outputs'
  New-Item -ItemType Directory -Path $folder -Force | Out-Null
  $output = Join-Path $folder ('image-' + [guid]::NewGuid().ToString() + '.png')
  & $exe -m $model -p $Prompt -o $output -W $Size -H $Size --steps $Steps --type q8_0 --cfg-scale 7 --sampling-method euler -t 4
  if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $output)) { throw 'Image generation failed; no result was accepted.' }
  Write-Host "Generated: $output"
}
if ($LASTEXITCODE -ne 0) { throw "Local inference exited with code $LASTEXITCODE" }
