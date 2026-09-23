#!/usr/bin/env bash
# Private Workflow deployment wrapper.
# This script never creates VMs, external IPs, or firewall rules.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-nextgen-erp-7753216}"
INSTANCE_NAME="${INSTANCE_NAME:-nextgen-erp-core-vm}"
ZONE="${ZONE:-us-central1-a}"
REMOTE_DIR="${REMOTE_DIR:-/opt/nextgen-erp/workflow-module/gcp-deployment}"

echo "Validating the existing private deployment target..."
gcloud compute instances describe "${INSTANCE_NAME}" \
  --project="${PROJECT_ID}" --zone="${ZONE}" --format='value(name,status)' >/dev/null

echo "Deploying the prebuilt Workflow images through IAP..."
gcloud compute ssh "${INSTANCE_NAME}" \
  --project="${PROJECT_ID}" --zone="${ZONE}" --tunnel-through-iap \
  --command="cd '${REMOTE_DIR}' && docker compose config --quiet && docker compose up -d"

echo "Workflow deployment completed without creating cloud network resources."
echo "Use connect-private-app.ps1 to access the UI and API through IAP/SSH."
