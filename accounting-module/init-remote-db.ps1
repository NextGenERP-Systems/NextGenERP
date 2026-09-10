# ==============================================================================
# NextGen ERP - Initialize Remote Accounting Database on Cloud VM via SSH / SCP
# VM: nextgen-erp-core-vm (e2-micro) | Project: nextgen-erp-7753216
# ==============================================================================

$PROJECT_ID = "nextgen-erp-7753216"
$INSTANCE_NAME = "nextgen-erp-core-vm"
$ZONE = "us-central1-a"
$CONTAINER = "nextgen-workflow-postgres"
$DB_NAME = "nextgen_erp_accounting"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  NextGen ERP - Initializing Remote Accounting DB on $INSTANCE_NAME   " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Create Accounting database if it does not exist
Write-Host "[1/4] Ensuring database $DB_NAME exists on $INSTANCE_NAME..." -ForegroundColor Green
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --command="sudo docker exec $CONTAINER psql -U postgres -c 'CREATE DATABASE $DB_NAME;'" 2>$null

# 2. Upload schema and seed files to VM with unique filenames
Write-Host "[2/4] Uploading schema and seed dataset to VM..." -ForegroundColor Green
$SCHEMA_FILE = Join-Path $PSScriptRoot "database\schema.sql"
$SEED_FILE = Join-Path $PSScriptRoot "database\seed-data.sql"
gcloud compute scp $SCHEMA_FILE "${INSTANCE_NAME}:/tmp/accounting-schema.sql" --zone=$ZONE --project=$PROJECT_ID
gcloud compute scp $SEED_FILE "${INSTANCE_NAME}:/tmp/accounting-seed-data.sql" --zone=$ZONE --project=$PROJECT_ID

# 3. Apply schema.sql
Write-Host "[3/4] Applying accounting-schema.sql to $DB_NAME..." -ForegroundColor Green
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --command="cat /tmp/accounting-schema.sql | sudo docker exec -i $CONTAINER psql -U postgres -d $DB_NAME"

# 4. Apply seed-data.sql
Write-Host "[4/4] Applying accounting-seed-data.sql to $DB_NAME..." -ForegroundColor Green
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --command="cat /tmp/accounting-seed-data.sql | sudo docker exec -i $CONTAINER psql -U postgres -d $DB_NAME"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "SUCCESS: Remote Accounting Database $DB_NAME successfully initialized!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
