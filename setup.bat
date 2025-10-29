@echo off
REM GlideML Flask - Setup Script for Windows
REM This script sets up the Flask application automatically

echo.
echo ========================================
echo  GlideML Flask - Setup Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from python.org
    pause
    exit /b 1
)

echo [1/6] Python found
python --version
echo.

REM Check if virtual environment exists
if exist venv (
    echo [2/6] Virtual environment already exists
) else (
    echo [2/6] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created successfully
)
echo.

REM Activate virtual environment
echo [3/6] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo Virtual environment activated
echo.

REM Install dependencies
echo [4/6] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully
echo.

REM Create .env file if it doesn't exist
if exist .env (
    echo [5/6] Environment file (.env) already exists
) else (
    echo [5/6] Creating .env file...
    copy .env.example .env >nul
    echo .env file created from .env.example
    echo IMPORTANT: Edit .env and set SECRET_KEY to a secure random value
)
echo.

REM Initialize database
echo [6/6] Initializing database...
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all(); print('Database initialized successfully')"
if errorlevel 1 (
    echo ERROR: Failed to initialize database
    pause
    exit /b 1
)
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit .env and set SECRET_KEY to a secure random value
echo   2. Run: python run.py
echo   3. Open: http://localhost:5000
echo.
echo For data files:
echo   - Run: python convert_data.py
echo   - Manually convert TypeScript data to JSON format
echo.
echo See README.md and MIGRATION_SUMMARY.md for more info
echo.
pause
