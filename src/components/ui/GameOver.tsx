import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

interface GameOverProps {
  onRestart: () => void;
  onMainMenu: () => void;
  onOpenScoreHistory: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ onRestart, onMainMenu, onOpenScoreHistory }) => {
  const { score, level, lines, highScore, gameStats } = useGameStore();
  const { theme } = useUIStore();

  const isNewHighScore = score > highScore;

  // 计算游戏时长
  const gameDuration = React.useMemo(() => {
    if (!gameStats.startTime) return '0:00';
    const endTime = Date.now();
    const totalSeconds = Math.floor((endTime - gameStats.startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [gameStats.startTime]);

  // 计算游戏分钟数（用于APM）
  const gameMinutes = React.useMemo(() => {
    if (!gameStats.startTime) return 1;
    const endTime = Date.now();
    const minutes = (endTime - gameStats.startTime) / 60000;
    return Math.max(minutes, 0.01); // 避免除以0
  }, [gameStats.startTime]);

  // 计算APM (Actions Per Minute)
  const apm = React.useMemo(() => {
    return Math.round(gameStats.totalActions / gameMinutes);
  }, [gameStats.totalActions, gameMinutes]);

  return (
    <div className={`menu-overlay game-over ${theme}`}>
      <div className="menu-content">
        <h1 className="menu-title">GAME OVER</h1>
        {isNewHighScore && (
          <div className="high-score-badge">
            🏆 New High Score!
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Final Score</span>
            <span className="stat-value">{score.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">High Score</span>
            <span className="stat-value">{highScore.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Level Reached</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Lines Cleared</span>
            <span className="stat-value">{lines}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">T-Spin</span>
            <span className="stat-value">{gameStats.tSpinCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tetris</span>
            <span className="stat-value">{gameStats.tetrisCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Max Combo</span>
            <span className="stat-value">{gameStats.maxCombo}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">APM</span>
            <span className="stat-value">{apm}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Game Time</span>
            <span className="stat-value">{gameDuration}</span>
          </div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={onRestart}>
            🔄 Play Again
          </button>
          <button className="btn btn-secondary" onClick={onMainMenu}>
            📋 Main Menu
          </button>
          <button className="btn btn-secondary" onClick={onOpenScoreHistory}>
            🏅 积分记录
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;