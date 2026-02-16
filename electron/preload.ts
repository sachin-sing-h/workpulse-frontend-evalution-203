import { ipcRenderer, contextBridge } from 'electron'

// Expose safe Electron APIs to the renderer (React app)
contextBridge.exposeInMainWorld('electron', {
  getActiveWindow: () => ipcRenderer.invoke('get-active-window'),
  getTrackingData: () => ipcRenderer.invoke('get-tracking-data'),
})
