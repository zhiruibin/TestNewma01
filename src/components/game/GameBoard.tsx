// 游戏主面板组件，负责使用 Pixi.js 渲染游戏区域
import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useGameStore } from '../../store/gameStore';
import { Tetromino, TetrominoType, Cell } from '../../types';
import './GameBoard.css';
import { ParticleSystem } from '../../game/core/ParticleSystem';

const CELL_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BOARD_WIDTH = CELL_SIZE * GRID_WIDTH;
const BOARD_HEIGHT = CELL_SIZE * GRID_HEIGHT;

const BLOCK_COLORS: Record<TetrominoType, number> = {
  I: 0x00f0f0,
  O: 0xf0f000,
  T: 0xa000f0,
  S: 0x00f000,
  Z: 0xf00000,
  J: 0x0000f0,
  L: 0xf0a000,
};

const GameBoard = React.forwardRef<HTMLDivElement>((_props, ref) => {
  const appRef = useRef<PIXI.Application | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridContainerRef = useRef<PIXI.Container | null>(null);
  const blockContainerRef = useRef<PIXI.Container | null>(null);
  const ghostContainerRef = useRef<PIXI.Container | null>(null);
  const animationFrameRef = useRef<number>(0);
  const particleContainerRef = useRef<PIXI.Container | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const grid = useGameStore((state: any) => state.grid as Cell[][]);
  const currentBlock = useGameStore((state: any) => state.currentPiece as Tetromino | null);
  const ghostBlock = useGameStore((state: any) => state.ghostPiece as Tetromino | null);
  const gameState = useGameStore((state: any) => state.status as 'idle' | 'playing' | 'paused' | 'gameover');
  const clearEffects = useGameStore((state: any) => state.clearEffects);
  const consumeEffects = useGameStore((state: any) => state.consumeEffects);
  const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    const app = new PIXI.Application({
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      backgroundColor: 0x1a1a2e,
      antialias: true,
    });
    appRef.current = app;

    gridContainerRef.current = new PIXI.Container();
    blockContainerRef.current = new PIXI.Container();
    ghostContainerRef.current = new PIXI.Container();
    particleContainerRef.current = new PIXI.Container();

    // 绘制游戏区域格线作为最底层
    const gridGraphics = new PIXI.Graphics();
    gridGraphics.lineStyle(1, 0x4a9eff, 0.15);
    for (let x = 0; x <= BOARD_WIDTH; x += CELL_SIZE) {
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, BOARD_HEIGHT);
    }
    for (let y = 0; y <= BOARD_HEIGHT; y += CELL_SIZE) {
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(BOARD_WIDTH, y);
    }
    app.stage.addChild(gridGraphics);
    app.stage.addChild(gridContainerRef.current);
    app.stage.addChild(ghostContainerRef.current);
    app.stage.addChild(blockContainerRef.current);
    app.stage.addChild(particleContainerRef.current);

    particleSystemRef.current = new ParticleSystem(particleContainerRef.current, CELL_SIZE);

    const canvas = app.view as HTMLCanvasElement;
    if (canvas && containerRef.current) {
      containerRef.current.appendChild(canvas);
    }

    setIsInitialized(true);

    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      particleSystemRef.current?.update(dt);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);


  // Render grid
  useEffect(() => {
    if (!gridContainerRef.current || !grid) return;

    gridContainerRef.current.removeChildren();

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid[y][x];
        if (cell && cell.type) {
          const graphics = new PIXI.Graphics();
          const color = BLOCK_COLORS[cell.type as TetrominoType];
          graphics.beginFill(color);
          graphics.drawRect(0, 0, CELL_SIZE - 1, CELL_SIZE - 1);
          graphics.endFill();
          graphics.x = x * CELL_SIZE;
          graphics.y = y * CELL_SIZE;
          gridContainerRef.current.addChild(graphics);
        }
      }
    }
  }, [grid]);

  // Render ghost block
  useEffect(() => {
    if (!ghostContainerRef.current || !ghostBlock) return;

    ghostContainerRef.current.removeChildren();

    const shape = ghostBlock.shape;
    const color = 0x888888;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const graphics = new PIXI.Graphics();
          graphics.beginFill(color, 0.3);
          graphics.lineStyle(1, 0xffffff, 0.5);
          graphics.drawRect(0, 0, CELL_SIZE - 1, CELL_SIZE - 1);
          graphics.endFill();
          graphics.x = (ghostBlock.x + x) * CELL_SIZE;
          graphics.y = (ghostBlock.y + y) * CELL_SIZE;
          ghostContainerRef.current.addChild(graphics);
        }
      }
    }
  }, [ghostBlock]);

  // Render current block
  useEffect(() => {
    if (!blockContainerRef.current) {
      console.error('[GameBoard] blockContainerRef is null');
      return;
    }

    if (!currentBlock) {
      console.log('[GameBoard] Skip render: currentBlock is null/undefined');
      return;
    }

    const validation = {
      hasType: !!currentBlock.type,
      hasX: typeof currentBlock.x === 'number',
      hasY: typeof currentBlock.y === 'number',
      hasShape: !!currentBlock.shape,
      shapeValid: Array.isArray(currentBlock.shape) && currentBlock.shape.length > 0,
      shapeRowValid: currentBlock.shape[0] && Array.isArray(currentBlock.shape[0]),
    };

    console.log('[GameBoard] Block data validation:', validation);

    if (!validation.hasType || !validation.hasX || !validation.hasY) {
      console.error('[GameBoard] Invalid block data:', currentBlock);
      return;
    }

    const shape = currentBlock.shape;
    if (!validation.shapeValid || !validation.shapeRowValid) {
      console.error('[GameBoard] Invalid shape:', shape);
      return;
    }

console.log('[GameBoard] Rendering block:', {
      type: currentBlock.type,
      x: currentBlock.x,
      y: currentBlock.y,
      shape: shape,
      shapeSize: `${shape.length}x${shape[0].length}`,
      position: `(${currentBlock.x * CELL_SIZE}, ${currentBlock.y * CELL_SIZE})`
    });

    // 详细调试：输出 shape 数组每个元素的值
    console.log('[GameBoard] Shape array details:');
    for (let y = 0; y < shape.length; y++) {
      console.log(`[GameBoard]   Row ${y}:`, shape[y], 'values:', shape[y].map((v: number) => v).join(', '));
    }

    blockContainerRef.current.removeChildren();

    const color = BLOCK_COLORS[currentBlock.type as TetrominoType];
    if (color === undefined) {
      console.error('[GameBoard] Unknown block type:', currentBlock.type);
      return;
    }

    let renderCount = 0;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const graphics = new PIXI.Graphics();
          graphics.beginFill(color, 1.0);
          graphics.lineStyle(1, 0xffffff, 0.5);
          graphics.drawRect(0, 0, CELL_SIZE - 1, CELL_SIZE - 1);
          graphics.endFill();
          graphics.x = (currentBlock.x + x) * CELL_SIZE;
          graphics.y = (currentBlock.y + y) * CELL_SIZE;
          blockContainerRef.current.addChild(graphics);
          renderCount++;
        }
      }
    }

    console.log(`[GameBoard] Rendered ${renderCount} blocks for ${currentBlock.type}`);
  }, [currentBlock]);

  // 粒子特效：订阅消除效果并触发粒子发射
  useEffect(() => {
    if (clearEffects.length === 0 || !particleSystemRef.current) return;
    for (const effect of clearEffects) {
      for (let i = 0; i < effect.rows.length; i++) {
        const row = effect.rows[i];
        const cellTypes = effect.cellTypes[i];
        if (!cellTypes) continue;
        for (let col = 0; col < cellTypes.length; col++) {
          const type = cellTypes[col] as TetrominoType | null;
          if (type && BLOCK_COLORS[type] !== undefined) {
            particleSystemRef.current.emit(row, col, BLOCK_COLORS[type], effect.intensity);
          }
        }
      }
    }
    consumeEffects();
  }, [clearEffects]);

  const getOverlayMessage = () => {
    if (gameState === 'idle') return '按回车键开始游戏';
    if (gameState === 'paused') return '游戏已暂停';
    if (gameState === 'gameover') return '游戏结束';
    return '';
  };

  return (
    <div ref={ref} className="game-board-container">
      <div ref={containerRef} className="pixi-container" />
      {(gameState === 'idle' || gameState === 'paused' || gameState === 'gameover') && (
        <div className="overlay">
          <div className="overlay-message">
            {getOverlayMessage()}
          </div>
        </div>
      )}
    </div>
  );
});

export default GameBoard;