"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Electron 预加载脚本，在渲染进程和主进程之间建立安全通信桥梁
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Game state management
    sendGameState: (state) => electron_1.ipcRenderer.send('game-state', state),
    onGameEvent: (callback) => {
        electron_1.ipcRenderer.on('game-event', (_, event, data) => callback(event, data));
    },
    removeGameEventListener: () => {
        // IPC 通信方法，允许渲染进程向主进程发送消息
        electron_1.ipcRenderer.removeAllListeners('game-event');
    },
    // Audio control
    playSound: (soundName) => electron_1.ipcRenderer.send('play-sound', soundName),
    setVolume: (volume) => electron_1.ipcRenderer.send('set-volume', volume),
    // Window control
    minimizeWindow: () => electron_1.ipcRenderer.send('minimize-window'),
    maximizeWindow: () => electron_1.ipcRenderer.send('maximize-window'),
    closeWindow: () => electron_1.ipcRenderer.send('close-window'),
    // Settings
    saveSettings: (settings) => electron_1.ipcRenderer.send('save-settings', settings),
    getSettings: () => electron_1.ipcRenderer.invoke('get-settings'),
    // High scores
    saveScore: (score) => electron_1.ipcRenderer.send('save-score', score),
    getHighScores: () => electron_1.ipcRenderer.invoke('get-high-scores'),
    // IPC send (generic)
    send: (channel, data) => {
        const validChannels = ['game-state', 'play-sound', 'set-volume', 'minimize-window', 'maximize-window', 'close-window', 'save-settings', 'save-score'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.send(channel, data);
        }
    },
    // IPC invoke (generic)
    invoke: (channel, data) => {
        const validChannels = ['get-settings', 'get-high-scores'];
        if (validChannels.includes(channel)) {
            return electron_1.ipcRenderer.invoke(channel, data);
        }
        return Promise.reject(new Error(`Invalid channel: ${channel}`));
    },
    // IPC receive (generic)
    receive: (channel, func) => {
        const validChannels = ['game-event'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.on(channel, (_, ...args) => func(...args));
        }
    },
    // Remove listener
    removeListener: (channel, func) => {
        const validChannels = ['game-event'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.removeListener(channel, func);
        }
    }
});
//# sourceMappingURL=preload.js.map