import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectTrackingData, getActiveWindowInfo } from './tracker'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─ dist
// │ └── index.html
// ├── dist-electron
// │ ├── main.js
// │ └── preload.js
//
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC!, 'vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Try disabling sandbox
    },
  })


  if (VITE_DEV_SERVER_URL) {
    console.log('Load URL:', VITE_DEV_SERVER_URL);
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // Fallback for dev mode if env var is missing
    console.log('VITE_DEV_SERVER_URL is missing.');
    if (!app.isPackaged) {
      console.log('App is not packaged. Trying localhost:5173');
      win.loadURL('http://localhost:5173');
    } else {
      console.log('App is packaged. Loading file.');
      win.loadFile(path.join(process.env.DIST!, 'index.html'))
    }
  }
  // Open DevTools (attached to window)
  win.webContents.openDevTools({ mode: 'right' });

  // Global shortcut to toggle DevTools
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      win?.webContents.toggleDevTools();
      event.preventDefault();
    }
  });
}

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  // IPC: Get active window info
  ipcMain.handle('get-active-window', async () => {
    try {
      return await getActiveWindowInfo();
    } catch (error) {
      console.error('Failed to get active window:', error);
      return null;
    }
  })

  // IPC: Get full tracking data (idle time + active window)
  ipcMain.handle('get-tracking-data', async () => {
    try {
      return await collectTrackingData();
    } catch (error) {
      console.error('Failed to get tracking data:', error);
      return null;
    }
  })

  // IPC: Log from Renderer to Terminal
  ipcMain.on('renderer-log', (_event, message) => {
    console.log('RENDERER:', message);
  });
})
