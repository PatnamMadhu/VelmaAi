const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getPlatform: () => ipcRenderer.invoke('platform'),
  
  // Desktop-specific features
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
});

// Make app aware it's running in desktop mode
contextBridge.exposeInMainWorld('isDesktop', true);