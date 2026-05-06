// 导入 React 和必要的类型定义
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import './ScoreBoard.css';

// ScoreBoard 组件属性接口定义
interface ScoreBoardProps {
  className?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ className = '' }) => {
  // ScoreBoard 组件，显示当前分数和最高分
  const { score, level, lines, combo, tSpin } = useGameStore((state) => ({
    score: state.score,
    level: state.level,
    lines: state.lines,
    combo: state.combo,
    // 渲染分数显示区域
    tSpin: state.tSpin,
  }));

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

      {combo > 0 && (
        <div className="score-item combo">
          <div className="label">COMBO</div>
          <div className="value">{combo}x</div>
        </div>
      )}

      {tSpin && (
        <div className="score-item t-spin">
          <div className="label">T-SPIN</div>
          <div className="value">ACTIVE</div>
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;