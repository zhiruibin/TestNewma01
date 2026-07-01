import React, { useState, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useParticleBackground } from '../../hooks/useParticleBackground';
import './MainMenu.css';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenScoreHistory: () => void;
}

const MENU_ITEMS = [
  { key: 'start', label: '开始游戏' },
  { key: 'settings', label: '设置' },
  { key: 'scoreHistory', label: '积分记录' },
] as const;

const CONTROL_ITEMS = [
  { keys: ['←', '→'], description: '移动' },
  { keys: ['↑'], description: '旋转' },
  { keys: ['↓'], description: '加速下落' },
  { keys: ['空格'], description: '直接掉落' },
  { keys: ['C'], description: '暂存方块' },
  { keys: ['P'], description: '暂停' },
] as const;

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenSettings,
  onOpenScoreHistory,
}) => {
  const { highScore } = useGameStore();
  const callbacks = [onStartGame, onOpenSettings, onOpenScoreHistory];
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const { focusedIndex } = useKeyboardNavigation(
    MENU_ITEMS.length,
    (index: number) => callbacks[index]?.(),
    menuContainerRef,
  );

  useParticleBackground(canvasRef);
  return (
    <div className="main-menu">
      <canvas ref={canvasRef} className="particle-canvas" />
      <div className="menu-container">
        <h1 className="menu-title">TETRIS</h1>

        <div className="menu-score">
          <span>最高分：</span>
          {highScore.toLocaleString()}
        </div>

        <div className="menu-buttons" role="menu" aria-label="主菜单">
          {MENU_ITEMS.map((item, index) => (
            <button
              role="menuitem"
              aria-label={item.label}
              key={item.key}
              className={`menu-button ${item.key}`}
              data-focused={focusedIndex === index}
              onClick={callbacks[index]}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          className={`controls-info${controlsExpanded ? ' expanded' : ''}`}
          aria-label="控制说明"
          aria-expanded={controlsExpanded}
        >
          <h3 onClick={() => setControlsExpanded(!controlsExpanded)}>
            {controlsExpanded ? '▾' : '▸'} 控制说明
          </h3>
          <div className="controls-content">
            {CONTROL_ITEMS.map((item) => (
              <div className="control-item" key={item.description}>
                {item.keys.map((key) => (
                  <span className="key" key={key}>{key}</span>
                ))}
                <span className="description">{item.description}</span>
              </div>
            ))}
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