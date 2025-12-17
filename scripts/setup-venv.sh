#!/bin/bash
# PolyWhale - Setup Virtual Environment
# Creates a local venv and installs all dependencies

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENV_DIR="$SCRIPT_DIR/venv"

echo "========================================="
echo "PolyWhale - Virtual Environment Setup"
echo "========================================="
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ ERROR: python3 is not installed!"
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

echo "Python version: $(python3 --version)"
echo ""

# Check if venv already exists
if [ -d "$VENV_DIR" ]; then
    echo "Virtual environment already exists at: $VENV_DIR"
    read -p "Do you want to recreate it? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing old virtual environment..."
        rm -rf "$VENV_DIR"
    else
        echo "Using existing virtual environment."
        echo "To activate manually: source venv/bin/activate"
        exit 0
    fi
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv "$VENV_DIR"

if [ ! -d "$VENV_DIR" ]; then
    echo "❌ ERROR: Failed to create virtual environment!"
    echo "Make sure python3-venv is installed:"
    echo "  sudo apt install python3-venv"
    exit 1
fi

echo "✓ Virtual environment created"
echo ""

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

echo ""
echo "Installing dependencies from requirements.txt..."
pip install -r "$SCRIPT_DIR/requirements.txt"

echo ""
echo "========================================="
echo "✅ Setup complete!"
echo "========================================="
echo ""
echo "Virtual environment created at: $VENV_DIR"
echo ""
echo "To use it:"
echo "  source venv/bin/activate"
echo ""
echo "To run the app with this venv:"
echo "  ./start-app.sh"
echo ""
