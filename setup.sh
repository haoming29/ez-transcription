#!/bin/bash
echo "Starting setup script..."

# Check if python3 is installed
if ! command -v python3 &> /dev/null
then
    echo "python3 could not be found. Please install it."
    exit
fi

if [ -d "venv" ]; then
    echo "Error: Virtual environment 'venv' already exists."
    exit 1
fi

# Create a virtual environment under the current directory
python3 -m venv venv

echo "Created virtual environment."

# Activate the virtual environment
source venv/bin/activate

# Check if pip is installed in the virtual environment
if ! command -v pip &> /dev/null
then
    echo "pip could not be found in the virtual environment. Please ensure it's installed."
    deactivate
    exit
fi

echo "Start installing pip packages..."

# Install packages from requirements.txt
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "requirements.txt not found in the current directory."
fi

echo "Setup finished"