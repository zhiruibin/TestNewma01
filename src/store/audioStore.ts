import { create } from 'zustand';
import { Howl, Howler } from 'howler';

// 失败音频加载标记集合，防止重复发起 404 请求
const failedAudioLoads = new Set<string>();
interface AudioState {
  // 音量设置
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;

  // 静音状态
  isMuted: boolean;
  isMusicMuted: boolean;
  isSfxMuted: boolean;

  // 播放状态
  isPlaying: boolean;
  currentTrack: string | null;

  // 音频实例
  bgm: Howl | null;
  sfx: Record<string, Howl>;

  // 动作
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleMusicMute: () => void;
  toggleSfxMute: () => void;
  playBgm: (trackId: string) => void;
  playMusic: () => void;
  stopBgm: () => void;
  stopMusic: () => void;
  pauseBgm: () => void;
  resumeBgm: () => void;
  playSfx: (sfxId: string) => void;
  stopSfx: (sfxId: string) => void;
  loadAudio: () => void;
  unloadAudio: () => void;
}

// 音效定义
const SFX_DEFINITIONS: Record<string, { src: string[]; volume: number }> = {
  move: { src: ['/audio/sfx/move.mp3'], volume: 0.3 },
  rotate: { src: ['/audio/sfx/rotate.mp3'], volume: 0.3 },
  drop: { src: ['/audio/sfx/drop.mp3'], volume: 0.4 },
  clear: { src: ['/audio/sfx/clear.mp3'], volume: 0.5 },
  tSpin: { src: ['/audio/sfx/tspin.mp3'], volume: 0.6 },
  combo: { src: ['/audio/sfx/combo.mp3'], volume: 0.5 },
  gameOver: { src: ['/audio/sfx/gameover.mp3'], volume: 0.7 },
  pause: { src: ['/audio/sfx/pause.mp3'], volume: 0.3 },
  select: { src: ['/audio/sfx/select.mp3'], volume: 0.3 },
};

// 背景音乐定义
const BGM_DEFINITIONS: Record<string, { src: string[]; loop: boolean }> = {
  menu: { src: ['/audio/bgm/menu.mp3'], loop: true },
  game: { src: ['/audio/bgm/game.mp3'], loop: true },
  gameOver: { src: ['/audio/bgm/gameover.mp3'], loop: false },
};

export const useAudioStore = create<AudioState>((set, get) => ({
  // 初始状态
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.7,
  isMuted: false,
  isMusicMuted: false,
  isSfxMuted: false,
  isPlaying: false,
  currentTrack: null,
  bgm: null,
  sfx: {},

  setMasterVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ masterVolume: clampedVolume });
    Howler.volume(clampedVolume);
  },

  setMusicVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ musicVolume: clampedVolume });
    const { bgm, isMusicMuted, masterVolume } = get();
    if (bgm && !isMusicMuted) {
      bgm.volume(clampedVolume * masterVolume);
    }
  },

  setSfxVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ sfxVolume: clampedVolume });
  },

  toggleMute: () => {
    const { isMuted, masterVolume } = get();
    const newMuted = !isMuted;
    set({ isMuted: newMuted });
    Howler.mute(newMuted);
  },

  toggleMusicMute: () => {
    const { isMusicMuted, bgm, musicVolume, masterVolume } = get();
    const newMuted = !isMusicMuted;
    set({ isMusicMuted: newMuted });
    if (bgm) {
      bgm.mute(newMuted);
      if (!newMuted) {
        bgm.volume(musicVolume * masterVolume);
      }
    }
  },

  toggleSfxMute: () => {
    const { isSfxMuted } = get();
    set({ isSfxMuted: !isSfxMuted });
  },

playBgm: (trackId) => {
    const { bgm, currentTrack, isMusicMuted, musicVolume, masterVolume } = get();

    // 如果已经在播放同一曲目，不重复播放
    if (currentTrack === trackId && bgm?.playing()) {
      return;
    }

    // 检查是否已标记为加载失败
    if (failedAudioLoads.has(trackId)) {
      return;
    }

    // 停止当前 BGM
    if (bgm) {
      bgm.stop();
    }

    const track = BGM_DEFINITIONS[trackId];
    if (!track) {
      console.warn(`BGM track not found: ${trackId}`);
      return;
    }

    try {
      const newBgm = new Howl({
        src: track.src,
        loop: track.loop ?? true,
        volume: isMusicMuted ? 0 : musicVolume * masterVolume,
        html5: true,
        onloaderror: () => {
          // 标记为加载失败，防止重复请求
          failedAudioLoads.add(trackId);
          console.warn(`BGM file not found or failed to load: ${trackId}`);
        },
        onload: () => {
          set({ bgm: newBgm, currentTrack: trackId, isPlaying: true });
        },
      });

      newBgm.play();
    } catch (error) {
      console.warn(`Failed to load BGM ${trackId}:`, error);
    }
},

  playMusic: () => {
    const { playBgm } = get();
    playBgm('game');
  },

  stopBgm: () => {
    const { bgm } = get();
    if (bgm) {
      bgm.stop();
      set({ bgm: null, currentTrack: null, isPlaying: false });
    }
  },
  stopMusic: () => {
    const { stopBgm } = get();
    stopBgm();
  },

  pauseBgm: () => {
    const { bgm } = get();
    if (bgm) {
      bgm.pause();
      set({ isPlaying: false });
    }
  },

  resumeBgm: () => {
    const { bgm } = get();
    if (bgm) {
      bgm.play();
      set({ isPlaying: true });
    }
  },

playSfx: (sfxId) => {
    const { sfx, sfxVolume, masterVolume, isSfxMuted } = get();

    if (isSfxMuted) {
      return;
    }

    // 检查是否已标记为加载失败
    if (failedAudioLoads.has(sfxId)) {
      return;
    }

    const sfxDef = SFX_DEFINITIONS[sfxId];
    if (!sfxDef) {
      console.warn(`SFX not found: ${sfxId}`);
      return;
    }

    // 如果音效已加载，直接播放
    if (sfx[sfxId]) {
      sfx[sfxId].play();
      return;
    }

// 加载并播放新音效
    try {
      const newSfx = new Howl({
        src: sfxDef.src,
        volume: (sfxDef.volume ?? 0.5) * sfxVolume * masterVolume,
        html5: true,
        onloaderror: () => {
          // 标记为加载失败，防止重复请求
          failedAudioLoads.add(sfxId);
          console.warn(`Audio file not found or failed to load: ${sfxId}`);
        },
        onload: () => {
          set((state) => ({
            sfx: { ...state.sfx, [sfxId]: newSfx },
          }));
        },
      });

      newSfx.play();
    } catch (error) {
      // 捕获同步异常，标记为加载失败，防止阻断主流程
      failedAudioLoads.add(sfxId);
      console.warn(`Failed to load SFX ${sfxId}:`, error);
    }
  },

  stopSfx: (sfxId) => {
    const { sfx } = get();
    if (sfx[sfxId]) {
      sfx[sfxId].stop();
    }
  },

loadAudio: () => {
    const { sfx } = get();

    // 预加载所有音效
    Object.entries(SFX_DEFINITIONS).forEach(([id, def]) => {
      // 检查是否已标记为加载失败
      if (failedAudioLoads.has(id)) {
        return;
      }

if (!sfx[id]) {
        try {
          const newSfx = new Howl({
            src: def.src,
            volume: (def.volume ?? 0.5) * get().sfxVolume * get().masterVolume,
            html5: true,
            preload: true,
            onloaderror: () => {
              // 标记为加载失败，防止重复请求
              failedAudioLoads.add(id);
              console.warn(`Audio file not found or failed to load: ${id}`);
            },
          });
          set((state) => ({
            sfx: { ...state.sfx, [id]: newSfx },
          }));
        } catch (error) {
          // 捕获同步异常，标记为加载失败，防止阻断主流程
          failedAudioLoads.add(id);
          console.warn(`Failed to load audio ${id}:`, error);
        }
      }
    });

    // 设置全局音量
    Howler.volume(get().masterVolume);
  },

  unloadAudio: () => {
    const { bgm, sfx } = get();

    // 停止并卸载 BGM
    if (bgm) {
      bgm.unload();
    }

    // 停止并卸载所有音效
    Object.values(sfx).forEach((sound) => {
      sound.unload();
    });

    set({ bgm: null, sfx: {}, currentTrack: null, isPlaying: false });
  },
}));

export default useAudioStore;