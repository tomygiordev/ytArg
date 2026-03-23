const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder:   () => ipcRenderer.invoke('select-folder'),
    closeWindow:    () => ipcRenderer.send('window-close'),
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    maximizeWindow: () => ipcRenderer.send('window-maximize'),
    isElectron: true,
});
