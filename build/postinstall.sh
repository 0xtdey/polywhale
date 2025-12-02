#!/bin/bash
# Post-installation script for PolyWhale

echo "========================================="
echo "PolyWhale - Installing Python dependencies"
echo "========================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: python3 is not installed!"
    echo "Please install Python 3 and try again."
    exit 1
fi

echo "Python version: $(python3 --version)"

# Install Python packages with different methods until one succeeds
echo ""
echo "Attempting to install Python packages..."

PACKAGES="requests flask flask-cors apscheduler notify2 dbus-python"

# Try method 1: pip3 with --user flag
if pip3 install --user $PACKAGES 2>/dev/null; then
    echo "✓ Successfully installed packages using pip3 --user"
    INSTALL_SUCCESS=true
# Try method 2: pip3 with --break-system-packages (for newer systems)
elif pip3 install --break-system-packages $PACKAGES 2>/dev/null; then
    echo "✓ Successfully installed packages using pip3 --break-system-packages"
    INSTALL_SUCCESS=true
# Try method 3: pip3 without flags (requires root/sudo)
elif pip3 install $PACKAGES 2>/dev/null; then
    echo "✓ Successfully installed packages using pip3"
    INSTALL_SUCCESS=true
else
    echo "⚠ WARNING: Automatic installation failed!"
    echo ""
    echo "Please manually install the required packages:"
    echo "  pip3 install --user $PACKAGES"
    echo ""
    echo "Or if that fails, try:"
    echo "  pip3 install --break-system-packages $PACKAGES"
    INSTALL_SUCCESS=false
fi

echo ""
echo "========================================="
if [ "$INSTALL_SUCCESS" = true ]; then
    echo "✓ PolyWhale installed successfully!"
else
    echo "⚠ PolyWhale installed with warnings"
    echo "  You may need to install Python packages manually"
fi
echo "========================================="

# Create symlink for easy command-line access
if [ ! -L "/usr/bin/polywhale" ]; then
    ln -sf /opt/PolyWhale/polywhale /usr/bin/polywhale
    echo "✓ Created command shortcut: polywhale"
fi

echo ""
echo "To launch: polywhale"
echo "Or find 'PolyWhale' in your Applications menu"
echo ""
