#!/bin/bash
# Post-installation script for PolyWhale
# Handles system integration (symlinks, permissions)

echo "========================================="
echo "PolyWhale - Post-Installation Setup"
echo "========================================="

# Determine if running as root
if [ "$EUID" -eq 0 ]; then
    IS_ROOT=true
else
    IS_ROOT=false
fi

# Fix chrome-sandbox permissions if it exists (fixes FATAL:setuid_sandbox_host.cc error)
if [ "$IS_ROOT" = true ] && [ -f "/opt/PolyWhale/chrome-sandbox" ]; then
    echo "Fixing chrome-sandbox permissions..."
    chown root:root /opt/PolyWhale/chrome-sandbox
    chmod 4755 /opt/PolyWhale/chrome-sandbox
    echo "✓ Fixed chrome-sandbox permissions"
fi

# Create symbolic link if running as root (system installation)
if [ "$IS_ROOT" = true ] && [ -f "/opt/PolyWhale/polywhale" ]; then
    if [ ! -L "/usr/local/bin/polywhale" ]; then
        ln -sf /opt/PolyWhale/polywhale /usr/local/bin/polywhale
        echo "✓ Created command shortcut: polywhale"
    fi
fi

# Create user data directory
USER_DATA_DIR="$HOME/.local/share/polywhale"
mkdir -p "$USER_DATA_DIR"
echo "✓ Data directory ready: $USER_DATA_DIR"

echo ""
echo "✅ PolyWhale installed successfully!"
echo "To launch: Run 'polywhale' or find it in your menu."
echo "========================================="
exit 0
