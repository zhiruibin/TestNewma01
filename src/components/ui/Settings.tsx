import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAudioStore } from '../../store/audioStore';
import './Settings.css';

interface SettingsProps {
  onClose: () => void;
}

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '简单', desc: '下落速度较慢，适合新手' },
  { value: 'normal', label: '普通', desc: '标准速度，经典体验' },
  { value: 'hard', label: '困难', desc: '下落速度更快，挑战极限' },
] as const;

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const das = useGameStore((s) => s.das);
  const setDAS = useGameStore((s) => s.setDAS);
  const arr = useGameStore((s) => s.arr);
  const setARR = useGameStore((s) => s.setARR);
  const ghostEnabled = useGameStore((s) => s.ghostEnabled);
  const setGhostEnabled = useGameStore((s) => s.setGhostEnabled);
  const gridEnabled = useGameStore((s) => s.gridEnabled);
  const setGridEnabled = useGameStore((s) => s.setGridEnabled);
  const volume = useAudioStore((s) => s.volume);
  const setVolume = useAudioStore((s) => s.setVolume);
  const resetHighScores = useGameStore((s) => s.resetHighScores);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetHighScores = () => {
    resetHighScores();
    setShowResetConfirm(false);
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>设置</h2>
          <button className="settings-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">
          {/* 难度选择 */}
          <section className="settings-section">
            <h3 className="settings-section-title">难度</h3>
            <div className="difficulty-options">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`difficulty-btn ${difficulty === opt.value ? 'active' : ''}`}
                  onClick={() => setDifficulty(opt.value)}
                >
                  <span className="difficulty-label">{opt.label}</span>
                  <span className="difficulty-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* DAS / ARR 调节 */}
          <section className="settings-section">
            <h3 className="settings-section-title">按键灵敏度</h3>
            <div className="slider-group">
              <div className="slider-row">
                <label className="slider-label">DAS (延迟自动移位)</label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={das}
                  onChange={(e) => setDAS(Number(e.target.value))}
                  className="settings-slider"
                />
                <span className="slider-value">{das}ms</span>
              </div>
              <div className="slider-row">
                <label className="slider-label">ARR (自动重复速率)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={arr}
                  onChange={(e) => setARR(Number(e.target.value))}
                  className="settings-slider"
                />
                <span className="slider-value">{arr}ms</span>
              </div>
            </div>
          </section>

          {/* 显示选项 */}
          <section className="settings-section">
            <h3 className="settings-section-title">显示</h3>
            <div className="toggle-group">
              <div className="toggle-row">
                <span className="toggle-label">幽灵方块 (Ghost)</span>
                <button
                  className={`toggle-btn ${ghostEnabled ? 'on' : 'off'}`}
                  onClick={() => setGhostEnabled(!ghostEnabled)}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
              <div className="toggle-row">
                <span className="toggle-label">网格线 (Grid)</span>
                <button
                  className={`toggle-btn ${gridEnabled ? 'on' : 'off'}`}
                  onClick={() => setGridEnabled(!gridEnabled)}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
          </section>

          {/* 音量控制 */}
          <section className="settings-section">
            <h3 className="settings-section-title">音量</h3>
            <div className="slider-row">
              <label className="slider-label">主音量</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="settings-slider"
              />
              <span className="slider-value">{Math.round(volume * 100)}%</span>
            </div>
          </section>

          {/* 重置高分 */}
          <section className="settings-section">
            <h3 className="settings-section-title">数据</h3>
            <div className="settings-footer">
              {showResetConfirm ? (
                <div className="reset-confirm">
                  <p>确定要重置所有高分记录吗？此操作不可撤销。</p>
                  <div className="reset-confirm-btns">
                    <button className="btn-danger" onClick={handleResetHighScores}>确认重置</button>
                    <button className="btn-secondary" onClick={() => setShowResetConfirm(false)}>取消</button>
                  </div>
                </div>
              ) : (
                <button className="btn-warning" onClick={() => setShowResetConfirm(true)}>
                  重置高分记录
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;