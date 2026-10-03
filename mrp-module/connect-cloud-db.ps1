param(
    [int]$LocalPort = 5433
)

$ErrorActionPreference = 'Stop'
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    throw 'gcloud is required. Install the Google Cloud SDK and authenticate first.'
}
if ([System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object Port -eq $LocalPort) {
    throw "Local port $LocalPort is already occupied. HRM commonly uses 5433. Choose a free port with -LocalPort and set SPRING_DATASOURCE_URL to that port; no tunnel was opened."
}

# ==============================================================================
# NextGen ERP MRP Module - IAP Tunnel Helper Script for Local Development
# Forwards local port 5433 to the Cloud VM's internal PostgreSQL database
# ==============================================================================

$PROJECT_ID = "nextgen-erp-7753216"
$INSTANCE_NAME = "nextgen-erp-core-vm"
$ZONE = "us-central1-a"
$LOCAL_PORT = $LocalPort
$REMOTE_PORT = 5432

Write-Host "Starting IAP Tunnel to $INSTANCE_NAME ($ZONE) for MRP Module..." -ForegroundColor Green
Write-Host "Local Port $LOCAL_PORT -> Remote Port $REMOTE_PORT" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the tunnel." -ForegroundColor Yellow

$forward = "${LOCAL_PORT}:127.0.0.1:${REMOTE_PORT}"
# IAP reaches SSH on port 22; SSH reaches PostgreSQL on VM loopback.
# Direct IAP TCP forwarding to 5432 requires a separate firewall rule.
# A command selects console Plink on Windows; -N prevents executing the command.
gcloud compute ssh $INSTANCE_NAME --project=$PROJECT_ID --zone=$ZONE --tunnel-through-iap `
    --command=true `
    --ssh-flag="-N" --ssh-flag="-L $forward"
if ($LASTEXITCODE -ne 0) { throw 'The MRP database tunnel failed. Check GCP authentication, IAP permissions and VM availability.' }
