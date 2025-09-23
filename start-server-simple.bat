@echo off
echo Starting ZYVA Healthcare Backend Server...
echo ==========================================

REM Kill any existing Node.js processes on port 3000
echo Stopping any existing server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Wait a moment for the port to be freed
timeout /t 2 /nobreak >nul

REM Start the server
echo Starting server...
cd /d "%~dp0\backend"
node server.js
pause


