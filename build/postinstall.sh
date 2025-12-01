#!/bin/bash
# Post-installation script for PolyWhale

echo "Installing Python dependencies..."

# Install Python packages with fallback for different environments
pip3 install --user requests flask flask-cors apscheduler notify2 dbus-python 2>/dev/null || \
pip3 install --break-system-packages requests flask flask-cors apscheduler notify2 dbus-python 2>/dev/null || \
pip3 install requests flask flask-cors apscheduler notify2 dbus-python 2>/dev/null || \
echo "Note: Python packages may need to be installed manually"

echo "PolyWhale installed successfully!"
echo "Launch from Applications menu or run: polywhale"
