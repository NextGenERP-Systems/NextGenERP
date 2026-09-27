param(
    [switch]$ConfirmProductionMigration
)

$ErrorActionPreference = 'Stop'

if (-not $ConfirmProductionMigration) {
    throw 'Blocked for safety. Pass -ConfirmProductionMigration only after backup, restore verification, and migration review.'
}
if ([string]::IsNullOrWhiteSpace($env:SPRING_DATASOURCE_USERNAME) -or
    [string]::IsNullOrWhiteSpace($env:SPRING_DATASOURCE_PASSWORD)) {
    throw 'SPRING_DATASOURCE_USERNAME and SPRING_DATASOURCE_PASSWORD are required.'
}
if ([string]::IsNullOrWhiteSpace($env:SPRING_FLYWAY_BASELINE_ON_MIGRATE)) {
    throw 'Set SPRING_FLYWAY_BASELINE_ON_MIGRATE explicitly to true only for a reviewed pre-Flyway schema; otherwise set it to false.'
}

Write-Host 'Running MRP Flyway migrations only; the API and frontend will not be started.' -ForegroundColor Yellow
docker compose -f docker-compose.yml -f docker-compose.migration.yml run --build --rm mrp-backend
if ($LASTEXITCODE -ne 0) {
    throw "MRP migration job failed with exit code $LASTEXITCODE."
}
Write-Host 'MRP Flyway migration job completed successfully.' -ForegroundColor Green
