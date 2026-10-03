# Forward the private MRP UI and API through an authenticated IAP/SSH tunnel.
param(
    [string]$ProjectId = "nextgen-erp-7753216",
    [string]$InstanceName = "nextgen-erp-core-vm",
    [string]$Zone = "us-central1-a"
)

$ErrorActionPreference = 'Stop'
foreach ($port in @(3005, 8085)) {
    if ([System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object Port -eq $port) {
        throw "Local port $port is already occupied. Stop the local MRP application before opening the private application tunnel."
    }
}
Write-Host "Forwarding localhost:3005 and localhost:8085 through IAP..." -ForegroundColor Green
# Select console Plink on Windows; -N prevents executing the placeholder command.
gcloud compute ssh $InstanceName --project=$ProjectId --zone=$Zone --tunnel-through-iap `
    --command=true `
    --ssh-flag="-N" `
    --ssh-flag="-L 3005:127.0.0.1:3005" `
    --ssh-flag="-L 8085:127.0.0.1:8085"
if ($LASTEXITCODE -ne 0) { throw 'The private MRP application tunnel failed.' }
