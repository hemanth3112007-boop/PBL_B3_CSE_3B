@echo off
echo ============================================================
echo   SkillLoop AI - Starting Unified Platform
echo ============================================================
echo.
echo [1/2] Launching Spring Boot Backend on http://localhost:8080 ...
start "SkillLoop Backend (Spring Boot :8080)" cmd /k "mvnw spring-boot:run"

echo [2/2] Launching React Frontend UI on http://localhost:3000 ...
start "SkillLoop Frontend (React Vite :3000)" cmd /k "cd frontend && npm run dev"

echo.
echo Both services are launching in separate terminal windows.
echo - Web Application UI: http://localhost:3000
echo - Backend REST API:   http://localhost:8080
echo - Swagger Docs:       http://localhost:8080/swagger-ui.html
echo - H2 Database:        http://localhost:8080/h2-console
echo ============================================================

