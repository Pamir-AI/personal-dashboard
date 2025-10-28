#!/bin/bash

# Personal Dashboard - Quick Start Script

cd "$(dirname "$0")"

echo "🔥 Starting Personal Dashboard..."

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Start Flask server
echo "🚀 Starting Flask server on http://localhost:5000"
cd backend
source venv/bin/activate
python app.py
