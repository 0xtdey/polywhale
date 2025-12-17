#!/bin/bash
set -e

echo "========================================"
echo "Building Bundled Backend with PyInstaller"
echo "========================================"

# 1. Create/Activate Virtual Environment
if [ ! -d "venv_build" ]; then
    echo "Creating build environment..."
    python3 -m venv venv_build
fi

source venv_build/bin/activate

# 2. Install Dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
pip install pyinstaller

# 3. Build Binary
echo "Building binary..."
# Clean previous builds
rm -rf build/backend_server dist/backend_server

# Run PyInstaller
pyinstaller backend_server.py \
    --name=backend_server \
    --onefile \
    --clean \
    --add-data="config.py:." \
    --add-data="database.py:." \
    --add-data="polymarket_api.py:." \
    --add-data="notifier_service.py:." \
    --hidden-import=flask \
    --hidden-import=flask_cors \
    --hidden-import=requests \
    --hidden-import=apscheduler \
    --hidden-import=notify2 \
    --hidden-import=dbus \
    --log-level=WARN

echo "========================================"
echo "Build Complete!"
echo "Binary location: dist/backend_server"
echo "========================================"

# 4. Verify Binary
echo "Verifying binary..."
./dist/backend_server --help > /dev/null 2>&1 || true
if [ -f "dist/backend_server" ]; then
    echo "✅ Binary created successfully"
else
    echo "❌ Binary creation failed"
    exit 1
fi
