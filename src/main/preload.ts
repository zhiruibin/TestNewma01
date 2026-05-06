// Electron 预加载脚本，在渲染进程和主进程之间建立安全通信桥梁
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Game state management
  sendGameState: (state: string) => ipcRenderer.send('game-state', state),
onGameEvent: (callback: (event: string, data: any) => void) => {
    ipcRenderer.on('game-event', (_, event, data) => callback(event, data));
  },
  removeGameEventListener: () => {
    // IPC 通信方法，允许渲染进程向主进程发送消息
    ipcRenderer.removeAllListeners('game-event');
  },

  // Audio control
  playSound: (soundName: string) => ipcRenderer.send('play-sound', soundName),
  setVolume: (volume: number) => ipcRenderer.send('set-volume', volume),

  // Window control
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // Settings
  saveSettings: (settings: any) => ipcRenderer.send('save-settings', settings),
  getSettings: () => ipcRenderer.invoke('get-settings'),

  // High scores
  saveScore: (score: number) => ipcRenderer.send('save-score', score),
  getHighScores: () => ipcRenderer.invoke('get-high-scores'),

  // IPC send (generic)
  send: (channel: string, data: any) => {
    const validChannels = ['game-state', 'play-sound', 'set-volume', 'minimize-window', 'maximize-window', 'close-window', 'save-settings', 'save-score'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  // IPC invoke (generic)
  invoke: (channel: string, data?: any) => {
    const validChannels = ['get-settings', 'get-high-scores'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },

  // IPC receive (generic)
  receive: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ['game-event'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  },

  // Remove listener
  removeListener: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ['game-event'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
    }
  }
});

// Type declarations for the exposed API
declare global {
  interface Window {
    electronAPI: {
      sendGameState: (state: string) => void;
      onGameEvent: (callback: (event: string, data: any) => void) => void;
      removeGameEventListener: () => void;
      playSound: (soundName: string) => void;
      setVolume: (volume: number) => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      saveSettings: (settings: any) => void;
      getSettings: () => Promise<any>;
      saveScore: (score: number) => void;
      getHighScores: () => Promise<any>;
      send: (channel: string, data: any) => void;
      invoke: (channel: string, data?: any) => Promise<any>;
      receive: (channel: string, func: (...args: any[]) => void) => void;
      removeListener: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}