import { Howl, Howler } from 'howler';

export type SoundType = 
  | 'move'
  | 'rotate'
  | 'drop'
  | 'clear'
  | 'tetris'
  | 'gameOver'
  | 'pause'
  | 'select'
  | 'hold'
  | 'levelUp';

export interface AudioConfig {
  volume: number;
  musicVolume: number;
  muted: boolean;
  musicMuted: boolean;
}

export class AudioManager {
  private static instance: AudioManager;
  
  private soundEffects: Map = new Map();
  private backgroundMusic: Howl | null = null;
  
  private config: AudioConfig = {
    volume: 0.5,
    musicVolume: 0.3,
    muted: false,
    musicMuted: false,
  };

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public async initialize(): Promise {
    this.loadSoundEffects();
    this.loadBackgroundMusic();
    this.applyVolumeSettings();
  }

private loadSoundEffects(): void {
    const soundPaths: Record<string, string> = {
      move: '/assets/audio/sfx/move.wav',
      rotate: '/assets/audio/sfx/rotate.wav',
      drop: '/assets/audio/sfx/drop.wav',
      clear: '/assets/audio/sfx/clear.wav',
      tetris: '/assets/audio/sfx/tetris.wav',
      gameOver: '/assets/audio/sfx/gameover.wav',
      pause: '/assets/audio/sfx/pause.wav',
      select: '/assets/audio/sfx/select.wav',
      hold: '/assets/audio/sfx/hold.wav',
      levelUp: '/assets/audio/sfx/levelup.wav',
    };

    (Object.keys(soundPaths) as SoundType[]).forEach((type) => {
      const sound = new Howl({
        src: [soundPaths[type]],
        volume: this.config.volume,
        preload: true,
        onloaderror: () => {
          // 文件不存在时静默失败，不报错
        },
      });
      this.soundEffects.set(type, sound);
    });
  }

  private loadBackgroundMusic(): void {
    this.backgroundMusic = new Howl({
      src: ['/assets/audio/music/bgm.mp3'],
      volume: this.config.musicVolume,
      loop: true,
      preload: true,
    });
  }

  public playSound(type: SoundType): void {
    if (this.config.muted) return;
    
    const sound = this.soundEffects.get(type);
    if (sound) {
      sound.stop();
      sound.play();
    }
  }

  public playMusic(): void {
    if (this.config.musicMuted) return;
    
    if (this.backgroundMusic && !this.backgroundMusic.playing()) {
      this.backgroundMusic.play();
    }
  }

  public stopMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }

  public pauseMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  public resumeMusic(): void {
    if (this.backgroundMusic && !this.config.musicMuted) {
      this.backgroundMusic.play();
    }
  }

  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.applyVolumeSettings();
  }

  public setMusicVolume(volume: number): void {
    this.config.musicVolume = Math.max(0, Math.min(1, volume));
    this.applyVolumeSettings();
  }

  public setMuted(muted: boolean): void {
    this.config.muted = muted;
    Howler.mute(muted);
  }

  public setMusicMuted(muted: boolean): void {
    this.config.musicMuted = muted;
    if (muted) {
      this.stopMusic();
    } else {
      this.resumeMusic();
    }
  }

  public getConfig(): AudioConfig {
    return { ...this.config };
  }

  public applyVolumeSettings(): void {
    this.soundEffects.forEach((sound) => {
      sound.volume(this.config.muted ? 0 : this.config.volume);
    });
    
    if (this.backgroundMusic) {
      this.backgroundMusic.volume(this.config.musicMuted ? 0 : this.config.musicVolume);
    }
  }

  public dispose(): void {
    this.soundEffects.forEach((sound) => {
      sound.unload();
    });
    this.soundEffects.clear();
    
    if (this.backgroundMusic) {
      this.backgroundMusic.unload();
      this.backgroundMusic = null;
    }
  }
}

export const audioManager = AudioManager.getInstance();