@echo off
title Frameora - website (keep this window open)
cd /d "%~dp0"
where node >/dev/null 2>/dev/null || (echo Node.js is not installed. Please install the LTS version from https://nodejs.org and run this again. & pause & exit /b)
if not exist node_modules (echo Installing packages - first time only, this can take a few minutes... & call npm install)
start "" cmd /c "timeout /t 10 >/dev/null & start http://localhost:3001"
call npm run dev
pause
