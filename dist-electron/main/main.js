"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
        const devPorts = [5173, 5174];
        const tryLoadURL = async (index) => {
            if (index >= devPorts.length) {
                console.error('Failed to load dev server on all ports');
                return;
            }
            const port = devPorts[index];
            try {
                await mainWindow.loadURL(`http://localhost:${port}`);
            }
            catch {
                await tryLoadURL(index + 1);
            }
        };
        tryLoadURL(0);
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../index.html'));
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
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// IPC handlers for game functionality
electron_1.ipcMain.handle('get-game-settings', () => {
    return {
        soundEnabled: true,
        musicEnabled: true,
        difficulty: 'normal'
    };
});
electron_1.ipcMain.handle('save-game-settings', (_, __) => {
    // Save settings to file or store
    return true;
});
electron_1.ipcMain.handle('get-high-scores', () => {
    // Return high scores from storage
    return [];
});
electron_1.ipcMain.handle('save-high-score', (_, __) => {
    // Save high score to storage
    return true;
});
// Handle app quit
electron_1.app.on('before-quit', () => {
    mainWindow = null;
});
//# sourceMappingURL=main.js.map