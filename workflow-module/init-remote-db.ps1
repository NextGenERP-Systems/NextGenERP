# ==============================================================================
# NextGen ERP - Initialize Remote Database on Sales VM via SSH / SCP
# ==============================================================================

$PROJECT_ID = "nextgen-erp-7753216"
$INSTANCE_NAME = "nextgen-erp-core-vm"
$ZONE = "us-central1-a"
$CONTAINER = "nextgen-workflow-postgres"

Write-Host "🚀 Creating 'workflow_db' database on $INSTANCE_NAME..." -ForegroundColor Green

# 1. Create workflow_db if it doesn't exist
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --command="sudo docker exec $CONTAINER psql -U postgres -c 'CREATE DATABASE workflow_db;'" 2>$null

# 2. Upload schema and seed files to the remote VM
Write-Host "📤 Uploading SQL files to VM..." -ForegroundColor Green
gcloud compute scp database/init-schema.sql database/seed-data.sql "${INSTANCE_NAME}:/tmp/" --zone=$ZONE --project=$PROJECT_ID

# 3. Apply init-schema.sql
Write-Host "📜 Applying init-schema.sql..." -ForegroundColor Green
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --command="cat /tmp/init-schema.sql | sudo docker exec -i $CONTAINER psql -U postgres -d workflow_db"

# 4. Apply seed-data.sql
Write-Host "🌱 Applying seed-data.sql..." -ForegroundColor Green
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --command="cat /tmp/seed-data.sql | sudo docker exec -i $CONTAINER psql -U postgres -d workflow_db"

Write-Host "✨ Remote 'workflow_db' successfully initialized!" -ForegroundColor Cyan
