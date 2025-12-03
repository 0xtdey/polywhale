# Distribution Guide - PolyWhale

This guide explains how to build, distribute, and enable auto-updates for the PolyWhale desktop application.

## Table of Contents
- [Building for Distribution](#building-for-distribution)
- [Publishing Releases](#publishing-releases)
- [Auto-Update Setup](#auto-update-setup)
- [User Installation](#user-installation)

---

## Building for Distribution

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   pip3 install -r requirements.txt
   ```

2. **Ensure you have the required tools:**
   - Node.js 16+
   - Python 3.8+
   - electron-builder (installed via npm)

### Build Commands

#### Build for Linux (Debian/Ubuntu)
```bash
npm run build
```

This creates:
- `dist/polywhale_2.0.0_amd64.deb` - Debian package
- `dist/polywhale-2.0.0.AppImage` - Universal Linux binary

#### Build for Multiple Platforms

Add to `package.json` scripts:
```json
"build:linux": "electron-builder --linux",
"build:win": "electron-builder --win",
"build:mac": "electron-builder --mac",
"build:all": "electron-builder -mwl"
```

---

## Publishing Releases

### Using GitHub Releases (Recommended)

#### 1. Setup GitHub Repository

1. Create a GitHub repository for your project
2. Push your code to GitHub
3. Create a Personal Access Token with `repo` scope

#### 2. Configure package.json

Update your `package.json` with repository information:

```json
{
  "name": "polywhale",
  "version": "2.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/polywhale.git"
  },
  "build": {
    "publish": {
      "provider": "github",
      "owner": "YOUR_USERNAME",
      "repo": "polywhale"
    }
  }
}
```

#### 3. Build and Publish

```bash
# Set your GitHub token
export GH_TOKEN="your_github_personal_access_token"

# Build and publish
npm run build -- --publish always
```

This will:
- Build the application
- Create a GitHub release
- Upload installers to the release
- Generate update metadata files

#### 4. Create Release Manually (Alternative)

1. Build locally: `npm run build`
2. Go to GitHub → Releases → Create new release
3. Tag version (e.g., `v2.0.0`)
4. Upload files from `dist/`:
   - `polywhale_2.0.0_amd64.deb`
   - `polywhale-2.0.0.AppImage`
   - `latest-linux.yml` (for auto-updates)

---

## Auto-Update Setup

### 1. Install electron-updater

```bash
npm install electron-updater --save
```

### 2. Update Main Process

The auto-update code has been added to `electron/main.js`. It will:
- Check for updates on app startup
- Check every 4 hours
- Notify users when updates are available
- Download and install updates automatically

### 3. How It Works

**For Users:**
1. App checks for updates on launch
2. If update available, notification appears
3. User clicks "Update & Restart"
4. App downloads update in background
5. App restarts with new version

**Update Flow:**
```
App Launch → Check GitHub Releases → Compare Versions
     ↓
Update Available? → Show Notification → Download
     ↓
Download Complete → Install & Restart
```

### 4. Testing Auto-Updates

1. Build and publish version 2.0.0
2. Install the app locally
3. Update version to 2.0.1 in `package.json`
4. Build and publish version 2.0.1
5. Launch the 2.0.0 app
6. Should see update notification

---

## User Installation

### For End Users - Linux (Debian/Ubuntu)

#### Method 1: .deb Package (Recommended)

1. **Download** the latest `.deb` file from [Releases](https://github.com/YOUR_USERNAME/polywhale/releases)

2. **Install:**
   ```bash
   sudo dpkg -i polywhale_2.0.0_amd64.deb
   ```

3. **Fix dependencies if needed:**
   ```bash
   sudo apt-get install -f
   ```

4. **Launch:**
   - Find "PolyWhale" in Applications menu
   - Or run: `polywhale`

#### Method 2: AppImage (Universal)

1. **Download** the `.AppImage` file
2. **Make executable:**
   ```bash
   chmod +x polywhale-2.0.0.AppImage
   ```
3. **Run:**
   ```bash
   ./polywhale-2.0.0.AppImage
   ```

### System Requirements

- **OS:** Ubuntu 20.04+ / Debian 11+
- **Python:** 3.8+
- **RAM:** 512MB minimum
- **Disk:** 200MB free space
- **Internet:** Required for monitoring

---

## Release Checklist

Before publishing a new release:

- [ ] Update version in `package.json`
- [ ] Update version in `INSTALL.md`
- [ ] Test build locally: `npm run build`
- [ ] Test installation from .deb package
- [ ] Verify all features work
- [ ] Update CHANGELOG.md
- [ ] Commit and push changes
- [ ] Build and publish: `npm run build -- --publish always`
- [ ] Verify release on GitHub
- [ ] Test auto-update from previous version

---

## Troubleshooting

### Build Issues

**Error: "Cannot find module electron-builder"**
```bash
npm install electron-builder --save-dev
```

**Error: "Python dependencies not found"**
- Ensure `build/postinstall.sh` is executable
- Check Python packages are listed in `requirements.txt`

### Auto-Update Issues

**Updates not detected:**
- Verify `latest-linux.yml` is uploaded to GitHub release
- Check repository URL in `package.json` matches GitHub
- Ensure version number follows semver (e.g., 2.0.0, not 2.0)

**Update download fails:**
- Check internet connection
- Verify GitHub release is public
- Check console logs: `Ctrl+Shift+I` in app

---

## Advanced Configuration

### Custom Update Server

Instead of GitHub, you can host updates on your own server:

```json
{
  "build": {
    "publish": {
      "provider": "generic",
      "url": "https://your-server.com/updates"
    }
  }
}
```

### Update Channels

Support beta/stable channels:

```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "channel": "latest"
      },
      {
        "provider": "github",
        "channel": "beta"
      }
    ]
  }
}
```

---

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review electron-builder documentation

---

## License

MIT - See LICENSE file for details
