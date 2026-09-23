# Forward the private MRP UI and API through an authenticated IAP/SSH tunnel.
param(
    [string]$ProjectId = "nextgen-erp-7753216",
    [string]$InstanceName = "nextgen-erp-core-vm",
    [string]$Zone = "us-central1-a"
)

$ErrorActionPreference = 'Stop'
Write-Host "Forwarding localhost:3005 and localhost:8085 through IAP..." -ForegroundColor Green
gcloud compute ssh $InstanceName --project=$ProjectId --zone=$Zone --tunnel-through-iap -- `
    -N `
    -L "3005:127.0.0.1:3005" `
    -L "8085:127.0.0.1:8085"
