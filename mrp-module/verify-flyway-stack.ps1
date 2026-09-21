# Verify the versioned MRP migrations against a disposable PostgreSQL database.
# This script never connects to the cloud database or the normal Compose profile.
$ErrorActionPreference = 'Stop'
$project = 'mrp-flyway-verification'
$compose = @('-p', $project, '-f', 'docker-compose.test.yml', '-f', 'docker-compose.flyway-test.yml')

try {
    docker compose @compose down -v
    docker compose @compose up -d --build
    if ($LASTEXITCODE -ne 0) { throw 'The disposable Flyway stack failed to start.' }

    $runtime = $null
    for ($attempt = 1; $attempt -le 40; $attempt++) {
        try {
            $runtime = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/runtime/database' -TimeoutSec 2
            break
        } catch {
            if ($attempt -eq 40) { throw }
            Start-Sleep -Seconds 2
        }
    }

    if ($runtime.databaseName -ne 'nextgen_mrp' -or $runtime.status -ne 'UP') {
        throw "Unexpected runtime identity: $($runtime | ConvertTo-Json -Compress)"
    }
    if ($null -eq $runtime.migrationVersion -or [int]$runtime.migrationVersion -lt 29) {
        throw "Flyway did not apply the current migrations: $($runtime | ConvertTo-Json -Compress)"
    }
    Write-Host "Flyway stack verified: database=$($runtime.databaseName), migration=$($runtime.migrationVersion), status=$($runtime.status)"
} finally {
    docker compose @compose down -v | Out-Host
}
