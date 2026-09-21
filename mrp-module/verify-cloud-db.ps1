# Read-only preflight for the single persistent MRP database.
# This script does not start the VM, open a tunnel, create databases, or run SQL.

param(
    [string]$ProjectId = "nextgen-erp-7753216",
    [string]$InstanceName = "nextgen-erp-core-vm",
    [string]$Zone = "us-central1-a"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking GCP VM state (read-only)..." -ForegroundColor Cyan
$vm = gcloud compute instances describe $InstanceName `
    --project=$ProjectId --zone=$Zone `
    --format="yaml(name,status,networkInterfaces[0].networkIP,disks[0].source)"

if ($LASTEXITCODE -ne 0) {
    throw "Unable to describe the configured VM. No database action was attempted."
}

$vm
Write-Host "No database connection or schema change was attempted." -ForegroundColor Yellow
Write-Host "Next manual gate: confirm the VM is intentionally available, identify the PostgreSQL container, then take and verify a backup before migration work." -ForegroundColor Yellow
