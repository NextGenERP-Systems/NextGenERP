# ==============================================================================
# NextGen ERP - IAP Tunnel Helper for Accounting Module Development
# Forwards local port 5432 to the Cloud VM's internal PostgreSQL database
# VM: nextgen-erp-core-vm | Project: nextgen-erp-7753216
# ==============================================================================

$PROJECT_ID = "nextgen-erp-7753216"
$INSTANCE_NAME = "nextgen-erp-core-vm"
$ZONE = "us-central1-a"
$LOCAL_PORT = 5432
$REMOTE_PORT = 5432
$HOST_PORT = "localhost:" + $LOCAL_PORT

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Starting GCP IAP Tunnel for Accounting Module -> $INSTANCE_NAME     " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Local port: $LOCAL_PORT -> Remote VM port: $REMOTE_PORT" -ForegroundColor Green
Write-Host "Target Database: nextgen_erp_accounting" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the tunnel." -ForegroundColor DarkGray
Write-Host "======================================================================" -ForegroundColor Cyan

gcloud compute start-iap-tunnel $INSTANCE_NAME $REMOTE_PORT --project=$PROJECT_ID --zone=$ZONE --local-host-port=$HOST_PORT
