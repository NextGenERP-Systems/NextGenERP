# ==============================================================================
# NextGen ERP - Deploy Accounting Backend to GCP Cloud VM (nextgen-erp-core-vm)
# VM Specs: e2-micro (1.0 GB RAM) | Zone: us-central1-a | Project: nextgen-erp-7753216
# ==============================================================================

$PROJECT_ID = "nextgen-erp-7753216"
$INSTANCE_NAME = "nextgen-erp-core-vm"
$ZONE = "us-central1-a"
$CONTAINER_NAME = "nextgen-accounting-backend"
$PORT = 8084
$DB_NAME = "nextgen_erp_accounting"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   Deploying Accounting Backend to $INSTANCE_NAME ($ZONE)            " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Package backend into lightweight tarball
Write-Host "[1/4] Archiving Accounting backend source..." -ForegroundColor Yellow
$TAR_FILE = Join-Path $PSScriptRoot "accounting-backend.tar.gz"
$BACKEND_DIR = Join-Path $PSScriptRoot "backend"
tar -czf $TAR_FILE -C $BACKEND_DIR .

# 2. Upload tarball to VM /tmp/
Write-Host "[2/4] Uploading accounting-backend.tar.gz to VM..." -ForegroundColor Yellow
gcloud compute scp --quiet $TAR_FILE "${INSTANCE_NAME}:/tmp/accounting-backend.tar.gz" --zone=$ZONE --project=$PROJECT_ID
Remove-Item -Path $TAR_FILE -Force -ErrorAction SilentlyContinue

# 3. Extract and build Docker container on VM
Write-Host "[3/4] Building Accounting backend Docker container on VM..." -ForegroundColor Yellow
$BUILD_CMD = "sudo rm -rf /opt/nextgen-erp/accounting-backend && sudo mkdir -p /opt/nextgen-erp/accounting-backend && sudo tar -xzf /tmp/accounting-backend.tar.gz -C /opt/nextgen-erp/accounting-backend && sudo rm -f /tmp/accounting-backend.tar.gz && cd /opt/nextgen-erp/accounting-backend && sudo docker build -t nextgen-accounting-backend:latest ."
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --quiet --command=$BUILD_CMD

# 4. Stop previous container if running, and launch with e2-micro memory limit
Write-Host "[4/4] Starting $CONTAINER_NAME on port $PORT with 256MB memory cap..." -ForegroundColor Yellow
$RUN_CMD = "sudo docker stop $CONTAINER_NAME 2>/dev/null; sudo docker rm $CONTAINER_NAME 2>/dev/null; sudo docker run -d --name $CONTAINER_NAME --restart always --memory=256m -p 8084:8084 -e SPRING_DATASOURCE_URL='jdbc:postgresql://10.128.0.2:5432/$DB_NAME' -e SPRING_DATASOURCE_USERNAME='postgres' -e SPRING_DATASOURCE_PASSWORD='postgres' -e SPRING_JPA_HIBERNATE_DDL_AUTO='update' -e SPRING_SQL_INIT_MODE='never' nextgen-accounting-backend:latest"
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --quiet --command=$RUN_CMD

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "SUCCESS: Accounting Backend successfully deployed to $INSTANCE_NAME!" -ForegroundColor Green
Write-Host "API Port: 8084 | Health: http://localhost:8084/actuator/health (via IAP)" -ForegroundColor Green
Write-Host "Swagger Docs: http://localhost:8084/swagger-ui.html" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
