import { create } from 'zustand';

interface UIState {
  // Menu states
  showMainMenu: boolean;
  showPauseMenu: boolean;
  showGameOver: boolean;
  showSettings: boolean;
  showHelp: boolean;
  showScoreHistory: boolean;

  // Display settings
  theme: 'light' | 'dark' | 'auto';
  showGhostPiece: boolean;
  showGridLines: boolean;
  showNextBlock: boolean;
  showHoldBlock: boolean;

  // UI preferences
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;

  // Screen state
  isFullscreen: boolean;
  windowWidth: number;
  windowHeight: number;

  // Actions
  setShowMainMenu: (show: boolean) => void;
  setShowPauseMenu: (show: boolean) => void;
  setShowGameOver: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowHelp: (show: boolean) => void;
  setShowScoreHistory: (show: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setShowGhostPiece: (show: boolean) => void;
  setShowGridLines: (show: boolean) => void;
  setShowNextBlock: (show: boolean) => void;
  setShowHoldBlock: (show: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setWindowSize: (width: number, height: number) => void;
  resetUI: () => void;
}

const initialState = {
  showMainMenu: true,
  showPauseMenu: false,
  showGameOver: false,
  showSettings: false,
  showHelp: false,
  showScoreHistory: false,
  theme: 'dark' as const,
  showGhostPiece: true,
  showGridLines: true,
  showNextBlock: true,
  showHoldBlock: true,
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7,
  isFullscreen: false,
  windowWidth: 0,
  windowHeight: 0,
};

export const useUIStore = create((set) => ({
  ...initialState,

  setShowMainMenu: (show) => set({ showMainMenu: show }),
  setShowPauseMenu: (show) => set({ showPauseMenu: show }),
  setShowGameOver: (show) => set({ showGameOver: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowHelp: (show) => set({ showHelp: show }),
  setShowScoreHistory: (show) => set({ showScoreHistory: show }),
  setTheme: (theme) => set({ theme }),
  setShowGhostPiece: (show) => set({ showGhostPiece: show }),
  setShowGridLines: (show) => set({ showGridLines: show }),
  setShowNextBlock: (show) => set({ showNextBlock: show }),
  setShowHoldBlock: (show) => set({ showHoldBlock: show }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
  setWindowSize: (width, height) => set({ windowWidth: width, windowHeight: height }),

  resetUI: () => set(initialState),
}));

export default useUIStore;