param([string]$RepoRoot="D:\lingxi-quantum")
$ErrorActionPreference="Stop"
Set-Location $RepoRoot

Write-Host "Scanning source-shaped files for real secret literals..."

$roots=@("app","components","lib","scripts","supabase","docs")
$allowedExt=@(".ts",".tsx",".js",".mjs",".cjs",".sql",".md",".json",".txt",".yml",".yaml",".toml",".env",".example")
$bad=@()
$readErrors=@()

function Add-Hit([string]$file,[string]$kind){
  $script:bad += "$file :: $kind"
}

foreach($rootName in $roots){
  $rootPath=Join-Path $RepoRoot $rootName
  if(!(Test-Path $rootPath)){continue}

  Get-ChildItem -Path $rootPath -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -notmatch "\\node_modules\\|\\.next\\|\\.lingxi-backup-" -and
      ($allowedExt -contains $_.Extension.ToLowerInvariant() -or $_.Name -like "*.env.example")
    } |
    ForEach-Object {
      $f=$_
      try{
        $content=[System.IO.File]::ReadAllText($f.FullName)

        # 1) OpenAI-style secret keys: require a long token, not docs placeholders.
        if([regex]::IsMatch($content,'(?<![A-Za-z0-9])sk-[A-Za-z0-9_-]{28,}(?![A-Za-z0-9])')){
          Add-Hit $f.FullName "OPENAI_STYLE_SECRET"
        }

        # 2) Aliyun-style access key id: concrete token only.
        if([regex]::IsMatch($content,'(?<![A-Za-z0-9])AKLT[A-Za-z0-9]{16,}(?![A-Za-z0-9])')){
          Add-Hit $f.FullName "ALIYUN_ACCESS_KEY_ID"
        }

        # 3) Actual PEM private key block: BEGIN + substantial base64 body + matching END.
        #    This intentionally does NOT flag comments/docs that merely mention the PEM header.
        if([regex]::IsMatch(
          $content,
          '-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----\s+[A-Za-z0-9+/=\r\n]{80,}\s+-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
          [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        )){
          Add-Hit $f.FullName "PRIVATE_KEY_BLOCK"
        }

        # 4) Environment-style assignments: ignore documented placeholders such as
        #    <service-role-key>, YOUR_KEY, xxx, process.env..., ${...}.
        $lines=$content -split "`r?`n"
        foreach($line in $lines){
          if($line -match '^\s*(SUPABASE_SERVICE_ROLE_KEY|SASI_BYOK_ENCRYPTION_KEY)\s*=\s*(.+?)\s*$'){
            $name=$matches[1]
            $value=$matches[2].Trim().Trim('"').Trim("'")
            $placeholder = (
              $value -match '^<[^>]+>$' -or
              $value -match '^(YOUR_|REPLACE_|EXAMPLE_|CHANGEME|xxx+|placeholder)' -or
              $value -match '^\$\{' -or
              $value -match '^process\.env\.' -or
              $value -match '^\*+$'
            )
            if(-not $placeholder -and $value.Length -ge 20){
              Add-Hit $f.FullName "$name concrete assignment"
            }
          }
        }
      } catch {
        $readErrors += "$($f.FullName) :: $($_.Exception.Message)"
      }
    }
}

if($readErrors.Count -gt 0){
  Write-Host "WARN unreadable text files (showing first 20):" -ForegroundColor DarkYellow
  $readErrors | Select-Object -First 20 | ForEach-Object { Write-Host ("  "+$_) -ForegroundColor DarkYellow }
}

if($bad.Count -gt 0){
  $bad | Select-Object -First 50 | ForEach-Object { Write-Host $_ -ForegroundColor Red }
  throw "V11803_SECRET_SCAN_FAILED"
}

Write-Host "PASS no real secret literals found." -ForegroundColor Green
