# Enable trust auth for 127.0.0.1 so local stand can use postgres with no password.
# Then set a local app password 'gitex' and write LOCAL_PG* into .env.
$ErrorActionPreference = 'Stop'
$hba = 'C:\Program Files\PostgreSQL\17\data\pg_hba.conf'
$pgCtl = 'C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe'
$psql = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'
$dataDir = 'C:\Program Files\PostgreSQL\17\data'

if (-not (Test-Path $hba)) { throw "pg_hba.conf not found at $hba" }

$backup = "$hba.bak-gitex"
if (-not (Test-Path $backup)) { Copy-Item $hba $backup }

$raw = Get-Content $hba -Raw
$updated = [regex]::Replace(
  $raw,
  '(?m)^(host\s+all\s+all\s+127\.0\.0\.1/32\s+)scram-sha-256\s*$',
  '${1}trust'
)
$updated = [regex]::Replace(
  $updated,
  '(?m)^(host\s+all\s+all\s+::1/128\s+)scram-sha-256\s*$',
  '${1}trust'
)
Set-Content -Path $hba -Value $updated -Encoding ascii

& $pgCtl reload -D $dataDir | Out-Host

# Connect with trust (no password) and set a known local password for tooling.
$env:PGPASSWORD = ''
& $psql -U postgres -h 127.0.0.1 -d postgres -v ON_ERROR_STOP=1 -c "ALTER USER postgres PASSWORD 'gitex';" | Out-Host

# Restore scram so empty/trust isn't permanent, then password 'gitex' works.
Copy-Item $backup $hba -Force
& $pgCtl reload -D $dataDir | Out-Host

Write-Host 'Local postgres password set to gitex (scram restored).'
