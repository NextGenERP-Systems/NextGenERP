Write-Host "Starting Sales Module..."
Push-Location sales-module
docker compose up -d --build
Pop-Location

Write-Host "Starting Workflow Module..."
Push-Location workflow-module
docker compose up -d --build
Pop-Location

Write-Host "Starting HRM Module..."
Push-Location hrm-module/gcp-deployment
docker compose up -d --build
Pop-Location

Write-Host "Starting Accounting & Finance Module..."
Push-Location accounting-module
docker compose up -d --build
Pop-Location

Write-Host "Starting Projects Module..."
Push-Location projects-module
docker compose up -d --build
Pop-Location

Write-Host "Starting Manufacturing & MRP Module..."
Push-Location mrp-module
docker compose up -d --build
Pop-Location

Write-Host "Starting CRM Module..."
Push-Location crm-module
docker compose up -d --build
Pop-Location

Write-Host "Starting Stock Frontend..."
docker compose -f docker-compose.stock.yml up -d --build stock_frontend

Write-Host "All modules are running!"
Write-Host "======================================================================"
Write-Host "Sales Module:        http://localhost:3000 (UI) | http://localhost:8080 (API)"
Write-Host "Workflow Module:     http://localhost:3000 (UI) | http://localhost:8081 (API)"
Write-Host "HRM Module:          http://localhost:3001 (UI) | http://localhost:8083 (API)"
Write-Host "Projects Module:     http://localhost:3003 (UI) | http://localhost:8087 (API)"
Write-Host "Finance & Accounts:  http://localhost:3004 (UI) | http://localhost:8086 (API)"
Write-Host "Manufacturing MRP:   http://localhost:3005 (UI) | http://localhost:8085 (API)"
Write-Host "Stock & Inventory:   http://localhost:3006 (UI) | http://localhost:8084 (API)"
Write-Host "CRM Backend:         (Standalone API)           | http://localhost:8088 (API)"
Write-Host "======================================================================"
