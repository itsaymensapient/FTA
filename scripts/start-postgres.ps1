# Start local PostgreSQL 17 service (Windows). Prefer this over Azure for the stand.
$ErrorActionPreference = 'Stop'
$names = @(
  'postgresql-x64-17',
  'postgresql-x64-16',
  'postgresql-x64-15',
  'postgresql-x64-14'
)

$svc = $null
foreach ($n in $names) {
  $svc = Get-Service -Name $n -ErrorAction SilentlyContinue
  if ($svc) { break }
}
if (-not $svc) {
  $svc = Get-Service -Name 'postgresql*' -ErrorAction SilentlyContinue | Select-Object -First 1
}
if (-not $svc) {
  Write-Error "No PostgreSQL Windows service found. Install PostgreSQL 17 locally."
  exit 1
}

if ($svc.Status -ne 'Running') {
  try {
    Start-Service -Name $svc.Name
  } catch {
    Write-Error "Could not start $($svc.Name). Run VS Code/terminal as Administrator once, or start the service in services.msc. $_"
    exit 1
  }
}

Get-Service -Name $svc.Name | Format-Table Name, Status, DisplayName -AutoSize
Write-Host "Local Postgres service ready: $($svc.Name)"
Write-Host "Seed with LOCAL_PGUSER / LOCAL_PGPASSWORD in .env then: cd db; npm run migrate:seed"
