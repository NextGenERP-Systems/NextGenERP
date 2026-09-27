#!/usr/bin/env bash
# ==============================================================================
# NextGen ERP - Master Module Orchestrator (macOS & Linux)
# Starts and verifies all 8 ERP microservice and frontend modules locally.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================================================"
echo "          NextGen ERP - Enterprise Suite Master Orchestrator          "
echo "======================================================================"

# Ensure shared docker network exists
docker network inspect nextgenerp_default >/dev/null 2>&1 || docker network create nextgenerp_default

# 1. Sales & Workflow Modules (Port 8080 API, Port 8081 API, Port 3000 UI, Port 5432 DB)
echo ""
echo "[1/6] Ensuring Sales & Workflow Stack is running..."
docker compose -f docker-compose.sales-workflow.yml up -d

# 2. HRM Module (Port 8083 API, Port 3001 UI, Port 5433 DB)
echo ""
echo "[2/6] Ensuring HRM Stack is running..."
docker compose -f docker-compose.hrm.yml up -d

# 3. Stock Module (Port 8084 API, Port 3006 UI)
echo ""
echo "[3/6] Ensuring Stock Stack is running..."
docker compose -f docker-compose.stock.yml up -d --build stock_frontend

# 4. Accounting & Finance Module (Port 8086 API, Port 3004 UI, Port 5434 DB)
echo ""
echo "[4/6] Starting Accounting & Finance Module..."
(cd accounting-module && docker compose up -d --build)

# 5. Projects Module (Port 8087 API, Port 3003 UI)
echo ""
echo "[5/6] Starting Projects Module..."
(cd projects-module && docker compose up -d --build)

# 6. Manufacturing MRP & Isolated CRM Modules
echo ""
echo "[6/6] Starting Manufacturing MRP and CRM Modules..."
(cd mrp-module && docker compose up -d --build)
(cd crm-module && docker compose up -d --build)

echo ""
echo "======================================================================"
echo "          All NextGen ERP Modules Launched Successfully!              "
echo "======================================================================"
echo ""
echo "Access URLs:"
echo "----------------------------------------------------------------------"
echo "  1. Sales & Commercial:    http://localhost:3000 (UI) | http://localhost:8080 (API)"
echo "  2. Workflow Automation:   http://localhost:3000 (UI) | http://localhost:8081 (API)"
echo "  3. HRM & People Ops:      http://localhost:3001 (UI) | http://localhost:8083 (API)"
echo "  4. Projects & Tasks:      http://localhost:3003 (UI) | http://localhost:8087 (API)"
echo "  5. Finance & Accounts:    http://localhost:3004 (UI) | http://localhost:8086 (API)"
echo "  6. Manufacturing MRP:     http://localhost:3005 (UI) | http://localhost:8085 (API)"
echo "  7. Stock & Inventory:     http://localhost:3006 (UI) | http://localhost:8084 (API)"
echo "  8. CRM Engine:            (Standalone API)           | http://localhost:8088 (API)"
echo "----------------------------------------------------------------------"
