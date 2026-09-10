# ==============================================================================
# NextGen ERP - Master Cloud Database Initializer (HRM & Accounting)
# VM: nextgen-erp-core-vm (e2-micro) | Project: nextgen-erp-7753216
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Magenta
Write-Host "       NextGen ERP - Multi-Module Cloud Database Initializer          " -ForegroundColor Magenta
Write-Host "======================================================================" -ForegroundColor Magenta

# 1. Initialize HRM Module Database
Write-Host "`n🚀 [1/2] Initializing HRM Database (nextgen_erp_hrm)..." -ForegroundColor Cyan
& "$PSScriptRoot/hrm-module/init-remote-db.ps1"

# 2. Initialize Accounting Module Database
Write-Host "`n🚀 [2/2] Initializing Accounting Database (nextgen_erp_accounting)..." -ForegroundColor Cyan
& "$PSScriptRoot/accounting-module/init-remote-db.ps1"

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host "✨ All databases successfully initialized on nextgen-erp-core-vm!" -ForegroundColor Green
Write-Host "   - HRM DB:        nextgen_erp_hrm" -ForegroundColor Green
Write-Host "   - Accounting DB: nextgen_erp_accounting" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
