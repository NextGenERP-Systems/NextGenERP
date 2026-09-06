# ==============================================================================
# NextGen ERP MRP Module - IAP Tunnel Helper Script for Local Development
# Forwards local port 5433 to the Cloud VM's internal PostgreSQL database
# ==============================================================================

$PROJECT_ID = "nextgen-erp-7753216"
$INSTANCE_NAME = "nextgen-erp-core-vm"
$ZONE = "us-central1-a"
$LOCAL_PORT = 5433
$REMOTE_PORT = 5432

Write-Host "🚀 Starting IAP Tunnel to $INSTANCE_NAME ($ZONE) on project $PROJECT_ID for MRP Module..." -ForegroundColor Green
Write-Host "🔗 Local Port $LOCAL_PORT -> Remote Port $REMOTE_PORT" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the tunnel." -ForegroundColor Yellow

gcloud compute start-iap-tunnel $INSTANCE_NAME $REMOTE_PORT `
    --project=$PROJECT_ID `
    --zone=$ZONE `
    --local-host-port="localhost:$LOCAL_PORT"
