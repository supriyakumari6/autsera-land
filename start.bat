@echo off
title Autsera Land server
cd /d "%~dp0backend"
echo.
echo  === Autsera Land ===
where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js is not installed. Install the LTS version from https://nodejs.org then run this again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo  First run: installing packages, please wait...
  call npm install
)
echo  Starting the server. Keep this window OPEN while you play.
echo.
node server.js
echo.
echo  The server stopped. Read the message above.
pause
