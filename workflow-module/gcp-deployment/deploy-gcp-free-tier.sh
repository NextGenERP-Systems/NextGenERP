#!/usr/bin/env bash
# ==============================================================================
# NextGen ERP - Workflow Automated Google Cloud Free-Tier Provisioning Script
# Target: e2-micro VM in GCP Always Free Tier (us-central1-a)
# ==============================================================================

set -e

PROJECT_ID=$(gcloud config get-value project)
INSTANCE_NAME="nextgen-workflow-instance"
ZONE="us-central1-a"
MACHINE_TYPE="e2-micro"
BOOT_DISK_SIZE="30GB"
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"

echo "🚀 [1/4] Starting NextGen ERP Workflow Deployment on GCP Project: ${PROJECT_ID}..."

# 1. Create Firewall Rules
echo "🛡️ [2/4] Setting up GCP VPC Firewall Rules for HTTP, HTTPS, API, and UI..."
gcloud compute firewall-rules create allow-nextgen-workflow \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:80,tcp:443,tcp:8080,tcp:3000 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=nextgen-workflow || echo "Firewall rule already exists."

# 2. Provision Compute Engine e2-micro instance
echo "💻 [3/4] Provisioning Free Tier Compute Engine VM (${MACHINE_TYPE} in ${ZONE})..."
gcloud compute instances create ${INSTANCE_NAME} \
    --project=${PROJECT_ID} \
    --zone=${ZONE} \
    --machine-type=${MACHINE_TYPE} \
    --network-interface=network-tier=STANDARD,subnet=default \
    --maintenance-policy=MIGRATE \
    --tags=nextgen-workflow,http-server,https-server \
    --create-disk=auto-delete=yes,boot=yes,image-family=${IMAGE_FAMILY},image-project=${IMAGE_PROJECT},mode=rw,size=${BOOT_DISK_SIZE},type=pd-standard \
    --metadata=startup-script='#!/bin/bash
    apt-get update
    apt-get install -y docker.io docker-compose git
    systemctl enable --now docker
    ' || echo "Instance already exists."

# 3. Output IP Address
echo "✨ [4/4] Fetching VM External IP Address..."
EXTERNAL_IP=$(gcloud compute instances describe ${INSTANCE_NAME} --zone=${ZONE} --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "=============================================================================="
echo "🎉 NextGen ERP Workflow Cloud VM successfully initialized!"
echo "🌐 Workflow UI Portal: http://${EXTERNAL_IP}:3000"
echo "☕ Spring Boot API: http://${EXTERNAL_IP}:8080/api/v1"
echo "=============================================================================="
