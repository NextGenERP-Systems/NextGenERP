#!/usr/bin/env bash
# ==============================================================================
# NextGen ERP - Initialize Remote HRM Database on Cloud VM
# VM: nextgen-erp-core-vm (e2-micro) | Project: nextgen-erp-7753216
# ==============================================================================

set -euo pipefail

PROJECT_ID="nextgen-erp-7753216"
INSTANCE_NAME="nextgen-erp-core-vm"
ZONE="us-central1-a"
CONTAINER="nextgen-workflow-postgres"
DB_NAME="nextgen_erp_hrm"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================================================"
echo "  NextGen ERP - Initializing Remote HRM Database on $INSTANCE_NAME    "
echo "======================================================================"

# 1. Ensure database exists
echo "[1/4] Ensuring database $DB_NAME exists on $INSTANCE_NAME..."
gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" \
  --command="sudo docker exec $CONTAINER psql -U postgres -c 'CREATE DATABASE $DB_NAME;'" 2>/dev/null || true

# 2. Upload SQL files
echo "[2/4] Uploading schema and seed dataset to VM..."
gcloud compute scp "$SCRIPT_DIR/database/init-schema.sql" "$SCRIPT_DIR/database/seed-data.sql" \
  "${INSTANCE_NAME}:/tmp/" --zone="$ZONE" --project="$PROJECT_ID"

# 3. Apply schema
echo "[3/4] Applying init-schema.sql to $DB_NAME..."
gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" \
  --command="cat /tmp/init-schema.sql | sudo docker exec -i $CONTAINER psql -U postgres -d $DB_NAME"

# 4. Apply seed data
echo "[4/4] Applying seed-data.sql to $DB_NAME..."
gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" \
  --command="cat /tmp/seed-data.sql | sudo docker exec -i $CONTAINER psql -U postgres -d $DB_NAME"

echo "======================================================================"
echo "SUCCESS: Remote HRM Database $DB_NAME successfully initialized!"
echo "======================================================================"
