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

Write-Host "All modules are starting! Note: Next.js and Spring Boot builds may take a few minutes."
Write-Host "============================"
Write-Host "Sales Module:      http://localhost:3000 (UI) | http://localhost:8080 (API)"
Write-Host "HRM Module:        http://localhost:3001 (UI) | http://localhost:8081 (API) | http://localhost:81 (Nginx proxy)"
Write-Host "Finance & Accounts:http://localhost:3004 (UI) | http://localhost:8084 (API)"
Write-Host "Workflow Module:   http://localhost:3002 (UI) | http://localhost:8082 (API)"
Write-Host "Projects Module:   http://localhost:3003 (UI) | http://localhost:8083 (API)"
Write-Host "============================"

