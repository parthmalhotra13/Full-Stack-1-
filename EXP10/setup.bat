@echo off
REM MERN Todo App - Setup Script for Windows

echo.
echo ========================================
echo  MERN Todo Application Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo ✓ Node.js is installed
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    cd ..
    exit /b 1
)
cd ..
echo ✓ Backend dependencies installed
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    exit /b 1
)
cd ..
echo ✓ Frontend dependencies installed
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Ensure MongoDB is running (mongod)
echo 2. Open Terminal 1: cd backend && npm start
echo 3. Open Terminal 2: cd frontend && npm start
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo ========================================
echo.
pause
