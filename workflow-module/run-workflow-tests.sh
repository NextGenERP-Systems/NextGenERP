#!/usr/bin/env bash
# =============================================================================
# run-workflow-tests.sh
# NextGen ERP — Workflow Module Test Runner
#
# Runs all three test layers in order:
#   1. Java unit tests          (Maven / JUnit 5 / Mockito)
#   2. Java integration tests   (Spring @WebMvcTest slice / H2)
#   3. Playwright E2E tests     (Frontend workflow flows)
#
# Usage:
#   ./run-workflow-tests.sh              # run all layers
#   ./run-workflow-tests.sh --unit       # unit tests only
#   ./run-workflow-tests.sh --integration # integration tests only
#   ./run-workflow-tests.sh --e2e        # E2E tests only
#   ./run-workflow-tests.sh --headed     # E2E in headed browser mode
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Colour helpers
# ---------------------------------------------------------------------------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[PASS]${NC}  $*"; }
warning() { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[FAIL]${NC}  $*" >&2; }
header()  { echo -e "\n${BLUE}══════════════════════════════════════${NC}"; \
             echo -e "${BLUE}  $*${NC}"; \
             echo -e "${BLUE}══════════════════════════════════════${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
RUN_UNIT=true
RUN_INTEGRATION=true
RUN_E2E=true
E2E_HEADED=""

for arg in "$@"; do
  case $arg in
    --unit)        RUN_UNIT=true;  RUN_INTEGRATION=false; RUN_E2E=false ;;
    --integration) RUN_UNIT=false; RUN_INTEGRATION=true;  RUN_E2E=false ;;
    --e2e)         RUN_UNIT=false; RUN_INTEGRATION=false; RUN_E2E=true  ;;
    --headed)      E2E_HEADED="--headed" ;;
  esac
done

FAILURES=0
PASS_COUNT=0

# ===========================================================================
# LAYER 1 — Unit Tests (Java / JUnit 5 / Mockito)
# ===========================================================================
if [[ "$RUN_UNIT" == "true" ]]; then
  header "LAYER 1: Unit Tests (WorkflowService + DocumentService)"
  info "Running Maven Surefire unit tests…"

  cd "${BACKEND_DIR}"
  if mvn test \
       -Dtest="WorkflowServiceTest,DocumentServiceExtendedTest" \
       -DfailIfNoTests=false \
       -Dspring.profiles.active=test \
       --no-transfer-progress \
       2>&1; then
    success "Unit tests PASSED"
    ((PASS_COUNT++))
  else
    error "Unit tests FAILED"
    ((FAILURES++))
  fi
fi

# ===========================================================================
# LAYER 2 — Integration Tests (Spring @WebMvcTest slice)
# ===========================================================================
if [[ "$RUN_INTEGRATION" == "true" ]]; then
  header "LAYER 2: Integration Tests (DocumentController @WebMvcTest)"
  info "Running Spring MVC slice tests with H2 in-memory DB…"

  cd "${BACKEND_DIR}"
  if mvn test \
       -Dtest="DocumentControllerTest" \
       -DfailIfNoTests=false \
       -Dspring.profiles.active=test \
       --no-transfer-progress \
       2>&1; then
    success "Integration tests PASSED"
    ((PASS_COUNT++))
  else
    error "Integration tests FAILED"
    ((FAILURES++))
  fi
fi

# ===========================================================================
# LAYER 3 — E2E Tests (Playwright)
# ===========================================================================
if [[ "$RUN_E2E" == "true" ]]; then
  header "LAYER 3: E2E Tests (Playwright — Workflow Module)"

  # Check if the frontend server is already running
  if curl -s --max-time 3 "${E2E_BASE_URL:-http://localhost:3000}" > /dev/null 2>&1; then
    info "Frontend server detected at ${E2E_BASE_URL:-http://localhost:3000}"
  else
    warning "Frontend server NOT detected. Starting dev server…"
    cd "${FRONTEND_DIR}"
    npm run dev &
    DEV_SERVER_PID=$!
    trap "kill ${DEV_SERVER_PID} 2>/dev/null || true" EXIT
    # Wait for server to be ready
    info "Waiting for dev server to start (max 30s)…"
    for i in {1..30}; do
      if curl -s --max-time 1 "http://localhost:3000" > /dev/null 2>&1; then
        success "Dev server ready"
        break
      fi
      sleep 1
    done
  fi

  # Install Playwright browsers if not present
  cd "${FRONTEND_DIR}"
  if ! npx playwright --version > /dev/null 2>&1; then
    info "Installing Playwright and browsers…"
    npm install --save-dev @playwright/test
    npx playwright install --with-deps
  fi

  info "Running Playwright E2E tests…"
  if npx playwright test e2e/workflow-module.spec.ts \
       ${E2E_HEADED} \
       --reporter=list \
       2>&1; then
    success "E2E tests PASSED"
    ((PASS_COUNT++))
  else
    error "E2E tests FAILED — check playwright-report/index.html for details"
    ((FAILURES++))
    # Open report automatically on failure (local dev only)
    if [[ -z "${CI:-}" && -f "${FRONTEND_DIR}/playwright-report/index.html" ]]; then
      warning "Opening Playwright HTML report…"
      open "${FRONTEND_DIR}/playwright-report/index.html" 2>/dev/null || true
    fi
  fi
fi

# ===========================================================================
# Summary
# ===========================================================================
header "TEST SUMMARY"
echo -e "  ${GREEN}PASSED:${NC}  ${PASS_COUNT} layer(s)"
echo -e "  ${RED}FAILED:${NC}  ${FAILURES} layer(s)"
echo ""

if [[ $FAILURES -gt 0 ]]; then
  error "One or more test layers failed. See output above."
  exit 1
else
  success "All test layers passed! ✓"
  exit 0
fi
