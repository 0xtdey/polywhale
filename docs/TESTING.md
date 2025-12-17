# Testing the Fixed PolyWhale Application

## Quick Testing Guide

### Option 1: Test with Shell Script (Development Mode)

This tests the improved shell script without installing the package:

```bash
cd /home/tamoghna/polyLocal
./start-app.sh
```

**What to verify:**
- ✅ Script detects Python correctly
- ✅ Checks dependencies automatically  
- ✅ Shows clear messages about what it's doing
- ✅ App launches without errors

---

### Option 2: Test .deb Package Installation

**⚠️ Important:** Remove old version first to avoid conflicts

```bash
# 1. Uninstall old version (if installed)
sudo dpkg -r polywhale

# 2. Install new version
cd /home/tamoghna/polyLocal
sudo dpkg -i dist/polywhale_2.0.0_amd64.deb

# 3. Fix dependencies (if apt complains)
sudo apt-get install -f

# 4. Verify installation
/opt/PolyWhale/resources/check-dependencies.py

# 5. Launch app
polywhale
# Or find "PolyWhale" in Applications menu
```

**What to check:**
- ✅ Postinstall script runs and installs Python dependencies
- ✅ Application is installed in `/opt/PolyWhale/`
- ✅ Command `polywhale` works
- ✅ App appears in Applications menu
- ✅ App launches and shows transactions
- ✅ Backend starts without errors

**Check logs:**
```bash
# Electron logs (if running from terminal)
polywhale

# Check postinstall output
cat /tmp/polywhale-install.log
```

---

### Option 3: Test AppImage

AppImage is a portable, self-contained package.

```bash
cd /home/tamoghna/polyLocal/dist
chmod +x PolyWhale-2.0.0.AppImage
./PolyWhale-2.0.0.AppImage
```

**What to verify:**
- ✅ Runs without installation
- ✅ Detects Python dependencies
- ✅ Shows error messages if dependencies missing
- ✅ Works same as installed version

---

## Verification Commands

### Check Python Dependencies
```bash
python3 check-dependencies.py
```

Expected output:
```
==================================================
PolyWhale - Dependency Check
==================================================

✓ Python version OK

Checking required packages:
  ✓ Flask
  ✓ flask-cors
  ✓ requests
  ✓ APScheduler

✅ All required dependencies are installed!
```

### Check Package Contents
```bash
dpkg -L polywhale | grep -E '\.py$'
```

Should show all Python files including `check-dependencies.py`

### Test Backend Server Directly
```bash
cd /home/tamoghna/polyLocal
python3 backend_server.py
```

Should output:
```
Starting PolyWhale Backend...
API Server: http://localhost:5000
* Running on http://127.0.0.1:5000
```

Then test in browser: http://localhost:5000/api/status

---

## Expected Behavior (Bundled Version)

### ✅ Installation
- No `pip install` steps needed.
- Postinstall script runs but is mostly for cleanup/symlinks.
- App is fully self-contained.

### ✅ Launch
- Backend starts immediately (bundled binary).
- No "Flask not found" errors possible.
- No "async hook corrupted" errors (Electron v31).

### ✅ Verification
Check that the backend binary is running:
```bash
ps aux | grep backend_server
```

You should see `/opt/PolyWhale/resources/backend_server` running.

**Note:** You do NOT need to install any Python packages manually. The app is completely self-contained.

---

## Troubleshooting

### Issue: "Python 3 not installed"
```bash
sudo apt install python3 python3-pip
```

### Issue: "Dependencies missing"
```bash
python3 -m pip install --user flask flask-cors requests apscheduler
```

### Issue: "Module not found" after installation
Check that pip installed to the right location:
```bash
python3 -m pip list | grep -i flask
```

If not found, try:
```bash
python3 -m pip install --user --force-reinstall flask flask-cors requests apscheduler
```

### Issue: Backend doesn't start
Check Python can import modules:
```bash
python3 -c "from flask import Flask; from flask_cors import CORS; print('OK')"
```

---

## Clean System Test (Recommended)

For final verification, test on a **clean Ubuntu VM or container**:

```bash
# 1. Fresh Ubuntu 22.04 or 24.04
# 2. Install only base dependencies
sudo apt update
sudo apt install python3 python3-pip

# 3. Copy and install the .deb
scp user@dev-machine:/path/to/polywhale_2.0.0_amd64.deb .
sudo dpkg -i polywhale_2.0.0_amd64.deb

# 4. Launch
polywhale
```

This proves the app works without your development environment!

---

## Success Criteria

The app is working correctly if:

- [x] Launches without crashes
- [x] Backend starts and listens on port 5000
- [x] Frontend connects to backend
- [x] Transactions are displayed
- [x] System tray icon appears
- [x] No hardcoded path errors
- [x] Works on a clean system (not just dev machine)

---

## Next Steps After Testing

Once verified:

1. **Tag the release:**
   ```bash
   git add .
   git commit -m "fix: Remove hardcoded venv path, improve dependency handling"
   git tag v2.0.1
   git push origin main --tags
   ```

2. **Upload to GitHub Releases:**
   - Go to repository → Releases → Create new release
   - Tag: `v2.0.1`
   - Title: "v2.0.1 - Production-Ready Packaging Fixes"
   - Upload `dist/polywhale_2.0.0_amd64.deb` and `dist/PolyWhale-2.0.0.AppImage`

3. **Update documentation:**
   - Update INSTALL.md with new installation instructions
   - Document troubleshooting steps
