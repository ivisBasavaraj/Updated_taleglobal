@echo off
echo Fixing placement login issues...
echo.

echo Step 1: Stopping any running processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM react-scripts.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Step 2: Clearing npm cache...
cd frontend
call npm cache clean --force
cd..

echo Step 3: Clearing build cache...
if exist frontend\build rmdir /s /q frontend\build

echo Step 4: Installing dependencies...
cd frontend
call npm install
cd..

echo Step 5: Starting backend server...
start cmd /k "cd backend && npm start"

echo Step 6: Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Step 7: Starting frontend development server...
start cmd /k "cd frontend && npm start"

echo.
echo Fix complete! Please:
echo 1. Clear your browser cache (Ctrl+Shift+R)
echo 2. Clear browser localStorage for localhost:3000
echo 3. Try logging in again
echo.
echo If issues persist, check that both servers are running on ports 5000 and 3000.
pause