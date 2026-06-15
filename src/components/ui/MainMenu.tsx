import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
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
  const animationFrameRef = useRef<number>(0);
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const { focusedIndex } = useKeyboardNavigation(
    MENU_ITEMS.length,
    (index: number) => callbacks[index]?.(),
    menuContainerRef,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];
    const MAX_PARTICLES = 80;

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      size: Math.random() * 3 + 1,
      speedY: -(Math.random() * 0.8 + 0.3),
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      life: 0,
      maxLife: Math.random() * 400 + 300,
    });

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife;
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
          particles[i] = createParticle();
          continue;
        }

        const lifeRatio = 1 - p.life / p.maxLife;
        const alpha = p.opacity * lifeRatio;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(0, 200, 255, ${alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(0, 100, 255, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
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