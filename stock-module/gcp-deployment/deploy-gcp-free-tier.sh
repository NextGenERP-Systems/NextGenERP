#!/usr/bin/env bash
# ==============================================================================
# NextGen ERP - Stock & Inventory Module: GCP Free Tier Deployment Script
# Provisions an 'e2-micro' / 'e2-small' VM instance within GCP Free Tier
# ==============================================================================

set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo "")}"
REGION="us-central1"
ZONE="us-central1-a"
INSTANCE_NAME="${INSTANCE_NAME:-nextgen-erp-stock-vm}"
MACHINE_TYPE="e2-micro"
DISK_SIZE="30GB"
DISK_TYPE="pd-standard"
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
FIREWALL_RULE_NAME="allow-nextgen-stock-ports"

echo "======================================================================"
echo "   NextGen ERP - Stock Module: GCP Free Tier Deployment Script        "
echo "======================================================================"

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
echo "[+] Target Region/Zone: $REGION / $ZONE"
echo "[+] Target VM Specs: $MACHINE_TYPE | $DISK_SIZE $DISK_TYPE"

echo "[+] Enabling Google Compute Engine API..."
gcloud services enable compute.googleapis.com --project="$PROJECT_ID"

echo "[+] Configuring VPC Firewall Rules for HTTP (80), HTTPS (443), Frontend (3003), Backend API (8084)..."
if ! gcloud compute firewall-rules describe "$FIREWALL_RULE_NAME" --project="$PROJECT_ID" &>/dev/null; then
    gcloud compute firewall-rules create "$FIREWALL_RULE_NAME" \
        --project="$PROJECT_ID" \
        --direction=INGRESS \
        --priority=1000 \
        --network=default \
        --action=ALLOW \
        --rules=tcp:80,tcp:443,tcp:3003,tcp:8084,tcp:5432 \
        --source-ranges=0.0.0.0/0 \
        --target-tags=nextgen-stock-server \
        --description="Allow NextGen ERP Stock Web, API, and DB ports"
    echo "[+] Firewall rule created successfully."
fi

echo "[+] Checking if VM instance '$INSTANCE_NAME' exists..."
if ! gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" &>/dev/null; then
    echo "[+] Creating Free Tier Compute Engine VM '$INSTANCE_NAME'..."
    gcloud compute instances create "$INSTANCE_NAME" \
        --project="$PROJECT_ID" \
        --zone="$ZONE" \
        --machine-type="$MACHINE_TYPE" \
        --network-interface=network-tier=STANDARD,subnet=default \
        --maintenance-policy=MIGRATE \
        --tags=nextgen-stock-server,http-server,https-server \
        --create-disk=auto-delete=yes,boot=yes,image-family="$IMAGE_FAMILY",image-project="$IMAGE_PROJECT",size="$DISK_SIZE",type="$DISK_TYPE" \
        --metadata=startup-script='#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose git curl
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu
'
    echo "[+] VM instance created."
fi

EXTERNAL_IP=$(gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
echo "[+] VM External IP: $EXTERNAL_IP"
echo "[+] Stock Module Cloud URL: http://$EXTERNAL_IP:3003/stock"
echo "[+] Stock REST API Cloud URL: http://$EXTERNAL_IP:8084/api/v1/stock"
echo "[+] Swagger Documentation: http://$EXTERNAL_IP:8084/swagger-ui/index.html"
echo "======================================================================"
