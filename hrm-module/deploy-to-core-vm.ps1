# ==============================================================================
# NextGen ERP - Deploy HRM Backend to GCP Cloud VM (nextgen-erp-core-vm)
# VM Specs: e2-micro (1.0 GB RAM) | Zone: us-central1-a | Project: nextgen-erp-7753216
# ==============================================================================

$PROJECT_ID = "nextgen-erp-7753216"
$INSTANCE_NAME = "nextgen-erp-core-vm"
$ZONE = "us-central1-a"
$CONTAINER_NAME = "nextgen-hrm-backend"
$PORT = 8081
$DB_NAME = "nextgen_erp_hrm"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   Deploying HRM Backend to $INSTANCE_NAME ($ZONE)                   " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Package backend into lightweight tarball
Write-Host "[1/4] Archiving HRM backend source..." -ForegroundColor Yellow
$TAR_FILE = Join-Path $PSScriptRoot "hrm-backend.tar.gz"
$BACKEND_DIR = Join-Path $PSScriptRoot "backend"
tar -czf $TAR_FILE -C $BACKEND_DIR .

# 2. Upload tarball to VM /tmp/
Write-Host "[2/4] Uploading hrm-backend.tar.gz to VM..." -ForegroundColor Yellow
gcloud compute scp --quiet $TAR_FILE "${INSTANCE_NAME}:/tmp/hrm-backend.tar.gz" --zone=$ZONE --project=$PROJECT_ID
Remove-Item -Path $TAR_FILE -Force -ErrorAction SilentlyContinue

# 3. Extract and build Docker container on VM
Write-Host "[3/4] Building HRM backend Docker container on VM..." -ForegroundColor Yellow
$BUILD_CMD = "sudo rm -rf /opt/nextgen-erp/hrm-backend && sudo mkdir -p /opt/nextgen-erp/hrm-backend && sudo tar -xzf /tmp/hrm-backend.tar.gz -C /opt/nextgen-erp/hrm-backend && sudo rm -f /tmp/hrm-backend.tar.gz && cd /opt/nextgen-erp/hrm-backend && sudo docker build -t nextgen-hrm-backend:latest ."
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --quiet --command=$BUILD_CMD

# 4. Stop previous container if running, and launch with e2-micro memory limit
Write-Host "[4/4] Starting $CONTAINER_NAME on port $PORT with 256MB memory cap..." -ForegroundColor Yellow
$RUN_CMD = "sudo docker stop $CONTAINER_NAME 2>/dev/null; sudo docker rm $CONTAINER_NAME 2>/dev/null; sudo docker run -d --name $CONTAINER_NAME --restart always --memory=256m -p 8081:8081 -e SPRING_DATASOURCE_URL='jdbc:postgresql://10.128.0.2:5432/$DB_NAME' -e SPRING_DATASOURCE_USERNAME='postgres' -e SPRING_DATASOURCE_PASSWORD='postgres' -e SPRING_JPA_HIBERNATE_DDL_AUTO='update' nextgen-hrm-backend:latest"
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --quiet --command=$RUN_CMD

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "SUCCESS: HRM Backend successfully deployed to $INSTANCE_NAME!" -ForegroundColor Green
Write-Host "API Port: 8081 | Health: http://localhost:8081/actuator/health (via IAP)" -ForegroundColor Green
Write-Host "Swagger Docs: http://localhost:8081/swagger-ui.html" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
