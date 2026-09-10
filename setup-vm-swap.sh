#!/usr/bin/env bash
# ==============================================================================
# NextGen ERP - Provision 4GB Swap Space on GCP e2-micro VM (nextgen-erp-core-vm)
# Safeguards 1.0 GB RAM VM against Linux OOM-killer during Spring Boot JVM startups
# ==============================================================================

set -euo pipefail

SWAPFILE="/swapfile"
SWAP_SIZE_GB="4"

echo "======================================================================"
echo "    Configuring 4GB Swap Space on nextgen-erp-core-vm                "
echo "======================================================================"

if swapon --show | grep -q "$SWAPFILE"; then
    echo "[*] Swap file $SWAPFILE is already active:"
    swapon --show
    free -h
    exit 0
fi

echo "[+] Allocating ${SWAP_SIZE_GB}GB swapfile at $SWAPFILE..."
fallocate -l "${SWAP_SIZE_GB}G" "$SWAPFILE" || dd if=/dev/zero of="$SWAPFILE" bs=1M count=$((SWAP_SIZE_GB * 1024))
chmod 600 "$SWAPFILE"
mkswap "$SWAPFILE"
swapon "$SWAPFILE"

if ! grep -q "$SWAPFILE" /etc/fstab; then
    echo "$SWAPFILE none swap sw 0 0" >> /etc/fstab
    echo "[+] Added $SWAPFILE to /etc/fstab"
fi

sysctl vm.swappiness=20
if ! grep -q "vm.swappiness" /etc/sysctl.conf; then
    echo "vm.swappiness=20" >> /etc/sysctl.conf
fi

echo "======================================================================"
echo "[+] Swap configuration completed successfully!"
free -h
echo "======================================================================"
