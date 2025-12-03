#!/usr/bin/env python3
"""Check if all required Python dependencies are installed."""

import sys
import importlib.util

# Required packages for PolyWhale backend
REQUIRED_PACKAGES = {
    'flask': 'Flask',
    'flask_cors': 'flask-cors',
    'requests': 'requests',
    'apscheduler': 'APScheduler',
}

# Optional packages (won't fail if missing, but will warn)
OPTIONAL_PACKAGES = {
    'notify2': 'notify2',
    'dbus': 'dbus-python',
}

def check_package(package_name):
    """Check if a package can be imported."""
    try:
        importlib.util.find_spec(package_name)
        return True
    except (ImportError, ModuleNotFoundError, AttributeError):
        return False

def main():
    """Check all dependencies and report missing ones."""
    missing_required = []
    missing_optional = []
    
    print("=" * 50)
    print("PolyWhale - Dependency Check")
    print("=" * 50)
    print()
    
    # Check Python version
    print(f"Python Version: {sys.version}")
    py_version = sys.version_info
    if py_version.major < 3 or (py_version.major == 3 and py_version.minor < 8):
        print("❌ ERROR: Python 3.8+ required!")
        return 1
    print("✓ Python version OK")
    print()
    
    # Check required packages
    print("Checking required packages:")
    for package, display_name in REQUIRED_PACKAGES.items():
        if check_package(package):
            print(f"  ✓ {display_name}")
        else:
            print(f"  ✗ {display_name} - MISSING")
            missing_required.append(display_name)
    
    print()
    
    # Check optional packages
    print("Checking optional packages:")
    for package, display_name in OPTIONAL_PACKAGES.items():
        if check_package(package):
            print(f"  ✓ {display_name}")
        else:
            print(f"  ⚠ {display_name} - Missing (notifications may not work)")
            missing_optional.append(display_name)
    
    print()
    print("=" * 50)
    
    # Report results
    if missing_required:
        print("❌ MISSING REQUIRED PACKAGES:")
        print()
        print("Please install missing packages:")
        print(f"  pip3 install --user {' '.join(missing_required)}")
        print()
        print("Or try:")
        print(f"  pip3 install --break-system-packages {' '.join(missing_required)}")
        print()
        return 1
    
    if missing_optional:
        print("⚠ Some optional packages are missing.")
        print("  The app will work, but desktop notifications may not function.")
        print()
    
    print("✅ All required dependencies are installed!")
    print("=" * 50)
    return 0

if __name__ == '__main__':
    sys.exit(main())
