@echo off
echo Starting ZYVA Healthcare Backend Server...
echo ==========================================
cd /d "%~dp0\backend"
node server.js
pause
