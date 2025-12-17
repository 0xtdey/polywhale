# Build script to bundle Python backend
import PyInstaller.__main__
import os
import shutil

print("Building Python backend...")

# Clean previous builds
if os.path.exists("dist/backend_server"):
    shutil.rmtree("dist/backend_server")
if os.path.exists("build/backend_server"):
    shutil.rmtree("build/backend_server")

PyInstaller.__main__.run([
    'backend_server.py',
    '--name=backend_server',
    '--onefile',
    '--clean',
    '--add-data=config.py:.',
    '--add-data=database.py:.',
    '--add-data=polymarket_api.py:.',
    '--add-data=notifier_service.py:.',
    '--hidden-import=flask',
    '--hidden-import=flask_cors',
    '--hidden-import=requests',
    '--hidden-import=apscheduler',
    '--hidden-import=notify2',
    '--hidden-import=dbus',
    '--log-level=WARN'
])

print("Build complete. Binary is in dist/backend_server")
