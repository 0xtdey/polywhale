const { contextBridge, ipcRenderer, shell } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    getTransactions: () => ipcRenderer.invoke('get-transactions'),
    triggerRefresh: () => ipcRenderer.invoke('trigger-refresh'),
    onRefresh: (callback) => ipcRenderer.on('trigger-refresh', callback),
    openExternal: (url) => shell.openExternal(url)
});
