# Run against ONLY a disposable local PostgreSQL database.
# Requires a local PostgreSQL install with psql in PATH. No remote connections.
param(
 [string]$Repo='D:\30780\lingxi-ai-market-acceptance-ah',
 [string]$HostName='127.0.0.1',
 [int]$Port=54329,
 [string]$Database='lingxi_ai_market_disposable',
 [string]$Username='postgres',
 [switch]$ConfirmDisposable
)
$ErrorActionPreference='Stop'
if(-not $ConfirmDisposable){ throw 'Pass -ConfirmDisposable only for a newly created, disposable local database.' }
if($HostName -notin @('127.0.0.1','localhost','::1')){throw 'LOCAL_DATABASE_ONLY'}
if($Database -ne 'lingxi_ai_market_disposable'){throw 'DISPOSABLE_DB_NAME_REQUIRED'}
if(-not(Get-Command psql -ErrorAction SilentlyContinue)){throw 'PostgreSQL psql is not installed. No database operations performed.'}
$Files=@(
 'scripts/ai-market/local-postgres-bootstrap.sql',
 'supabase/migrations/20261029_ai_market_data_center_a.sql',
 'supabase/migrations/20261029_ai_market_metrics_b.sql',
 'supabase/migrations/20261029_ai_market_h_integration_missing_tables.sql',
 'supabase/migrations/20261029_ai_market_vendor_f.sql',
 'supabase/migrations/20261029_ai_market_payment_ledger_h.sql',
 'scripts/ai-market/local-db-security-probe.sql'
)
foreach($f in $Files){if(-not(Test-Path -LiteralPath (Join-Path $Repo $f))){throw "Missing $f"}}
$env:PGHOST=$HostName;$env:PGPORT="$Port";$env:PGDATABASE=$Database;$env:PGUSER=$Username
$env:PGSSLMODE='disable'
$env:PGCONNECT_TIMEOUT='5'
Write-Host 'Local-only disposable SQL migration: no production environment variables are used.' -ForegroundColor Cyan
foreach($f in $Files){
 Write-Host "[MIGRATION] $f" -ForegroundColor Cyan
 & psql -X -h $HostName -p $Port -U $Username -d $Database -v ON_ERROR_STOP=1 -1 -f (Join-Path $Repo $f)
 if($LASTEXITCODE -ne 0){throw "Database migration failed: $f"}
}
$Probe=@"
select count(*) as ai_market_tables from information_schema.tables where table_schema='public' and table_name like 'ai_market_%';
select schemaname,tablename,rowsecurity from pg_tables where schemaname='public' and tablename like 'ai_market_%' order by tablename;
"@
$Probe | & psql -X -h $HostName -p $Port -U $Username -d $Database -v ON_ERROR_STOP=1
if($LASTEXITCODE -ne 0){throw 'Migration probes failed'}
Write-Host '[LOCAL MIGRATION PASS] Next: inspect permissions, data ingestion, rollback, and authentic Supabase staging.' -ForegroundColor Green
