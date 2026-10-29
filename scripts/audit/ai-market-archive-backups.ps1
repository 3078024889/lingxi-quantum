$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
if($root -ne 'D:\30780\lingxi-quantum'){throw 'Unexpected root'}
$dest=Join-Path $root '_local/ai-market-archives'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
$log=@()
foreach($dir in Get-ChildItem -LiteralPath $root -Directory | Where-Object Name -Match '^lingxifield-ai-market(?:-v\d+)?-backup-\d'){
 $target=[IO.Path]::GetFullPath($dir.FullName)
 if(!$target.StartsWith($root+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe path'}
 $all=@(Get-ChildItem -LiteralPath $target -Recurse -Force)
 if($all | Where-Object {($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -or $_.Name -like '.env*' -or $_.Name -eq '.git'}){continue}
 if(@(git -C $root ls-files -- ($dir.Name+'/')).Count){throw 'Tracked backup'}
 $zip=Join-Path $dest ($dir.Name+'.zip')
 if(Test-Path -LiteralPath $zip){throw 'Archive already exists; do not overwrite'}
 [IO.Compression.ZipFile]::CreateFromDirectory($target,$zip)
 $a=[IO.Compression.ZipFile]::OpenRead($zip)
 try{foreach($f in $all | Where-Object {!$_.PSIsContainer}){
  $e=$a.GetEntry($f.FullName.Substring($target.Length+1).Replace('\','/'))
  if(!$e -or $e.Length -ne $f.Length){throw 'Archive mismatch'}
  $stream=$e.Open();$sha=[Security.Cryptography.SHA256]::Create()
  try{$h=[Convert]::ToHexString($sha.ComputeHash($stream))}finally{$stream.Dispose();$sha.Dispose()}
  if($h -ne (Get-FileHash -LiteralPath $f.FullName).Hash){throw 'Archive hash mismatch'}
 }}finally{$a.Dispose()}
 Remove-Item -LiteralPath $target -Recurse -Force
 $log += [pscustomobject]@{removed=$target;recoveryArchive=$zip;verified=$true}
}
foreach($f in Get-ChildItem -LiteralPath $root -File -Filter 'LINGXIFIELD_*.zip'){
 $target=Join-Path $dest $f.Name
 if(Test-Path -LiteralPath $target){throw 'Existing destination'}
 Move-Item -LiteralPath $f.FullName -Destination $target
 $log += [pscustomobject]@{moved=$f.FullName;recoveryArchive=$target}
}
$log | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $root '_local/ai-market-integration/archives.json') -Encoding utf8
$log | Format-Table -AutoSize
