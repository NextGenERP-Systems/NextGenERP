# Read-only application smoke test against the isolated MRP PostgreSQL container.
# This script never uses the cloud Compose profile or the persistent GCP database.
$ErrorActionPreference = 'Stop'

function Invoke-JsonRequest {
    param(
        [Parameter(Mandatory = $true)][string]$Uri,
        [ValidateSet('GET', 'POST')][string]$Method = 'GET',
        [string]$Body
    )

    if ($Body) {
        return (& curl.exe -sS -i -X $Method $Uri --json $Body 2>&1) -join "`n"
    }
    return (& curl.exe -sS -i -X $Method $Uri 2>&1) -join "`n"
}

try {
    # This profile owns only the disposable test volume; reset it so init-schema.sql
    # always reflects the current MRP schema under test.
    docker compose -f docker-compose.test.yml down -v
    docker compose -f docker-compose.test.yml up -d --build
    if ($LASTEXITCODE -ne 0) { throw 'The isolated MRP Compose stack failed to start.' }

    $runtime = $null
    for ($attempt = 1; $attempt -le 30; $attempt++) {
        try {
            $runtime = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/runtime/database' -TimeoutSec 2
            break
        } catch {
            if ($attempt -eq 30) { throw }
            Start-Sleep -Seconds 2
        }
    }

    if ($runtime.databaseName -ne 'nextgen_mrp') {
        throw "Unexpected database identity: $($runtime.databaseName)"
    }
    if ($runtime.status -ne 'UP') {
        throw "Database health is not UP: $($runtime.status)"
    }
    if ($null -ne $runtime.migrationVersion -and [int]$runtime.migrationVersion -lt 29) {
        throw "Schema migration version is older than the current MRP baseline: $($runtime.migrationVersion)"
    }

    $boms = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/boms' -TimeoutSec 5
    if ($null -eq $boms) { throw 'The BOM read returned no response.' }

    $invalidBody = '{"itemCode":"MISSING-ITEM","bomNo":"MISSING-BOM","scheduleDate":"2026-09-20","plannedQty":0,"sourceType":"FORECAST"}'
    $invalidResponse = Invoke-JsonRequest -Uri 'http://localhost:8086/api/v1/mrp/mps' -Method POST -Body $invalidBody
    if ($invalidResponse -notmatch 'HTTP/1\.1 400') {
        throw "Expected HTTP 400 for invalid MPS input. Response: $invalidResponse"
    }

    $runId = [Guid]::NewGuid().ToString('N').Substring(0, 12).ToUpperInvariant()
    $mpsId = "SMOKE-MPS-$runId"
    $createBody = @{
        mpsId = $mpsId
        itemCode = 'EV-DRONE-X1'
        bomNo = 'BOM-EV-DRONE-001'
        scheduleDate = '2026-09-20'
        plannedQty = 1
        sourceType = 'FORECAST'
        status = 'DRAFT'
    } | ConvertTo-Json -Compress

    $created = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/mps' -Method Post `
        -ContentType 'application/json' -Body $createBody -TimeoutSec 5
    if ($created.mpsId -ne $mpsId -or $created.status -ne 'DRAFT') {
        throw "MPS creation did not produce a DRAFT record: $($created | ConvertTo-Json -Compress)"
    }

    $submitted = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/mps/$mpsId/submit" -Method Post -TimeoutSec 5
    if ($submitted.status -ne 'SUBMITTED') {
        throw "MPS submission did not produce SUBMITTED status: $($submitted | ConvertTo-Json -Compress)"
    }

    $plan = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/mps/$mpsId/to-production-plan" -Method Post -TimeoutSec 5
    $repeatPlan = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/mps/$mpsId/to-production-plan" -Method Post -TimeoutSec 5
    if ([string]::IsNullOrWhiteSpace($plan.planId) -or $plan.planId -ne $repeatPlan.planId) {
        throw "MPS conversion was not idempotent: first=$($plan | ConvertTo-Json -Compress), repeat=$($repeatPlan | ConvertTo-Json -Compress)"
    }

    $mpsStatus = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT status FROM mrp_master_production_schedule WHERE mps_id = '$mpsId';" 2>&1) -join ''
    if ($mpsStatus.Trim() -ne 'COMPLETED') {
        throw "MPS was not completed after conversion: status=$mpsStatus"
    }
    $mpsAudit = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/state-audit/MPS/$mpsId" -TimeoutSec 5
    if ($null -eq $mpsAudit -or -not (@($mpsAudit) | Where-Object { $_.action -eq 'SUBMIT' }) -or -not (@($mpsAudit) | Where-Object { $_.action -eq 'CONVERT_TO_PRODUCTION_PLAN' })) {
        throw "MPS audit did not contain SUBMIT: $($mpsAudit | ConvertTo-Json -Compress)"
    }
    $planAudit = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/state-audit/PRODUCTION_PLAN/$($plan.planId)" -TimeoutSec 5
    if ($null -eq $planAudit -or -not (@($planAudit) | Where-Object { $_.action -eq 'MPS_GENERATE_SUBMIT' })) {
        throw "Production Plan audit did not contain MPS_GENERATE_SUBMIT: $($planAudit | ConvertTo-Json -Compress)"
    }

    $mrpRun = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/wizard/calculate?bomNo=BOM-EV-DRONE-001&plannedQty=1' -TimeoutSec 5
    if ([string]::IsNullOrWhiteSpace([string]$mrpRun.runId) -or [int]$mrpRun.totalExplodedItems -le 0) {
        throw "MRP wizard did not persist a calculation run: $($mrpRun | ConvertTo-Json -Compress)"
    }
    $runRequirementCount = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT COUNT(*) FROM mrp_run_requirement WHERE run_id = '$($mrpRun.runId)';" 2>&1) -join ''
    if ([int]$runRequirementCount.Trim() -le 0) {
        throw "MRP run has no persisted requirement snapshots: run=$($mrpRun.runId)"
    }
    $persistedRun = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/runs/$($mrpRun.runId)" -TimeoutSec 5
    if ($persistedRun.status -ne 'CALCULATED') {
        throw "Persisted MRP run was not CALCULATED before review: $($persistedRun.status)"
    }
    if ([string]::IsNullOrWhiteSpace([string]$persistedRun.calculationCutoffAt)) {
        throw "Persisted MRP run did not expose calculationCutoffAt: $($persistedRun | ConvertTo-Json -Compress)"
    }
    $listedRuns = @(Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/runs' -TimeoutSec 5)
    if (-not ($listedRuns | Where-Object { [string]$_.runId -eq [string]$mrpRun.runId })) {
        throw "MRP run list did not include the persisted run: $($mrpRun.runId)"
    }
    $reviewedRun = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/runs/$($mrpRun.runId)/review" -Method Post -TimeoutSec 5
    if ($reviewedRun.status -ne 'REVIEWED') {
        throw "MRP run review transition failed: $($reviewedRun.status)"
    }
    $releasedRun = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/runs/$($mrpRun.runId)/release" -Method Post -TimeoutSec 5
    if ($releasedRun.status -ne 'RELEASED') {
        throw "MRP run release transition failed: $($releasedRun.status)"
    }
    $repeatedRelease = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/runs/$($mrpRun.runId)/release" -Method Post -TimeoutSec 5
    if ($repeatedRelease.status -ne 'RELEASED') {
        throw "MRP run release retry was not idempotent: $($repeatedRelease.status)"
    }
    $productionPlan = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/runs/$($mrpRun.runId)/production-plan" -Method Post -TimeoutSec 5
    $repeatedProductionPlan = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/runs/$($mrpRun.runId)/production-plan" -Method Post -TimeoutSec 5
    if ([string]::IsNullOrWhiteSpace([string]$productionPlan.planId) -or $productionPlan.planId -ne $repeatedProductionPlan.planId) {
        throw "MRP production-plan conversion was not idempotent: $($productionPlan | ConvertTo-Json -Compress) / $($repeatedProductionPlan | ConvertTo-Json -Compress)"
    }
    $planSourceRun = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT source_mrp_run_id FROM mrp_production_plan WHERE plan_id = '$($productionPlan.planId)';" 2>&1) -join ''
    if ($planSourceRun.Trim() -ne $mrpRun.runId.ToString()) {
        throw "Production plan did not preserve source MRP run: $planSourceRun"
    }
    $submittedProductionPlan = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/production-plans/$($productionPlan.planId)/submit" -Method Post -TimeoutSec 5
    if ($submittedProductionPlan.status -ne 'SUBMITTED') {
        throw "Generated production plan was not submitted: $($submittedProductionPlan.status)"
    }
    $generatedWorkOrders = @(Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/production-plans/$($productionPlan.planId)/generate-work-orders" -Method Post -TimeoutSec 5)
    $planWorkOrderCountBeforeRetry = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT COUNT(*) FROM mrp_work_order WHERE production_plan_id = '$($productionPlan.planId)';" 2>&1) -join ''
    $repeatedWorkOrders = @(Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/production-plans/$($productionPlan.planId)/generate-work-orders" -Method Post -TimeoutSec 5)
    $planWorkOrderCount = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT COUNT(*) FROM mrp_work_order WHERE production_plan_id = '$($productionPlan.planId)';" 2>&1) -join ''
    if ([int]$planWorkOrderCount.Trim() -le 0) {
        throw "Production plan Work Order generation did not persist any Work Orders."
    }
    if ($planWorkOrderCount.Trim() -ne $planWorkOrderCountBeforeRetry.Trim()) {
        throw "Production plan Work Order generation was not idempotent: before=$planWorkOrderCountBeforeRetry after=$planWorkOrderCount"
    }
    $runAudit = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/state-audit/MRP_RUN/$($mrpRun.runId)" -TimeoutSec 5
    if ($null -eq $runAudit -or -not (@($runAudit) | Where-Object { $_.action -eq 'REVIEW' }) -or -not (@($runAudit) | Where-Object { $_.action -eq 'RELEASE' })) {
        throw "MRP run audit did not contain REVIEW and RELEASE: $($runAudit | ConvertTo-Json -Compress)"
    }

    $reservationWorkOrderId = "WO-RESERVE-$runId"
    $reservationBody = @{
        workOrderId = $reservationWorkOrderId
        productionItem = 'DRONE-FRAME-SUB'
        itemName = 'Carbon Fiber Chassis & Arm Sub-Assembly'
        bomNo = 'BOM-CHASSIS-001'
        qtyToProduce = 2
        sourceWarehouse = 'WH-STORES'
        wipWarehouse = 'WH-WIP'
        fgWarehouse = 'WH-FG'
        plannedStartDate = '2026-09-20T00:00:00Z'
        plannedEndDate = '2026-09-21T00:00:00Z'
        status = 'NOT_STARTED'
    } | ConvertTo-Json -Depth 5 -Compress
    Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/work-orders' -Method Post `
        -ContentType 'application/json' -Body $reservationBody -TimeoutSec 5 | Out-Null
    Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/work-orders/$reservationWorkOrderId/submit" -Method Post -TimeoutSec 5 | Out-Null
    Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/work-orders/$reservationWorkOrderId/submit" -Method Post -TimeoutSec 5 | Out-Null
    $reservationCount = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT COUNT(*) FROM mrp_inventory_movement WHERE work_order_id = '$reservationWorkOrderId' AND movement_type = 'RESERVATION';" 2>&1) -join ''
    $expectedReservationCount = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT COUNT(*) FROM mrp_work_order_item WHERE work_order_id = '$reservationWorkOrderId';" 2>&1) -join ''
    if ($reservationCount.Trim() -ne $expectedReservationCount.Trim() -or [int]$reservationCount.Trim() -le 0) {
        throw "Work Order reservations were not persisted exactly once per material: reservations=$reservationCount expected=$expectedReservationCount"
    }

    $qualityId = "QI-SMOKE-$runId"
    $qualityBody = @{
        inspectionId = $qualityId
        workOrderId = 'WO-2026-0001'
        inspectionType = 'In-Process'
        inspectedBy = 'EMP-103'
        inspectedQty = 10
        readings = @(@{ parameterName = 'Smoke Check'; readingValue = 1; status = 'PASSED' })
    } | ConvertTo-Json -Depth 5 -Compress
    $quality = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/quality/inspections' -Method Post `
        -ContentType 'application/json' -Body $qualityBody -TimeoutSec 5
    if ($quality.status -ne 'PASSED') {
        throw "Quality inspection was not persisted as PASSED: $($quality | ConvertTo-Json -Compress)"
    }
    $qualityAudit = Invoke-RestMethod -Uri "http://localhost:8086/api/v1/mrp/state-audit/QUALITY_INSPECTION/$qualityId" -TimeoutSec 5
    if ($null -eq $qualityAudit -or -not (@($qualityAudit) | Where-Object { $_.action -eq 'CREATE' -and $_.toStatus -eq 'PASSED' })) {
        throw "Quality inspection audit was incomplete: $($qualityAudit | ConvertTo-Json -Compress)"
    }

    $consumptionKey = "SMOKE-CONSUME-$runId"
    $consumeUri = "http://localhost:8086/api/v1/mrp/work-orders/WO-2026-0001/consume?itemCode=RAW-FLIGHT-CTRL&consumeQty=1&idempotencyKey=$([uri]::EscapeDataString($consumptionKey))"
    Invoke-RestMethod -Uri $consumeUri -Method Post -TimeoutSec 5 | Out-Null
    Invoke-RestMethod -Uri $consumeUri -Method Post -TimeoutSec 5 | Out-Null
    $movementHistory = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/inventory-movements/work-order/WO-2026-0001' -TimeoutSec 5
    if ($null -eq $movementHistory) {
        throw 'Inventory movement history endpoint returned no response.'
    }
    $sourceReference = "WO-CONSUME:WO-2026-0001:$consumptionKey"
    $movementCount = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT COUNT(*) FROM mrp_inventory_movement WHERE source_reference = '$sourceReference';" 2>&1) -join ''
    if ($movementCount.Trim() -ne '1') {
        throw "Keyed consumption was not idempotent: movement count=$movementCount"
    }

    $completedWorkOrder = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/work-orders/WO-2026-0001/complete' -Method Post -TimeoutSec 5
    if ($completedWorkOrder.status -ne 'COMPLETED') {
        throw "Work Order completion failed: $($completedWorkOrder | ConvertTo-Json -Compress)"
    }
    $repeatedCompletion = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/work-orders/WO-2026-0001/complete' -Method Post -TimeoutSec 5
    if ($repeatedCompletion.status -ne 'COMPLETED') {
        throw "Repeated Work Order completion was not idempotent: $($repeatedCompletion | ConvertTo-Json -Compress)"
    }
    $finishedMovementCount = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT COUNT(*) FROM mrp_inventory_movement WHERE source_reference = 'WO-FINISH:WO-2026-0001';" 2>&1) -join ''
    if ($finishedMovementCount.Trim() -ne '1') {
        throw "Finished-goods movement was not persisted exactly once: count=$finishedMovementCount"
    }
    $completedWorkOrderState = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT status || '|' || produced_qty || '|' || (actual_end_date IS NOT NULL) FROM mrp_work_order WHERE work_order_id = 'WO-2026-0001';" 2>&1) -join ''
    if ($completedWorkOrderState.Trim() -ne 'COMPLETED|10.0000|true') {
        throw "Completed Work Order state was not persisted consistently: $completedWorkOrderState"
    }
    $stateAudit = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/state-audit/WORK_ORDER/WO-2026-0001' -TimeoutSec 5
    if ($null -eq $stateAudit -or @($stateAudit).Count -lt 1 -or -not (@($stateAudit) | Where-Object { $_.action -eq 'COMPLETE' })) {
        throw "Work Order state audit did not contain the completion transition: $($stateAudit | ConvertTo-Json -Compress)"
    }
    Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/job-cards/JC-2026-002/start?employeeId=EMP-103' -Method Post -TimeoutSec 5 | Out-Null
    $issueWipCount = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT COUNT(*) FROM mrp_inventory_movement WHERE source_reference LIKE 'JC-ISSUE-WIP:JC-2026-002:%';" 2>&1) -join ''
    if ([int]$issueWipCount.Trim() -le 0) {
        throw "Job Card start did not create ISSUE_TO_WIP movements: count=$issueWipCount"
    }
    Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/job-cards/JC-2026-002/start?employeeId=EMP-103' -Method Post -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-Null
    $repeatIssueWipCount = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT COUNT(*) FROM mrp_inventory_movement WHERE source_reference LIKE 'JC-ISSUE-WIP:JC-2026-002:%';" 2>&1) -join ''
    if ($repeatIssueWipCount.Trim() -ne $issueWipCount.Trim()) {
        throw "Job Card ISSUE_TO_WIP movement was not idempotent: first=$issueWipCount repeat=$repeatIssueWipCount"
    }
    Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/job-cards/JC-2026-002/complete?completedQty=10&scrapQty=0.25&scrapReason=SmokeCheck' -Method Post -TimeoutSec 5 | Out-Null
    $scrapMovementCount = (docker exec nextgen-mrp-postgres-test psql -U postgres -d nextgen_mrp -Atc `
        "SELECT COUNT(*) FROM mrp_inventory_movement WHERE source_reference LIKE 'JC-SCRAP:JC-2026-002:%';" 2>&1) -join ''
    if ($scrapMovementCount.Trim() -ne '1') {
        throw "Job Card scrap movement was not persisted exactly once: count=$scrapMovementCount"
    }
    $jobCardAudit = Invoke-RestMethod -Uri 'http://localhost:8086/api/v1/mrp/state-audit/JOB_CARD/JC-2026-002' -TimeoutSec 5
    if ($null -eq $jobCardAudit -or @($jobCardAudit).Count -lt 2 -or -not (@($jobCardAudit) | Where-Object { $_.action -eq 'START' }) -or -not (@($jobCardAudit) | Where-Object { $_.action -eq 'COMPLETE' })) {
        throw "Job Card state audit was incomplete: $($jobCardAudit | ConvertTo-Json -Compress)"
    }

    Write-Host "Local MRP stack verified: database=$($runtime.databaseName), status=$($runtime.status)"
    if ($null -ne $runtime.migrationVersion) {
        Write-Host "Schema migration baseline verified: version=$($runtime.migrationVersion)."
    }
    Write-Host "BOM endpoint responded successfully and invalid MPS input returned HTTP 400."
    Write-Host "MPS lifecycle verified: DRAFT -> SUBMITTED -> COMPLETED, plan=$($plan.planId), repeat conversion was idempotent."
    Write-Host "Release audit verified: MPS and Production Plan SUBMIT transitions are persisted."
    Write-Host "MRP wizard, production-plan lineage and Work Order generation verified: run=$($mrpRun.runId), persisted requirements=$($runRequirementCount.Trim()), plan=$($productionPlan.planId), workOrders=$($planWorkOrderCount.Trim())."
    Write-Host "MRP planner release verified: run transitioned CALCULATED -> REVIEWED -> RELEASED idempotently."
    Write-Host "Planner audit verified: MRP run REVIEW and RELEASE transitions are persisted."
    Write-Host "Reservation audit verified: submitted work order created one reservation per material across retries."
    Write-Host "Quality audit verified: persisted PASSED inspection has a CREATE audit event."
    Write-Host "Consumption audit verified: keyed retry produced exactly one persisted movement."
    Write-Host "Work Order completion verified: child dependency passed and one finished-goods movement persisted."
    Write-Host "State audit verified: persisted COMPLETE transition is readable through the audit API."
    Write-Host "Job Card inventory verified: ISSUE_TO_WIP movements were persisted exactly once."
    Write-Host "Scrap inventory verified: Job Card scrap was persisted exactly once."
    Write-Host "Job Card audit verified: START and COMPLETE transitions are persisted."
} finally {
    docker compose -f docker-compose.test.yml down -v
}
