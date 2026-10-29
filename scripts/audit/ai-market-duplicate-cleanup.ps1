param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
if ($root -ne 'D:\30780\lingxi-quantum') { throw 'Unexpected cleanup root' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$results = @()
foreach ($zip in Get-ChildItem -LiteralPath $root -File -Filter 'LINGXIFIELD_*.zip') {
  $target = [IO.Path]::GetFullPath((Join-Path $root $zip.BaseName))
  if (!(Test-Path -LiteralPath $target -PathType Container)) { continue }
  if (!(($target + '\').StartsWith($root + '\',[StringComparison]::OrdinalIgnoreCase))) { throw 'Outside root' }
  $children = @(Get-ChildItem -LiteralPath $target -Recurse -Force)
  if ($children | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint -or $_.Name -eq '.git' -or $_.Name -like '.env*' }) { continue }
  $files = @($children | Where-Object { !$_.PSIsContainer })
  $archive = [IO.Compression.ZipFile]::OpenRead($zip.FullName)
  $identical = $files.Count -gt 0
  $bytes = 0L
  try {
    foreach ($file in $files) {
      $rel = $file.FullName.Substring($target.Length+1).Replace('\','/')
      $entry = $archive.GetEntry($rel)
      if (!$entry) { $entry = $archive.GetEntry($zip.BaseName + '/' + $rel) }
      if (!$entry -or $entry.Length -ne $file.Length) { $identical=$false; break }
      $stream=$entry.Open(); $sha=[Security.Cryptography.SHA256]::Create()
      try { $hash=[Convert]::ToHexString($sha.ComputeHash($stream)) } finally { $stream.Dispose();$sha.Dispose() }
      if ($hash -ne (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash) {$identical=$false;break}
      $bytes += $file.Length
    }
  } finally { $archive.Dispose() }
  $deleted=$false
  if ($Apply -and $identical) {
    # Exact untracked extracted duplicate; archive remains available for recovery.
    $tracked = @(git -C $root ls-files -- ($zip.BaseName + '/'))
    if ($tracked.Count -gt 0) { throw 'Tracked files in cleanup target' }
    Remove-Item -LiteralPath $target -Recurse -Force
    $deleted=!(Test-Path -LiteralPath $target)
  }
  $results += [pscustomobject]@{target=$target;archive=$zip.FullName;files=$files.Count;identical=$identical;bytes=$bytes;deleted=$deleted}
}
$folder=Join-Path $root '_local/ai-market-integration'
New-Item -ItemType Directory -Force -Path $folder | Out-Null
$results | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $folder 'duplicate-cleanup.json') -Encoding utf8
$results | Format-Table target,files,identical,bytes,deleted -AutoSize
