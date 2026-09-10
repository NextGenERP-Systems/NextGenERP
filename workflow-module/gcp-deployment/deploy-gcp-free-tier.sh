#!/usr/bin/env bash
# ==============================================================================
# NextGen ERP - Workflow Automated Google Cloud Free-Tier Provisioning Script
# Target: e2-micro VM in GCP Always Free Tier (us-central1-a)
# ==============================================================================

set -eo pipefail

# ------------------------------------------------------------------------------
# Colours & Formatting
# ------------------------------------------------------------------------------
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ------------------------------------------------------------------------------
# GCP Project & Configuration
# ------------------------------------------------------------------------------
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"

if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
  error "No GCP project selected. Run 'gcloud config set project <PROJECT_ID>' or pass PROJECT_ID=<PROJECT_ID> $0"
  exit 1
fi

INSTANCE_NAME="${INSTANCE_NAME:-nextgen-erp-core-vm}"
OLD_INSTANCE_NAME="nextgen-erp-sales-vm"
ZONE="us-central1-a"
MACHINE_TYPE="e2-micro"
BOOT_DISK_SIZE="30GB"
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=============================================================================="
echo -e "${BLUE}🚀 Starting NextGen ERP Deployment on Unified Google Cloud VM (Free Tier)${NC}"
echo -e "   Project ID    : ${GREEN}${PROJECT_ID}${NC}"
echo -e "   Instance Name : ${GREEN}${INSTANCE_NAME}${NC}"
echo -e "   Zone          : ${GREEN}${ZONE}${NC}"
echo -e "   Machine Type  : ${GREEN}${MACHINE_TYPE}${NC} (Always Free Tier eligible)"
echo "=============================================================================="

# ------------------------------------------------------------------------------
# Check & Clean up legacy sales-only VM if migrating to unified core VM
# ------------------------------------------------------------------------------
if [[ "${INSTANCE_NAME}" == "nextgen-erp-core-vm" ]]; then
  if gcloud compute instances describe "${OLD_INSTANCE_NAME}" --project="${PROJECT_ID}" --zone="${ZONE}" >/dev/null 2>&1; then
    warn "Found legacy instance '${OLD_INSTANCE_NAME}'. Replacing with generic unified '${INSTANCE_NAME}'..."
    gcloud compute instances delete "${OLD_INSTANCE_NAME}" --project="${PROJECT_ID}" --zone="${ZONE}" --quiet
    success "Legacy '${OLD_INSTANCE_NAME}' removed to preserve 1-VM Free Tier limit."
  fi
fi

# ------------------------------------------------------------------------------
# Step 1: Enable Compute Engine API
# ------------------------------------------------------------------------------
info "[1/5] Checking Google Compute Engine API..."
if ! gcloud services list --enabled --project="${PROJECT_ID}" --filter="config.name:compute.googleapis.com" --format="get(config.name)" | grep -q "compute.googleapis.com"; then
  info "Enabling compute.googleapis.com on project ${PROJECT_ID}..."
  gcloud services enable compute.googleapis.com --project="${PROJECT_ID}"
fi
success "Compute Engine API is active."

# ------------------------------------------------------------------------------
# Step 2: Configure Firewall Rules
# ------------------------------------------------------------------------------
info "[2/5] Configuring GCP VPC Firewall Rules..."
if ! gcloud compute firewall-rules describe allow-nextgen-workflow --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud compute firewall-rules create allow-nextgen-workflow \
      --project="${PROJECT_ID}" \
      --direction=INGRESS \
      --priority=1000 \
      --network=default \
      --action=ALLOW \
      --rules=tcp:80,tcp:443,tcp:8080,tcp:3000 \
      --source-ranges=0.0.0.0/0 \
      --target-tags=nextgen-workflow
  success "Firewall rule 'allow-nextgen-workflow' created."
else
  info "Firewall rule 'allow-nextgen-workflow' already exists."
fi

# ------------------------------------------------------------------------------
# Step 3: Provision Compute Engine VM
# ------------------------------------------------------------------------------
info "[3/5] Checking/Provisioning Compute Engine VM (${INSTANCE_NAME})..."
if ! gcloud compute instances describe "${INSTANCE_NAME}" --project="${PROJECT_ID}" --zone="${ZONE}" >/dev/null 2>&1; then
  gcloud compute instances create "${INSTANCE_NAME}" \
      --project="${PROJECT_ID}" \
      --zone="${ZONE}" \
      --machine-type="${MACHINE_TYPE}" \
      --network-interface=network-tier=STANDARD,subnet=default \
      --maintenance-policy=MIGRATE \
      --tags=nextgen-workflow,http-server,https-server \
      --create-disk=auto-delete=yes,boot=yes,image-family="${IMAGE_FAMILY}",image-project="${IMAGE_PROJECT}",mode=rw,size="${BOOT_DISK_SIZE}",type=pd-standard \
      --metadata=startup-script='#!/bin/bash
      apt-get update -y
      apt-get install -y docker.io docker-compose-v2 git
      systemctl enable --now docker
      usermod -aG docker ubuntu || true
      '
  success "VM ${INSTANCE_NAME} created successfully."
else
  info "VM ${INSTANCE_NAME} already exists."
fi

# ------------------------------------------------------------------------------
# Step 4: Wait for VM & Deploy Workflow Containers
# ------------------------------------------------------------------------------
info "[4/5] Syncing Workflow module codebase and starting Docker containers..."

# Wait for SSH to be responsive
info "Connecting to VM via IAP tunnel..."
for i in {1..20}; do
  if gcloud compute ssh "${INSTANCE_NAME}" --project="${PROJECT_ID}" --zone="${ZONE}" --tunnel-through-iap --command="docker --version || which docker" >/dev/null 2>&1; then
    success "Docker is ready on remote VM."
    break
  fi
  info "Waiting for VM startup script & Docker installation... (attempt $i/20)"
  sleep 6
done

# Transfer workflow module files to remote VM
info "Uploading codebase to remote VM (~/workflow-module)..."
gcloud compute scp --recurse --project="${PROJECT_ID}" --zone="${ZONE}" --tunnel-through-iap \
  "${WORKFLOW_ROOT}/backend" \
  "${WORKFLOW_ROOT}/frontend" \
  "${WORKFLOW_ROOT}/database" \
  "${WORKFLOW_ROOT}/gcp-deployment" \
  "${INSTANCE_NAME}:~/workflow-module/"

# Run docker compose build & start on VM
info "Building and launching containers via Docker Compose on remote VM..."
gcloud compute ssh "${INSTANCE_NAME}" --project="${PROJECT_ID}" --zone="${ZONE}" --tunnel-through-iap --command="
  cd ~/workflow-module/gcp-deployment
  sudo docker compose down --remove-orphans 2>/dev/null || true
  sudo docker compose up --build -d
  sudo docker compose ps
"

# ------------------------------------------------------------------------------
# Step 5: Output Summary & Endpoints
# ------------------------------------------------------------------------------
EXTERNAL_IP=$(gcloud compute instances describe "${INSTANCE_NAME}" --project="${PROJECT_ID}" --zone="${ZONE}" --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo ""
echo "=============================================================================="
echo -e "${GREEN}🎉 NextGen ERP Workflow Module Successfully Deployed on GCP!${NC}"
echo "=============================================================================="
echo -e "🌐 Web App (Nginx Proxy) : ${CYAN}http://${EXTERNAL_IP}${NC}"
echo -e "🖥️ Direct UI Portal      : ${CYAN}http://${EXTERNAL_IP}:3000${NC}"
echo -e "☕ Spring Boot API        : ${CYAN}http://${EXTERNAL_IP}:8080/api/v1${NC}"
echo -e "📖 Swagger Documentation : ${CYAN}http://${EXTERNAL_IP}:8080/swagger-ui.html${NC}"
echo "=============================================================================="
