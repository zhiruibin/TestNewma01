import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAudioStore } from '../../store/audioStore';
import './Settings.css';

interface SettingsProps {
  onClose: () => void;
}

interface KeyBinding {
  action: string;
  key: string;
  code: string;
}

const defaultKeyBindings: KeyBinding[] = [
  { action: '左移', key: '←', code: 'ArrowLeft' },
  { action: '右移', key: '→', code: 'ArrowRight' },
  { action: '软降', key: '↓', code: 'ArrowDown' },
  { action: '硬降', key: 'Space', code: 'Space' },
  { action: '顺时针旋转', key: '↑', code: 'ArrowUp' },
  { action: '逆时针旋转', key: 'Z', code: 'KeyZ' },
  { action: '暂存', key: 'C', code: 'KeyC' },
  { action: '暂停', key: 'P', code: 'KeyP' },
];

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const {
    difficulty,
    setDifficulty,
    showGhost,
    setShowGhost,
    showGrid,
    setShowGrid,
    resetHighScore,
  } = useGameStore();

  const {
    masterVolume,
    setMasterVolume,
    sfxVolume,
    setSfxVolume,
    musicVolume,
    setMusicVolume,
    isMuted,
    toggleMute,
  } = useAudioStore();

  const [keyBindings, setKeyBindings] = useState(defaultKeyBindings);
  const [activeTab, setActiveTab] = useState('game');
  const [isRecording, setIsRecording] = useState<string | null>(null);

  const handleDifficultyChange = (level: 'easy' | 'normal' | 'hard') => {
    setDifficulty(level);
  };

  const handleResetHighScore = () => {
    if (window.confirm('确定要重置最高分吗？此操作不可撤销。')) {
      resetHighScore();
    }
  };

  const handleKeyRecord = (index: number) => {
    setIsRecording(defaultKeyBindings[index].action);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const newBindings = [...keyBindings];
      newBindings[index] = {
        action: newBindings[index].action,
        key: e.key === ' ' ? 'Space' : e.key.toUpperCase(),
        code: e.code,
      };
      setKeyBindings(newBindings);
      setIsRecording(null);
      window.removeEventListener('keydown', handleKeyDown);
    };

    window.addEventListener('keydown', handleKeyDown, { once: true });
  };

  const handleResetKeyBindings = () => {
    setKeyBindings(defaultKeyBindings);
  };

return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>设置</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'game' ? 'active' : ''}`}
            onClick={() => setActiveTab('game')}
          >
            游戏
          </button>
          <button
            className={`tab ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            音频
          </button>
          <button
            className={`tab ${activeTab === 'controls' ? 'active' : ''}`}
            onClick={() => setActiveTab('controls')}
          >
            控制
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'game' && (
            <div className="settings-section">
              <div className="setting-item">
                <label>难度等级</label>
                <div className="button-group">
                  <button
                    className={difficulty === 'easy' ? 'active' : ''}
                    onClick={() => handleDifficultyChange('easy')}
                  >
                    简单
                  </button>
                  <button
                    className={difficulty === 'normal' ? 'active' : ''}
                    onClick={() => handleDifficultyChange('normal')}
                  >
                    普通
                  </button>
                  <button
                    className={difficulty === 'hard' ? 'active' : ''}
                    onClick={() => handleDifficultyChange('hard')}
                  >
                    困难
                  </button>
                </div>
              </div>

              <div className="setting-item">
                <label>显示幽灵方块</label>
                <button
                  className="toggle-btn"
                  onClick={() => setShowGhost(!showGhost)}
                >
                  {showGhost ? '开启' : '关闭'}
                </button>
              </div>

              <div className="setting-item">
                <label>显示网格线</label>
                <button
                  className="toggle-btn"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  {showGrid ? '开启' : '关闭'}
                </button>
              </div>

              <div className="setting-item">
                <label>最高分</label>
                <button
                  className="reset-btn"
                  onClick={handleResetHighScore}
                >
                  重置最高分
                </button>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="settings-section">
              <div className="setting-item">
                <label>主音量</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(Number(e.target.value))}
                    className="volume-slider"
                  />
                  {masterVolume}%
                </div>
              </div>

              <div className="setting-item">
                <label>音效音量</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(Number(e.target.value))}
                    className="volume-slider"
                  />
                  {sfxVolume}%
                </div>
              </div>

              <div className="setting-item">
                <label>音乐音量</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(Number(e.target.value))}
                    className="volume-slider"
                  />
                  {musicVolume}%
                </div>
              </div>

              <div className="setting-item">
                <label>静音</label>
                <button
                  className="toggle-btn"
                  onClick={toggleMute}
                >
                  {isMuted ? '已静音' : '未静音'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="settings-section">
              <div className="key-bindings">
                {keyBindings.map((binding, index) => (
                  <div key={binding.action} className="key-binding-item">
                    <span>{binding.action}</span>
                    <button
                      className="key-btn"
                      onClick={() => handleKeyRecord(index)}
                    >
                      {isRecording === binding.action ? '按键...' : binding.key}
                    </button>
                  </div>
                ))}
              </div>
              <div className="setting-item">
                <button
                  className="reset-btn"
                  onClick={handleResetKeyBindings}
                >
                  重置按键绑定
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="done-btn" onClick={onClose}>
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;