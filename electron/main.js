const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog } = require('electron');

// Disable sandbox to fix Linux SUID permission errors
// app.commandLine.appendSwitch('no-sandbox');
const path = require('path');
const { spawn } = require('child_process');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');

let mainWindow;
let tray;
let pythonProcess;

// Get icon path with fallback
function getIconPath() {
    const possiblePaths = [
        app.isPackaged ? path.join(process.resourcesPath, 'icon.png') : null,
        app.isPackaged ? path.join(process.resourcesPath, 'app.asar.unpacked', 'icon.png') : null,
        path.join(__dirname, '../build/icon.png'),
        '/usr/share/pixmaps/polywhale.png'
    ].filter(Boolean);

    for (const iconPath of possiblePaths) {
        if (fs.existsSync(iconPath)) {
            console.log('Using icon:', iconPath);
            return iconPath;
        }
    }

    console.warn('No icon file found, using default');
    // Return empty image to prevent crash, but log warning
    return nativeImage.createEmpty(); 
}

// Configure auto-updater
autoUpdater.autoDownload = false; // Don't auto-download, ask user first
autoUpdater.autoInstallOnAppQuit = true;

// Start Python backend server
function startPythonBackend() {
    const isDev = !app.isPackaged;
    let backendExecutable;
    let workingDir;

    if (isDev) {
        // In dev, use python script
        backendExecutable = 'python3';
        workingDir = path.join(__dirname, '..');
        const pythonScript = path.join(__dirname, '..', 'backend_server.py');

        console.log('Starting Backend (Dev Mode)...');
        pythonProcess = spawn('python3', [pythonScript], {
            cwd: workingDir,
            env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONPATH: workingDir }
        });
    } else {
        // In production, use bundled binary
        backendExecutable = path.join(process.resourcesPath, 'backend_server');
        workingDir = process.resourcesPath;

        console.log('Starting Backend (Production Mode)...');
        console.log('Binary:', backendExecutable);

        if (!fs.existsSync(backendExecutable)) {
            dialog.showErrorBox('Error', 'Backend binary not found!');
            return;
        }

        pythonProcess = spawn(backendExecutable, [], {
            cwd: workingDir,
            env: { ...process.env, PYTHONUNBUFFERED: '1' }
        });
    }

    pythonProcess.stdout.on('data', (data) => {
        console.log(`[Backend] ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`[Backend Error] ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Backend exited with code ${code}`);
    });
}

// Create main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 450,
        height: 700,
        minWidth: 400,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false  // Disable sandbox for Linux compatibility
        },
        backgroundColor: '#1a1a1a',
        titleBarStyle: 'default',
        icon: getIconPath(),
        show: true  // Show window immediately
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    // Hide instead of close
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

// Create system tray
// Create system tray
function createTray() {
    const icon = getIconPath();
    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Refresh Now',
            click: () => {
                mainWindow.webContents.send('trigger-refresh');
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('PolyWhale');
    tray.setContextMenu(contextMenu);

    // Show window on tray click
    tray.on('click', () => {
        mainWindow.show();
    });
}

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);

    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available!`,
        detail: 'Would you like to download and install it now?',
        buttons: ['Update & Restart', 'Later'],
        defaultId: 0,
        cancelId: 1
    }).then((result) => {
        if (result.response === 0) {
            autoUpdater.downloadUpdate();
        }
    });
});

autoUpdater.on('update-not-available', () => {
    console.log('No updates available');
});

autoUpdater.on('download-progress', (progressObj) => {
    let message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`;
    console.log(message);

    // Send progress to renderer
    if (mainWindow) {
        mainWindow.webContents.send('update-download-progress', progressObj.percent);
    }
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded successfully!',
        detail: 'The application will restart to install the update.',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1
    }).then((result) => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
});

// Function to check for updates
function checkForUpdates() {
    if (!app.isPackaged) {
        console.log('Running in development mode, skipping update check');
        return;
    }

    autoUpdater.checkForUpdates().catch(err => {
        console.error('Failed to check for updates:', err);
    });
}

// App ready
app.whenReady().then(() => {
    // Start Python backend
    startPythonBackend();

    // Wait a bit for backend to start
    setTimeout(() => {
        createWindow();
        createTray();

        // Check for updates on startup (after window is created)
        setTimeout(() => {
            checkForUpdates();
        }, 5000);

        // Check for updates every 4 hours
        setInterval(() => {
            checkForUpdates();
        }, 4 * 60 * 60 * 1000);
    }, 2000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Clean up on quit
app.on('before-quit', () => {
    app.isQuitting = true;

    // Kill Python backend
    if (pythonProcess) {
        pythonProcess.kill();
    }
});

// Handle IPC messages
ipcMain.handle('get-transactions', async () => {
    // Frontend will call API directly
    return { success: true };
});

ipcMain.handle('trigger-refresh', async () => {
    // Frontend will call API directly
    return { success: true };
});

ipcMain.handle('check-for-updates', async () => {
    checkForUpdates();
    return { success: true };
});
