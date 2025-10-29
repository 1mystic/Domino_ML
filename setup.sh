#!/bin/bash
# GlideML Flask - Setup Script for Linux/Mac
# This script sets up the Flask application automatically

echo ""
echo "========================================"
echo " GlideML Flask - Setup Script"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo "[1/6] Python found"
python3 --version
echo ""

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "[2/6] Virtual environment already exists"
else
    echo "[2/6] Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment"
        exit 1
    fi
    echo "Virtual environment created successfully"
fi
echo ""

# Activate virtual environment
echo "[3/6] Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to activate virtual environment"
    exit 1
fi
echo "Virtual environment activated"
echo ""

# Install dependencies
echo "[4/6] Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ -f ".env" ]; then
    echo "[5/6] Environment file (.env) already exists"
else
    echo "[5/6] Creating .env file..."
    cp .env.example .env
    echo ".env file created from .env.example"
    echo "IMPORTANT: Edit .env and set SECRET_KEY to a secure random value"
fi
echo ""

# Initialize database
echo "[6/6] Initializing database..."
python3 << EOF
from app import create_app, db
app = create_app()
with app.app_context():
    db.create_all()
    print('Database initialized successfully')
EOF

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to initialize database"
    exit 1
fi
echo ""

echo "========================================"
echo " Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Edit .env and set SECRET_KEY to a secure random value"
echo "  2. Run: python3 run.py"
echo "  3. Open: http://localhost:5000"
echo ""
echo "For data files:"
echo "  - Run: python3 convert_data.py"
echo "  - Manually convert TypeScript data to JSON format"
echo ""
echo "See README.md and MIGRATION_SUMMARY.md for more info"
echo ""
