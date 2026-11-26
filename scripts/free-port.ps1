param(
  [Parameter(Mandatory = $false)]
  [string]$Ports = '8787,5173'
)

$ErrorActionPreference = 'SilentlyContinue'
$portList = @()
foreach ($part in ($Ports -split '[, ]+')) {
  if ($part -match '^\d+$') { $portList += [int]$part }
}
if ($portList.Count -eq 0) { $portList = @(8787, 5173) }

foreach ($port in $portList) {
  $conns = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
  if ($conns.Count -eq 0) {
    Write-Host "Port $port is free"
    continue
  }
  foreach ($c in $conns) {
    $procId = $c.OwningProcess
    if ($procId -and $procId -gt 0) {
      Write-Host "Freeing port $port (PID $procId)"
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
  }
  Start-Sleep -Milliseconds 400
  $still = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($still) {
    Write-Warning "Port $port still in use"
  } else {
    Write-Host "Port $port freed"
  }
}
