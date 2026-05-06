import { create } from 'zustand';
import { Tetromino, GameState, GameStatus, Cell } from '../../types';
import { Block, BlockType, BLOCK_SHAPES } from '../game/core/Block';
import { Grid } from '../game/core/Grid';
import { Score } from '../core/Score';
import { Level } from '../core/Level';
import { Hold } from '../core/Hold';
import { LineClear, ClearEffect } from '../game/core/LineClear';
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
export interface ScoreRecord {
  score: number;
  level: number;
  lines: number;
  date: string;
}

interface GameStore {
  // Game State
  status: GameStatus;
  grid: Cell[][];
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  holdPiece: Tetromino | null;
  ghostPiece: Tetromino | null;
  canHold: boolean;

  // Game Progress
  score: number;
  level: number;
  lines: number;
  combo: number;
  b2b: boolean;
highScore: number;
  clearEffects: Array<{ type: string; rows: number[]; intensity: number; duration: number; cellTypes: (string | null)[][] }>;
  consumeEffects: () => Array<{ type: string; rows: number[]; intensity: number; duration: number; cellTypes: (string | null)[][] }>;

  // Game Systems
  block: Block | null;
  gridSystem: Grid | null;
  scoreSystem: Score | null;
  levelSystem: Level | null;
  holdSystem: Hold | null;
  lineClearSystem: LineClear | null;

  // Actions
  initGame: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  resetGame: () => void;

  // Piece Actions
  moveLeft: () => boolean;
  moveRight: () => boolean;
  moveDown: () => boolean;
  hardDrop: () => number;
  rotate: (clockwise: boolean) => boolean;
  hold: () => void;

  // Grid Actions
  lockPiece: () => void;
  clearLines: () => number;
  updateGhost: () => void;

  // Score Actions
  addScore: (points: number) => void;
  addLines: (count: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  setB2B: (value: boolean) => void;
  updateHighScore: () => void;
  scoreHistory: ScoreRecord[];
  addScoreRecord: () => void;
  clearScoreHistory: () => void;
}

const createInitialGrid = (): (Cell | null)[][] => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null)
  );
};

export const useGameStore = create((set, get) => ({
  // Initial State
  status: 'idle',
  grid: createInitialGrid(),
  currentPiece: null,
  nextPiece: null,
  holdPiece: null,
  ghostPiece: null,
  canHold: true,

  score: 0,
  level: 1,
  lines: 0,
  combo: -1,
  b2b: false,
highScore: 0,
  scoreHistory: (() => { try { return JSON.parse(localStorage.getItem('tetris_scoreHistory') || '[]'); } catch { return []; } })(),
  clearEffects: [],

  block: null,
  gridSystem: null,
  scoreSystem: null,
  levelSystem: null,
  holdSystem: null,
  gameLoopInterval: null,
  lineClearSystem: null,

  initGame: () => {
    const block = new Block('I');
    const gridSystem = new Grid(BOARD_WIDTH, BOARD_HEIGHT);
    const scoreSystem = new Score();
    const levelSystem = new Level();
    const holdSystem = new Hold();
  const lineClearSystem = new LineClear(gridSystem);

    const nextBlock = Block.createRandom();
    const currentBlock = Block.createRandom();

    const nextShape = nextBlock.getShape();
    const nextMaxWidth = Math.max(...nextShape.map(row => row.length));
    const nextStartX = Math.floor((BOARD_WIDTH - nextMaxWidth) / 2);

    const nextPiece: Tetromino = {
      type: nextBlock.type,
      color: nextBlock.color,
      shape: nextShape,
      rotation: nextBlock.rotationIndex,
      x: nextStartX,
      y: 0,
    };

    const shape = currentBlock.getShape();
    const maxWidth = Math.max(...shape.map(row => row.length));
    const startX = Math.floor((BOARD_WIDTH - maxWidth) / 2);

    const currentPiece: Tetromino = {
      type: currentBlock.type,
      color: currentBlock.color,
      shape: shape,
      rotation: currentBlock.rotationIndex,
      x: startX,
      y: 0,
    };

    gridSystem.clear();

    set({
      block,
      gridSystem,
      scoreSystem,
      levelSystem,
      holdSystem,
      lineClearSystem,
      currentPiece,
      nextPiece,
      holdPiece: null,
      canHold: true,
      grid: gridSystem.getCells(),
      score: 0,
      level: 1,
      lines: 0,
      combo: -1,
      b2b: false,
      highScore: 0,
    });
    get().updateGhost();
  },
startGame: () => {
    // 直接重新初始化游戏系统
    get().initGame();
    
    // 获取最新状态
    const { gameLoopInterval, level } = get();
    
    // 清除之前的游戏循环
    if (gameLoopInterval) {
      clearTimeout(gameLoopInterval);
    }
    
    set({ status: 'playing' });
    
    // 启动游戏循环
    const runGameLoop = () => {
      const { status: currentStatus, level: currentLevel } = get();
      if (currentStatus !== 'playing') {
        return;
      }

      get().moveDown();
      const interval = Math.max(100, 1000 - (currentLevel - 1) * 100);
      const timeout = setTimeout(runGameLoop, interval);
      set({ gameLoopInterval: timeout as any });
    };

    const interval = Math.max(100, 1000 - (level - 1) * 100);
    const timeout = setTimeout(runGameLoop, interval);
    set({ gameLoopInterval: timeout as any });
  },
  pauseGame: () => {
  const { gameLoopInterval } = get();
  
  // 清除游戏循环
  if (gameLoopInterval) {
    clearTimeout(gameLoopInterval);
  }
  
    set({ status: 'paused', gameLoopInterval: null });
  },
  resumeGame: () => {
    const { gameLoopInterval } = get();
    
    // 确保没有正在运行的游戏循环
    if (gameLoopInterval) {
      clearTimeout(gameLoopInterval);
    }
    
    set({ status: 'playing' });
    
    // 重新启动游戏循环
    const runGameLoop = () => {
      const { status: currentStatus, level } = get();
      if (currentStatus !== 'playing') {
        return;
      }

      get().moveDown();
      const interval = Math.max(100, 1000 - (level - 1) * 100);
      const timeout = setTimeout(runGameLoop, interval);
      set({ gameLoopInterval: timeout as any });
    };

    const interval = Math.max(100, 1000 - (get().level - 1) * 100);
    const timeout = setTimeout(runGameLoop, interval);
    set({ gameLoopInterval: timeout as any });
  },
  gameOver: () => {
    const { gameLoopInterval } = get();
    
    // 停止游戏循环
    if (gameLoopInterval) {
      clearTimeout(gameLoopInterval);
    }
    
    // 更新最高分
    get().updateHighScore();
    
    // 记录本次游戏得分
    get().addScoreRecord();
    
    set({ status: 'gameover', gameLoopInterval: null });
  },
  resetGame: () => {
    const { gameLoopInterval } = get();

    // 清除之前的游戏循环
    if (gameLoopInterval) {
      clearTimeout(gameLoopInterval);
    }

    // 手动重置所有游戏状态，不调用 initGame()（避免 status 被设为 playing）
    set({
      status: 'idle',
      grid: createInitialGrid(),
      currentPiece: null,
      nextPiece: null,
      holdPiece: null,
      ghostPiece: null,
      canHold: true,
      score: 0,
      level: 1,
      lines: 0,
      combo: -1,
      b2b: false,
      block: null,
      gridSystem: null,
      scoreSystem: null,
      levelSystem: null,
      holdSystem: null,
      lineClearSystem: null,
      gameLoopInterval: null,
    });
  },
  lockPiece: () => {
    console.log('[lockPiece] Entry - currentPiece:', get().currentPiece?.type, 'at', get().currentPiece?.x, get().currentPiece?.y);
    const { currentPiece, nextPiece, gridSystem, gameLoopInterval, lineClearSystem, status } = get();
    if (!currentPiece || !gridSystem || !nextPiece || !lineClearSystem) {
      console.log('[lockPiece] Early return - missing systems or pieces');
      return;
    }

    gridSystem.lockPiece(currentPiece);
    console.log('[lockPiece] gridSystem.lockPiece() completed - grid updated with locked piece');

    const boardData = gridSystem.getCells();
    const pendingRows = lineClearSystem.findCompleteRows();
    const clearedCellTypes = pendingRows.map(row => boardData[row].map(cell => cell?.type ?? null));
    const lineClearResult = lineClearSystem.checkAndClear();
    console.log('[lockPiece] LineClear result:', lineClearResult);

    if (lineClearResult && lineClearResult.linesCleared > 0) {
      const { combo, level } = get();

      const points = lineClearResult.score * level;

      get().addScore(points);
get().addLines(lineClearResult.linesCleared);
      get().incrementCombo();
      get().setB2B(lineClearResult.backToBack);
      const effects = lineClearSystem.getPendingEffects();
      if (effects.length > 0) {
        set({ clearEffects: effects.map(e => ({ ...e, cellTypes: clearedCellTypes })) });
      }

      get().levelSystem?.addLinesCleared(lineClearResult.linesCleared);
      const newLevel = get().levelSystem?.getLevel();
      if (newLevel !== undefined && newLevel > level) {
        set({ level: newLevel });
      }
    } else {
      get().resetCombo();
    }

    const testPiece: Tetromino = {
      ...nextPiece,
      y: 0,
    };
    if (gridSystem.checkCollision(testPiece)) {
      get().gameOver();
      return;
    }

    const newNextBlock = Block.createRandom();
    const newNextShape = newNextBlock.getShape();
    const newNextMaxWidth = Math.max(...newNextShape.map(row => row.length));
    const newNextStartX = Math.floor((BOARD_WIDTH - newNextMaxWidth) / 2);
    const newNextPiece: Tetromino = {
      type: newNextBlock.type,
      color: newNextBlock.color,
      shape: newNextShape,
      rotation: newNextBlock.rotationIndex,
      x: newNextStartX,
      y: 0,
    };

    const newCurrentPiece: Tetromino = {
      ...nextPiece,
      x: Math.floor((BOARD_WIDTH - Math.max(...nextPiece.shape.map(row => row.length))) / 2),
      y: 0,
    };

    set({
      currentPiece: newCurrentPiece,
      nextPiece: newNextPiece,
      grid: gridSystem.getCells(),
      canHold: true,
    });

    get().updateGhost();
  },
  clearLines: () => {
    const { gridSystem, scoreSystem, levelSystem } = get();
    const clearedLines = gridSystem.clearLines();
    console.log('[clearLines] gridSystem.clearLines() returned:', clearedLines, 'lines');
    if (clearedLines > 0) {
      const { combo, b2b, level } = get();
      const isTetris = clearedLines === 4;

      const points = scoreSystem.calculateLineClear(
        clearedLines,
        combo,
        b2b,
        isTetris,
        level
      );

      get().addScore(points);
      get().addLines(clearedLines);
      get().incrementCombo();

      if (isTetris) {
        get().setB2B(true);
      } else {
        get().setB2B(false);
      }

      levelSystem?.addLinesCleared(clearedLines);
      const newLevel = levelSystem?.getLevel();
      if (newLevel !== undefined && newLevel > level) {
        set({ level: newLevel });
      }
    } else {
      get().resetCombo();
    }

    set({ grid: gridSystem.getCells() });
    return clearedLines;
  },

  updateGhost: () => {
    const { currentPiece, gridSystem } = get();
    if (!currentPiece || !gridSystem) {
      set({ ghostPiece: null });
      return;
    }

    let ghostY = currentPiece.y;

    while (true) {
      const testY = ghostY + 1;
      const testPiece: Tetromino = {
        ...currentPiece,
        y: testY,
      };
      if (!gridSystem.checkCollision(testPiece)) {
        ghostY = testY;
      } else {
        break;
      }
    }

    const ghostPiece: Tetromino = {
      ...currentPiece,
      y: ghostY,
    };

    set({ ghostPiece });
  },

  addScore: (points: number) => {
    set((state) => ({ score: state.score + points }));
  },

  addLines: (count: number) => {
    set((state) => ({ lines: state.lines + count }));
  },

  incrementCombo: () => {
    set((state) => ({ combo: state.combo + 1 }));
  },

  resetCombo: () => {
    set({ combo: -1 });
  },

  setB2B: (value: boolean) => {
    set({ b2b: value });
  },

  moveDown: () => {
    const { currentPiece, gridSystem } = get();
    if (!currentPiece || !gridSystem) {
      return false;
    }

    const testPiece: Tetromino = {
      ...currentPiece,
      y: currentPiece.y + 1,
    };

    if (gridSystem.checkCollision(testPiece)) {
      get().lockPiece();
      return false;
    }

    set({ currentPiece: testPiece });
    get().updateGhost();
    return true;
  },

  moveLeft: () => {
    const { currentPiece, gridSystem } = get();
    if (!currentPiece || !gridSystem) {
      return false;
    }

    const testPiece: Tetromino = {
      ...currentPiece,
      x: currentPiece.x - 1,
    };

    if (gridSystem.checkCollision(testPiece)) {
      return false;
    }

    set({ currentPiece: testPiece });
    get().updateGhost();
    return true;
  },

  moveRight: () => {
    const { currentPiece, gridSystem } = get();
    if (!currentPiece || !gridSystem) {
      return false;
    }

    const testPiece: Tetromino = {
      ...currentPiece,
      x: currentPiece.x + 1,
    };

    if (gridSystem.checkCollision(testPiece)) {
      return false;
    }

    set({ currentPiece: testPiece });
    get().updateGhost();
    return true;
  },

  rotate: (clockwise: boolean) => {
    const { currentPiece, gridSystem } = get();
    if (!currentPiece || !gridSystem) {
      return false;
    }

    const shapes = BLOCK_SHAPES[currentPiece.type];
    if (!shapes || shapes.length === 0) {
      return false;
    }

    const totalRotations = shapes.length;
    const currentRotation = currentPiece.rotation ?? 0;
    const newRotation = clockwise
      ? (currentRotation + 1) % totalRotations
      : (currentRotation - 1 + totalRotations) % totalRotations;
    const newShape = shapes[newRotation];

    const testPiece: Tetromino = {
      ...currentPiece,
      shape: newShape,
      rotation: newRotation,
    };

    if (gridSystem.checkCollision(testPiece)) {
      return false;
    }

    set({ currentPiece: testPiece });
    get().updateGhost();
    return true;
  },

  hardDrop: () => {
    let dropDistance = 0;
    while (get().moveDown()) {
      dropDistance++;
    }
    get().addScore(dropDistance * 2);
    return dropDistance;
  },

  hold: () => {
    const { currentPiece, holdPiece, holdSystem, canHold, block } = get();
    if (!currentPiece || !holdSystem || !canHold || !block) {
      return;
    }

    const newHoldPiece: Tetromino = {
      type: currentPiece.type,
      color: currentPiece.color,
      shape: currentPiece.shape,
      rotation: currentPiece.rotation,
      x: Math.floor((BOARD_WIDTH - Math.max(...currentPiece.shape.map(row => row.length))) / 2),
      y: 0,
    };

    let newCurrentPiece: Tetromino | null = null;

    if (holdPiece) {
      newCurrentPiece = {
        ...holdPiece,
        x: Math.floor((BOARD_WIDTH - Math.max(...holdPiece.shape.map(row => row.length))) / 2),
        y: 0,
      };
    } else {
      const newBlock = Block.createRandom();
      const shape = newBlock.getShape();
      const maxWidth = Math.max(...shape.map(row => row.length));
      const startX = Math.floor((BOARD_WIDTH - maxWidth) / 2);
      newCurrentPiece = {
        type: newBlock.type,
        color: newBlock.color,
        shape: shape,
        rotation: newBlock.rotationIndex,
        x: startX,
        y: 0,
      };
    }

    set({
      holdPiece: newHoldPiece,
      currentPiece: newCurrentPiece,
      canHold: false,
    });

    get().updateGhost();
  },
  updateHighScore: () => {
    const { score, highScore } = get();
    if (score > highScore) {
      set({ highScore: score });
      localStorage.setItem('tetris_highScore', score.toString());
    }
  },
  addScoreRecord: () => {
    const { score, level, lines, scoreHistory } = get();
    const record: ScoreRecord = {
      score,
      level,
      lines,
      date: new Date().toLocaleString(),
    };
    const newHistory = [...scoreHistory, record].slice(-10);
    set({ scoreHistory: newHistory });
    localStorage.setItem('tetris_scoreHistory', JSON.stringify(newHistory));
  },
  clearScoreHistory: () => {
    set({ scoreHistory: [] });
    localStorage.removeItem('tetris_scoreHistory');
  },
  consumeEffects: () => {
    const effects = get().clearEffects;
    set({ clearEffects: [] });
    return effects;
  },
}));

export default useGameStore;