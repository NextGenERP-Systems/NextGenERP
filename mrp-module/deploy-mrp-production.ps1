[CmdletBinding(SupportsShouldProcess)]
param(
    [switch]$ConfirmProductionDeployment
)

$ErrorActionPreference = 'Stop'

if (-not $ConfirmProductionDeployment) {
    throw 'Production deployment is disabled by default. Re-run with -ConfirmProductionDeployment after backup and migration review.'
}

$requiredVariables = @(
    'MRP_BACKEND_IMAGE',
    'MRP_FRONTEND_IMAGE',
    'SPRING_DATASOURCE_URL',
    'SPRING_DATASOURCE_USERNAME',
    'SPRING_DATASOURCE_PASSWORD',
    'SPRING_MIGRATION_USERNAME',
    'SPRING_MIGRATION_PASSWORD'
)

foreach ($name in $requiredVariables) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
        throw "Required production environment variable is missing: $name"
    }
}

if ($env:SPRING_DATASOURCE_URL -notmatch '/nextgen_mrp(?:[?]|$)') {
    throw 'SPRING_DATASOURCE_URL must target the single nextgen_mrp database.'
}

docker compose -f docker-compose.production.yml config --quiet
if ($LASTEXITCODE -ne 0) {
    throw 'Production Compose configuration validation failed.'
}

if ($PSCmdlet.ShouldProcess('MRP production deployment', 'Run database migration and start versioned services')) {
    docker compose -f docker-compose.production.yml --profile migration run --rm mrp-migration
    if ($LASTEXITCODE -ne 0) { throw 'MRP production migration failed; application services were not started.' }

    docker compose -f docker-compose.production.yml up -d mrp-backend mrp-frontend
    if ($LASTEXITCODE -ne 0) { throw 'MRP production application startup failed.' }

    docker compose -f docker-compose.production.yml ps

    $backendPort = if ([string]::IsNullOrWhiteSpace($env:MRP_BACKEND_PORT)) { '8085' } else { $env:MRP_BACKEND_PORT }
    $frontendPort = if ([string]::IsNullOrWhiteSpace($env:MRP_FRONTEND_PORT)) { '3005' } else { $env:MRP_FRONTEND_PORT }
    $healthChecks = @(
        @{ Name = 'backend'; Uri = "http://localhost:$backendPort/actuator/health" },
        @{ Name = 'frontend'; Uri = "http://localhost:$frontendPort" }
    )
    foreach ($check in $healthChecks) {
        $healthy = $false
        for ($attempt = 1; $attempt -le 12; $attempt++) {
            try {
                $response = Invoke-WebRequest -Uri $check.Uri -UseBasicParsing -TimeoutSec 5
                if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
                    $healthy = $true
                    break
                }
            } catch {
                Start-Sleep -Seconds 5
            }
        }
        if (-not $healthy) {
            throw "MRP $($check.Name) health check failed: $($check.Uri)"
        }
        Write-Host "MRP $($check.Name) health check passed: $($check.Uri)"
    }
}
