# Forward the private Workflow UI and API through an authenticated IAP/SSH tunnel.
param(
    [string]$ProjectId = "nextgen-erp-7753216",
    [string]$InstanceName = "nextgen-erp-core-vm",
    [string]$Zone = "us-central1-a"
)

$ErrorActionPreference = 'Stop'
Write-Host "Forwarding localhost:3002 and localhost:8082 through IAP..." -ForegroundColor Green
gcloud compute ssh $InstanceName --project=$ProjectId --zone=$Zone --tunnel-through-iap -- `
    -N `
    -L "3002:127.0.0.1:3002" `
    -L "8082:127.0.0.1:8082"
