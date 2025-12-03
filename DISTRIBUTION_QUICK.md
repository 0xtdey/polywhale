# PolyWhale - Distribution and Auto-Update

## Overview
- **Current Version:** 2.0.0
- **Distribution Method:** GitHub Releases
- **Auto-Update:** Enabled via electron-updater
- **Supported Platforms:** Linux (Debian/Ubuntu)

## Quick Start for Distribution

### 1. Build the Application
```bash
npm run build
```

### 2. Publish to GitHub Releases
```bash
export GH_TOKEN="your_github_token"
npm run build -- --publish always
```

### 3. Users Download and Install
Users download the `.deb` file from GitHub Releases and install:
```bash
sudo dpkg -i polywhale_2.0.0_amd64.deb
```

## Auto-Update Features

✅ **Automatic Update Checking**
- Checks on app launch
- Checks every 4 hours while running
- Compares with latest GitHub release

✅ **User-Friendly Notifications**
- Shows update available dialog
- One-click update and restart
- Progress feedback during download

✅ **Seamless Installation**
- Downloads in background
- Installs automatically
- Restarts app with new version

## Next Steps

1. **Set up GitHub repository** with your code
2. **Update `package.json`** with your GitHub username
3. **Create a GitHub Personal Access Token**
4. **Build and publish** your first release
5. **Test auto-update** by publishing a new version

See [DISTRIBUTION.md](DISTRIBUTION.md) for detailed instructions.
