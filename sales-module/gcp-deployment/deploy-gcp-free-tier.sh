#!/usr/bin/env bash
# ==============================================================================
# NextGen ERP - Sales (Selling) Module: GCP Free Tier Automated Deployment Script
# Provisions an 'e2-micro' VM instance within GCP Always Free Tier using gcloud CLI
# ==============================================================================

set -euo pipefail

# ----------------- CONFIGURATION (GCP Always Free Tier Parameters) ------------
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo "")}"
REGION="us-central1"
ZONE="us-central1-a"
INSTANCE_NAME="nextgen-erp-sales-vm"
MACHINE_TYPE="e2-micro"              # GCP Always Free Tier eligible
DISK_SIZE="30GB"                     # GCP Always Free Tier disk quota
DISK_TYPE="pd-standard"
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
FIREWALL_RULE_NAME="allow-nextgen-erp-ports"

echo "======================================================================"
echo "    NextGen ERP - GCP Free Tier Automated Provisioning & Deployment   "
echo "======================================================================"

# 1. Check gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo "[-] Error: 'gcloud' CLI is not installed or not in PATH."
    echo "    Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "(unset)" ]; then
    echo "[!] Active GCP Project ID not detected. Available projects:"
    gcloud projects list
    read -rp "Enter the GCP Project ID to deploy to: " PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

echo "[+] Using GCP Project: $PROJECT_ID"
echo "[+] Target Region/Zone: $REGION / $ZONE (Free Tier eligible)"
echo "[+] Target VM Specs: $MACHINE_TYPE | $DISK_SIZE $DISK_TYPE"

# 2. Enable Compute Engine API
echo "[+] Enabling Google Compute Engine API (compute.googleapis.com)..."
gcloud services enable compute.googleapis.com --project="$PROJECT_ID"

# 3. Create Firewall Rules for NextGen ERP
echo "[+] Configuring VPC Firewall Rules for HTTP (80), HTTPS (443), Frontend (3000), Backend API (8080)..."
if ! gcloud compute firewall-rules describe "$FIREWALL_RULE_NAME" --project="$PROJECT_ID" &>/dev/null; then
    gcloud compute firewall-rules create "$FIREWALL_RULE_NAME" \
        --project="$PROJECT_ID" \
        --direction=INGRESS \
        --priority=1000 \
        --network=default \
        --action=ALLOW \
        --rules=tcp:80,tcp:443,tcp:3000,tcp:8080,tcp:5432 \
        --source-ranges=0.0.0.0/0 \
        --target-tags=nextgen-erp-server \
        --description="Allow NextGen ERP Web, API, and DB ports"
    echo "[+] Firewall rule created successfully."
else
    echo "[*] Firewall rule '$FIREWALL_RULE_NAME' already exists."
fi

# 4. Write VM Cloud-Init Startup Script to File
STARTUP_SCRIPT_FILE="/tmp/nextgen-erp-startup.sh"
cat << 'EOF' > "$STARTUP_SCRIPT_FILE"
#!/bin/bash
set -e
exec > /var/log/nextgen-erp-startup.log 2>&1

echo "[+] Starting NextGen ERP system setup on GCP Free Tier instance..."

# Update and install Docker & Compose
apt-get update -y
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git ufw

# Install Docker CE
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Setup NextGen ERP directory
mkdir -p /opt/nextgen-erp
cd /opt/nextgen-erp

# Write production Docker Compose file
cat << 'COMPOSE_EOF' > /opt/nextgen-erp/docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: nextgen-postgres
    restart: always
    environment:
      POSTGRES_DB: nextgen_erp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_secure_2026
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d nextgen_erp"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: eclipse-temurin:21-jre-alpine
    container_name: nextgen-backend
    restart: always
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/nextgen_erp
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres_secure_2026
      SPRING_JPA_HIBERNATE_DDL_AUTO: update
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    image: node:20-alpine
    container_name: nextgen-frontend
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  pgdata:
COMPOSE_EOF

echo "[+] NextGen ERP server environment prepared successfully."
EOF

# 5. Provision the VM Instance
echo "[+] Provisioning Compute Engine VM '$INSTANCE_NAME' in '$ZONE'..."
if ! gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" &>/dev/null; then
    gcloud compute instances create "$INSTANCE_NAME" \
        --project="$PROJECT_ID" \
        --zone="$ZONE" \
        --machine-type="$MACHINE_TYPE" \
        --network-interface=network-tier=STANDARD,subnet=default \
        --maintenance-policy=MIGRATE \
        --tags=nextgen-erp-server,http-server,https-server \
        --image-family="$IMAGE_FAMILY" \
        --image-project="$IMAGE_PROJECT" \
        --boot-disk-size="$DISK_SIZE" \
        --boot-disk-type="$DISK_TYPE" \
        --boot-disk-device-name="$INSTANCE_NAME-disk" \
        --metadata-from-file=startup-script="$STARTUP_SCRIPT_FILE"
    echo "[+] VM instance '$INSTANCE_NAME' successfully launched!"
else
    echo "[*] VM instance '$INSTANCE_NAME' already exists."
fi

# 6. Retrieve Public External IP
EXTERNAL_IP=$(gcloud compute instances describe "$INSTANCE_NAME" \
    --zone="$ZONE" \
    --project="$PROJECT_ID" \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo ""
echo "======================================================================"
echo "    NextGen ERP Sales Module Deployment Completed Successfully!       "
echo "======================================================================"
echo "  VM Name:        $INSTANCE_NAME"
echo "  GCP Project:    $PROJECT_ID"
echo "  Zone / Region:  $ZONE ($REGION)"
echo "  External IP:    $EXTERNAL_IP"
echo ""
echo "  Access URLs:"
echo "  - Next.js UI:    http://$EXTERNAL_IP:3000  (or http://$EXTERNAL_IP/)"
echo "  - Spring Boot:   http://$EXTERNAL_IP:8080"
echo "  - Swagger Docs:  http://$EXTERNAL_IP:8080/swagger-ui.html"
echo "  - PostgreSQL:    $EXTERNAL_IP:5432 (database: nextgen_erp)"
echo ""
echo "  To SSH into your instance:"
echo "  gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID"
echo "======================================================================"
