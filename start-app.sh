#!/bin/bash

# PolyWhale - Simple launcher
# Just double-click this file to run the app!

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to app directory
cd "$DIR"

# Activate virtual environment
if [ -d "/home/tamoghna/rezlabs/rez1/hypeAI/venv" ]; then
    source /home/tamoghna/rezlabs/rez1/hypeAI/venv/bin/activate
    echo "Using virtual environment"
fi

# Make sure Flask is installed
pip list | grep -q Flask || pip install flask flask-cors

# Run the Electron app directly with no-sandbox flag
./node_modules/.bin/electron . --no-sandbox
