#!/usr/bin/env bash
# ==============================================================================
# NextGen ERP - Master Cloud Database Initializer (HRM & Accounting)
# VM: nextgen-erp-core-vm (e2-micro) | Project: nextgen-erp-7753216
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================================================"
echo "       NextGen ERP - Multi-Module Cloud Database Initializer          "
echo "======================================================================"

echo ""
echo "[1/2] Initializing HRM Database (nextgen_erp_hrm)..."
bash "$SCRIPT_DIR/hrm-module/init-remote-db.sh"

echo ""
echo "[2/2] Initializing Accounting Database (nextgen_erp_accounting)..."
bash "$SCRIPT_DIR/accounting-module/init-remote-db.sh"

echo ""
echo "======================================================================"
echo "SUCCESS: All databases successfully initialized on nextgen-erp-core-vm!"
echo "   - HRM DB:        nextgen_erp_hrm"
echo "   - Accounting DB: nextgen_erp_accounting"
echo "======================================================================"
