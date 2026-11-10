# SkillLoop AI - Launch Backend and Frontend concurrently
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SkillLoop AI - Starting Unified Platform" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/2] Launching Spring Boot Backend on http://localhost:8080..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; .\mvnw spring-boot:run"

Write-Host "[2/2] Launching React Frontend UI on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "Both services are running:" -ForegroundColor Yellow
Write-Host "  - Web Application UI: http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend REST API:   http://localhost:8080" -ForegroundColor White
Write-Host "  - Swagger Docs:       http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "  - H2 Database:        http://localhost:8080/h2-console" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan

