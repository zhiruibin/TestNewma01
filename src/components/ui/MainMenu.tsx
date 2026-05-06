import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import './MainMenu.css';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenScoreHistory: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenSettings,
  onOpenScoreHistory,
}) => {
  const { highScore } = useGameStore();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const focusedIndexRef = useRef(focusedIndex);
  focusedIndexRef.current = focusedIndex;
  const buttonCallbacks = useRef([onStartGame, onOpenSettings, onOpenScoreHistory]);
  buttonCallbacks.current = [onStartGame, onOpenSettings, onOpenScoreHistory];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + 3) % 3);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % 3);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        buttonCallbacks.current[focusedIndexRef.current]?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="game-title">TETRIS</h1>
      
      <div className="high-score">
        <span>最高分：</span>
        {highScore.toLocaleString()}
      </div>

      <div className="menu-buttons">
        <button className="menu-button start" data-focused={focusedIndex === 0} onClick={onStartGame}>
          开始游戏
        </button>
        
        <button className="menu-button settings" data-focused={focusedIndex === 1} onClick={onOpenSettings}>
          设置
        </button>
        
        <button className="menu-button" data-focused={focusedIndex === 2} onClick={onOpenScoreHistory}>
          积分记录
        </button>
      </div>

      <div className="controls-info">
        <h2>控制说明</h2>
        <div className="control-item">
          <span className="key">←</span>
          <span className="key">→</span>
          <span className="description">移动</span>
        </div>
        <div className="control-item">
          <span className="key">↑</span>
          <span className="description">旋转</span>
        </div>
        <div className="control-item">
          <span className="key">↓</span>
          <span className="description">加速下落</span>
        </div>
        <div className="control-item">
          <span className="key">空格</span>
          <span className="description">直接掉落</span>
        </div>
        <div className="control-item">
          <span className="key">C</span>
          <span className="description">暂存方块</span>
        </div>
        <div className="control-item">
          <span className="key">P</span>
          <span className="description">暂停</span>
        </div>
      </div>

      <div className="version-info">
        <p>使用 React + TypeScript + Pixi.js 构建</p>
      </div>
    </div>
    </div>
  );
};

export default MainMenu;