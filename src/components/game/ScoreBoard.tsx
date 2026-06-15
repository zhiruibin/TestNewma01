import React from 'react';
import { useGameStore } from '../../store/gameStore';
import './ScoreBoard.css';

interface ScoreBoardProps {
  className?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ className = '' }) => {
  const score = useGameStore((state) => state.score);
  const level = useGameStore((state) => state.level);
  const lines = useGameStore((state) => state.lines);
  const combo = useGameStore((state) => state.combo);
  const b2b = useGameStore((state) => state.b2b);
  const clearLabel = useGameStore((state) => state.clearLabel);

  const comboDisplay = combo >= 0 ? `${combo + 1}x` : '';

  return (
    <div className={`score-board ${className}`}>
      <div className="score-item">
        <div className="label">SCORE</div>
        <div className="value">{score.toLocaleString()}</div>
      </div>

      <div className="score-item">
        <div className="label">LEVEL</div>
        <div className="value">{level}</div>
      </div>

      <div className="score-item">
        <div className="label">LINES</div>
        <div className="value">{lines}</div>
      </div>

      {combo >= 0 && (
        <div className="score-item combo">
          <div className="label">COMBO</div>
          <div className="value">{comboDisplay}</div>
        </div>
      )}

      {b2b && (
        <div className="score-item b2b">
          <div className="label b2b-label">BACK-TO-BACK</div>
        </div>
      )}

      {clearLabel && (
        <div className="score-item clear-label">
          <div className="label clear-label-text">{clearLabel}</div>
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;