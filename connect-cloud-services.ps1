# ==============================================================================
# NextGen ERP - Multi-Service GCP IAP Tunnel Launcher
# VM: nextgen-erp-core-vm | Project: nextgen-erp-7753216 | Zone: us-central1-a
# ==============================================================================

param(
    [ValidateSet("db", "sales", "hrm", "accounting", "all")]
    [string]$Service = "db"
)

$PROJECT_ID = "nextgen-erp-7753216"
$INSTANCE_NAME = "nextgen-erp-core-vm"
$ZONE = "us-central1-a"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "     NextGen ERP - GCP Identity-Aware Proxy (IAP) Tunnel Launcher     " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

switch ($Service) {
    "db" {
        Write-Host "🔗 Forwarding Local 5432 -> Cloud PostgreSQL (nextgen-postgres)" -ForegroundColor Green
        Write-Host "   Access databases: nextgen_erp, nextgen_erp_hrm, nextgen_erp_accounting" -ForegroundColor Yellow
        gcloud compute start-iap-tunnel $INSTANCE_NAME 5432 --project=$PROJECT_ID --zone=$ZONE --local-host-port="localhost:5432"
    }
    "sales" {
        Write-Host "🔗 Forwarding Local 8080 -> Cloud Sales Backend (8080)" -ForegroundColor Green
        gcloud compute start-iap-tunnel $INSTANCE_NAME 8080 --project=$PROJECT_ID --zone=$ZONE --local-host-port="localhost:8080"
    }
    "hrm" {
        Write-Host "🔗 Forwarding Local 8081 -> Cloud HRM Backend (8081)" -ForegroundColor Green
        gcloud compute start-iap-tunnel $INSTANCE_NAME 8081 --project=$PROJECT_ID --zone=$ZONE --local-host-port="localhost:8081"
    }
    "accounting" {
        Write-Host "🔗 Forwarding Local 8084 -> Cloud Accounting Backend (8084)" -ForegroundColor Green
        gcloud compute start-iap-tunnel $INSTANCE_NAME 8084 --project=$PROJECT_ID --zone=$ZONE --local-host-port="localhost:8084"
    }
}
