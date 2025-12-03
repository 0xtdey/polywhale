#!/bin/bash
# PolyWhale - Intelligent launcher
# Automatically handles Python dependencies and environment setup

set -e  # Exit on error

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================"
echo "PolyWhale - Starting Application"
echo "========================================"
echo ""

# Function to check if we're in a packaged app
is_packaged() {
    # If running from /opt/PolyWhale or as AppImage
    [[ "$DIR" == /opt/* ]] || [[ -n "$APPIMAGE" ]]
}

# Function to find Python executable
find_python() {
    if command -v python3 &> /dev/null; then
        echo "python3"
    elif command -v python &> /dev/null; then
        # Check if it's Python 3
        if python --version 2>&1 | grep -q "Python 3"; then
            echo "python"
        else
            return 1
        fi
    else
        return 1
    fi
}

# Check if Python is available
PYTHON_CMD=$(find_python)
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Python 3 is not installed!"
    echo ""
    echo "Please install Python 3.8 or higher:"
    echo "  sudo apt install python3 python3-pip"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Using Python: $PYTHON_CMD ($(${PYTHON_CMD} --version))"
echo ""

# Try to use local venv if it exists (development mode)
if [ -d "$DIR/venv" ] && [ ! "$(is_packaged)" ]; then
    echo "Found local virtual environment, activating..."
    source "$DIR/venv/bin/activate"
    PYTHON_CMD="python"  # Use venv python
    echo "Using venv Python: $(which python)"
    echo ""
fi

# Check dependencies
echo "Checking Python dependencies..."
if ! $PYTHON_CMD "$DIR/check-dependencies.py" > /tmp/polywhale-dep-check.log 2>&1; then
    echo "⚠ Some Python dependencies are missing!"
    echo ""
    cat /tmp/polywhale-dep-check.log
    echo ""
    
    # Try to install dependencies automatically
    echo "Attempting to install missing dependencies..."
    echo ""
    
    # Try different installation methods
    PACKAGES="requests flask flask-cors apscheduler"
    INSTALL_SUCCESS=false
    
    # Method 1: pip with --user (works without sudo)
    if $PYTHON_CMD -m pip install --user $PACKAGES > /tmp/polywhale-install.log 2>&1; then
        echo "✓ Dependencies installed successfully (user mode)"
        INSTALL_SUCCESS=true
    # Method 2: pip with --break-system-packages (newer Ubuntu/Debian)
    elif $PYTHON_CMD -m pip install --break-system-packages $PACKAGES > /tmp/polywhale-install.log 2>&1; then
        echo "✓ Dependencies installed successfully"
        INSTALL_SUCCESS=true
    fi
    
    if [ "$INSTALL_SUCCESS" = false ]; then
        echo "❌ Failed to install dependencies automatically!"
        echo ""
        echo "Please install manually:"
        echo "  $PYTHON_CMD -m pip install --user $PACKAGES"
        echo ""
        echo "Or create a virtual environment:"
        echo "  ./setup-venv.sh"
        echo "  source venv/bin/activate"
        echo "  ./start-app.sh"
        echo ""
        read -p "Press Enter to exit..."
        exit 1
    fi
    
    echo ""
    # Verify installation worked
    if ! $PYTHON_CMD "$DIR/check-dependencies.py" > /dev/null 2>&1; then
        echo "❌ Dependencies still missing after installation!"
        echo "Please try manual installation."
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

echo "✓ All dependencies available"
echo ""

# Check if node_modules exists (for Electron)
if [ ! -d "$DIR/node_modules" ]; then
    echo "⚠ Node modules not found. Installing..."
    if command -v npm &> /dev/null; then
        npm install
    else
        echo "❌ ERROR: npm is not installed!"
        echo "Please install Node.js and npm, then run: npm install"
        exit 1
    fi
fi

# Start the Electron app
echo "Starting PolyWhale..."
echo ""

# Run with --no-sandbox for Linux compatibility
if [ -x "$DIR/node_modules/.bin/electron" ]; then
    exec "$DIR/node_modules/.bin/electron" . --no-sandbox
else
    echo "❌ ERROR: Electron not found!"
    echo "Please run: npm install"
    exit 1
fi

