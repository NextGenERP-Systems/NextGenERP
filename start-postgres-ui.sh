#!/usr/bin/env bash
# ==============================================================================
# NextGen ERP - PostgreSQL UI Launcher (pgweb + Google Cloud IAP Tunnel)
# Connects local pgweb UI to the PostgreSQL database running on GCP Free Tier VM
# ==============================================================================

set -euo pipefail

PROJECT_ID="nextgen-erp-7753216"
ZONE="us-central1-a"
INSTANCE_NAME="nextgen-erp-core-vm"
LOCAL_PORT=5432
REMOTE_PORT=5432
UI_PORT=8081
DB_NAME="${1:-nextgen_erp}" # Default to nextgen_erp, can pass workflow_db as arg

echo "======================================================================"
echo "    NextGen ERP: Connecting Local PostgreSQL UI to GCP Database      "
echo "======================================================================"
echo "  GCP Project   : $PROJECT_ID"
echo "  GCP VM        : $INSTANCE_NAME ($ZONE)"
echo "  Target DB     : $DB_NAME"
echo "  Local UI Port : http://localhost:$UI_PORT"
echo "======================================================================"

# 1. Check if pgweb is installed
if ! command -v pgweb &> /dev/null; then
    echo "[!] pgweb not found. Installing via Homebrew..."
    brew install pgweb
fi

# 2. Check if port 5432 is already mapped or start IAP SSH tunnel
TUNNEL_PID=""
if nc -z localhost "$LOCAL_PORT" &>/dev/null; then
    echo "[*] Port $LOCAL_PORT is already listening (tunnel or local DB active)."
else
    echo "[+] Establishing secure Google Cloud IAP tunnel to GCP VM..."
    gcloud compute ssh "$INSTANCE_NAME" \
        --zone="$ZONE" \
        --project="$PROJECT_ID" \
        --tunnel-through-iap \
        -- -N -L "${LOCAL_PORT}:localhost:${REMOTE_PORT}" -o ServerAliveInterval=30 -o ServerAliveCountMax=120 &
    TUNNEL_PID=$!

    # Wait for tunnel to be ready
    echo -n "[+] Waiting for database connection..."
    for i in {1..30}; do
        if nc -z localhost "$LOCAL_PORT" &>/dev/null; then
            echo " Connected!"
            break
        fi
        sleep 1
        echo -n "."
    done
fi

# Cleanup on exit
cleanup() {
    echo ""
    echo "[*] Stopping PostgreSQL UI..."
    if [ -n "$TUNNEL_PID" ]; then
        echo "[*] Closing GCP IAP tunnel (PID: $TUNNEL_PID)..."
        kill "$TUNNEL_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT INT TERM

echo "[+] Opening PostgreSQL Web UI at http://localhost:$UI_PORT ..."
open "http://localhost:$UI_PORT" || true

echo "[+] Starting pgweb interface (Press Ctrl+C to stop)..."
pgweb --bind=localhost \
      --listen="$UI_PORT" \
      --url="postgres://postgres:postgres@localhost:${LOCAL_PORT}/${DB_NAME}?sslmode=disable"
