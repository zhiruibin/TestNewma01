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
export {};
//# sourceMappingURL=preload.d.ts.map