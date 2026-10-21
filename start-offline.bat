@echo off
TITLE Mepco Retail Hub - 100% Offline Local Mode
echo ===================================================
echo   MEPCO RETAIL HUB - 100% OFFLINE LOCAL RUNNER
echo   Zero Cloud Server Dependencies - Local MongoDB
echo ===================================================
echo.

:: 1. Set environment variables to local offline MongoDB Compass
set MONGODB_URI=mongodb://127.0.0.1:27017/smart_inventory
set PORT=3000
set NODE_ENV=development

echo [1/3] Target Database: %MONGODB_URI% (MongoDB Compass Local)
echo [2/3] Checking dependencies...

if not exist "node_modules" (
  echo Installing local packages...
  call npm install
)

echo.
echo [3/3] Starting local offline server on http://localhost:3000...
echo All tasks (Billing, Packaging QR Code, Reviews, Phone Verification, Stock Editing)
echo operate 100% offline with zero cloud server requirements.
echo.
echo Open your browser at: http://localhost:3000
echo In MongoDB Compass, connect to: mongodb://localhost:27017
echo You will see the database 'smart_inventory' with all collections.
echo.
call npm run offline
pause
