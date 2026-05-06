import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

interface GameOverProps {
  onRestart: () => void;
  onMainMenu: () => void;
  onOpenScoreHistory: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ onRestart, onMainMenu, onOpenScoreHistory }) => {
  const { score, level, linesCleared, highScore } = useGameStore();
  const { theme } = useUIStore();

  const isNewHighScore = score > highScore;

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
            <span className="stat-value">{linesCleared}</span>
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