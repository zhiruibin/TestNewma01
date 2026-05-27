import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a2e',
    show: false,
    frame: true,
    titleBarStyle: 'default'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for game functionality
ipcMain.handle('get-game-settings', () => {
  return {
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'normal'
  };
});

ipcMain.handle('save-game-settings', (_, settings) => {
  // Save settings to file or store
  return true;
});

ipcMain.handle('get-high-scores', () => {
  // Return high scores from storage
  return [];
});

ipcMain.handle('save-high-score', (_, score) => {
  // Save high score to storage
  return true;
});

// Handle app quit
app.on('before-quit', () => {
  mainWindow = null;
});