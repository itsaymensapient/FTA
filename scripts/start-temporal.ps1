$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$logDirectory = Join-Path $env:TEMP 'fta-temporal'
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null

$serverReady = Test-NetConnection -ComputerName 127.0.0.1 -Port 7233 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $serverReady) {
    $temporalCommand = Get-Command temporal.exe -ErrorAction SilentlyContinue
    if ($temporalCommand) {
        $temporalPath = $temporalCommand.Source
    } else {
        $packageRoot = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
        $temporalPath = Get-ChildItem -Path $packageRoot -Filter 'Temporal.TemporalCLI*' -Directory -ErrorAction SilentlyContinue |
            ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Filter 'temporal.exe' -File -Recurse } |
            Select-Object -First 1 -ExpandProperty FullName
    }
    if (-not $temporalPath) { throw 'Temporal CLI not found. Install Temporal.TemporalCLI with winget.' }
    $database = Join-Path $logDirectory 'temporal.db'
    Start-Process -FilePath $temporalPath -ArgumentList @('server', 'start-dev', '--ip', '127.0.0.1', '--db-filename', "`"$database`"") -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'server.log') -RedirectStandardError (Join-Path $logDirectory 'server-error.log')
    $deadline = (Get-Date).AddSeconds(30)
    do {
        Start-Sleep -Milliseconds 500
        $serverReady = Test-NetConnection -ComputerName 127.0.0.1 -Port 7233 -InformationLevel Quiet -WarningAction SilentlyContinue
    } until ($serverReady -or (Get-Date) -ge $deadline)
    if (-not $serverReady) { throw "Temporal did not start. Check $logDirectory\server-error.log" }
}

$worker = Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^python(w)?(\.exe)?$' -and $_.CommandLine -match '(?i)\bagents\.temporal_worker\b' } | Select-Object -First 1
if (-not $worker) {
    $python = (Get-Command python.exe -ErrorAction Stop).Source
    $worker = Start-Process -FilePath $python -ArgumentList '-m', 'agents.temporal_worker' -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'worker.log') -RedirectStandardError (Join-Path $logDirectory 'worker-error.log') -PassThru
    $deadline = (Get-Date).AddSeconds(30)
    do {
        Start-Sleep -Milliseconds 500
        $worker.Refresh()
        if ($worker.HasExited) { throw "Temporal worker exited. Check $logDirectory\worker-error.log" }
        $ready = (Test-Path (Join-Path $logDirectory 'worker.log')) -and (Select-String -Path (Join-Path $logDirectory 'worker.log') -Pattern 'FTA Temporal worker ready' -Quiet)
    } until ($ready -or (Get-Date) -ge $deadline)
    if (-not $ready) { throw "Temporal worker did not become ready. Check $logDirectory\worker-error.log" }
}
Write-Host 'Temporal server and worker ready. UI: http://localhost:8233'
