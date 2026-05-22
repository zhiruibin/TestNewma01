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
const LOCK_DELAY_MS = 500;
const MAX_LOCK_DELAY_RESETS = 15;

// SRS Wall Kick offset tables
// Keys: 'fromRotation>toRotation', values: 5 [dx, dy] pairs (SRS convention: dy positive = up)
const WALL_KICK_OFFSETS: Record<string, [number, number][]> = {
  // Clockwise
  '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  // Counter-clockwise
  '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

const WALL_KICK_OFFSETS_I: Record<string, [number, number][]> = {
  // Clockwise
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  // Counter-clockwise
  '0>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3>2': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2>1': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '1>0': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
};
interface ScoreRecord {
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
  tSpin: boolean;
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
  startGameLoop: () => void;
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

  // Lock Delay
  lockDelayTimer: NodeJS.Timeout | null;
  gameLoopInterval: number | null;
  lockDelayResets: number;
  lastFrameTime: number;
  dropAccumulator: number;
  startLockDelay: () => void;
  resetLockDelay: () => void;
  clearLockDelay: () => void;
  isOnGround: () => boolean;
  incrementCombo: () => void;
  resetCombo: () => void;
  setB2B: (value: boolean) => void;
  updateHighScore: () => void;
  addScore: (points: number) => void;
  addLines: (count: number) => void;
  scoreHistory: ScoreRecord[];
  addScoreRecord: () => void;
  clearScoreHistory: () => void;

  // Settings
  difficulty: 'easy' | 'normal' | 'hard';
  setDifficulty: (level: 'easy' | 'normal' | 'hard') => void;
  showGhost: boolean;
  setShowGhost: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  resetHighScore: () => void;
}

const createInitialGrid = (): (Cell | null)[][] => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null)
  );
};

export const useGameStore = create<GameStore>((set, get) => ({
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
  tSpin: false,
highScore: (() => { try { return parseInt(localStorage.getItem('tetris_highScore') || '0', 10); } catch { return 0; } })(),
  difficulty: 'normal' as const,
  showGhost: true,
  showGrid: true,
  scoreHistory: (() => { try { return JSON.parse(localStorage.getItem('tetris_scoreHistory') || '[]'); } catch { return []; } })(),
  clearEffects: [],

  block: null,
  gridSystem: null,
  scoreSystem: null,
  levelSystem: null,
  holdSystem: null,
  gameLoopInterval: null,
  lineClearSystem: null,
  lockDelayTimer: null,
  lockDelayResets: 0,
  lastFrameTime: 0,
  dropAccumulator: 0,
  initGame: () => {
    Block.resetBag();
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
    });
    get().updateGhost();
  },
  startGame: () => {
    get().initGame();
    get().startGameLoop();
  },
  pauseGame: () => {
    get().clearLockDelay();
    const { gameLoopInterval } = get();
    
    // 清除游戏循环
    if (gameLoopInterval) {
      cancelAnimationFrame(gameLoopInterval);
    }
    
    set({ status: 'paused', gameLoopInterval: null, lockDelayTimer: null, lastFrameTime: 0, dropAccumulator: 0 });
  },
  resumeGame: () => {
    get().startGameLoop();
  },
  startGameLoop: () => {
    const { gameLoopInterval } = get();

    // 清除旧的游戏循环
    if (gameLoopInterval) {
      cancelAnimationFrame(gameLoopInterval);
    }

    set({ status: 'playing', lastFrameTime: 0, dropAccumulator: 0 });

    const gameLoop = (timestamp: number) => {
      const { status: currentStatus, level, lastFrameTime, dropAccumulator } = get();
      if (currentStatus !== 'playing') {
        return;
      }

      let currentLastFrameTime = lastFrameTime;
      let currentDropAccumulator = dropAccumulator;

      if (currentLastFrameTime === 0) {
        currentLastFrameTime = timestamp;
      }

      const delta = timestamp - currentLastFrameTime;
      currentDropAccumulator += delta;

      const dropInterval = Math.max(100, 1000 - (level - 1) * 100);

      if (currentDropAccumulator >= dropInterval) {
        get().moveDown();
        currentDropAccumulator -= dropInterval;
      }

      currentLastFrameTime = timestamp;
      set({ lastFrameTime: currentLastFrameTime, dropAccumulator: currentDropAccumulator });

      if (get().status === 'playing') {
        const id = requestAnimationFrame(gameLoop);
        set({ gameLoopInterval: id });
      }
    };

    const id = requestAnimationFrame(gameLoop);
    set({ gameLoopInterval: id });
  },
  gameOver: () => {
    get().clearLockDelay();
    const { gameLoopInterval } = get();
    
    // 停止游戏循环
    if (gameLoopInterval) {
      cancelAnimationFrame(gameLoopInterval);
    }
    
    // 更新最高分
    get().updateHighScore();
    
    // 记录本次游戏得分
    get().addScoreRecord();
    
    set({ status: 'gameover', gameLoopInterval: null, lockDelayTimer: null, lockDelayResets: 0, lastFrameTime: 0, dropAccumulator: 0 });
  },
  resetGame: () => {
    get().clearLockDelay();
    const { gameLoopInterval } = get();

    // 清除之前的游戏循环
    if (gameLoopInterval) {
      cancelAnimationFrame(gameLoopInterval);
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
      lockDelayTimer: null,
      lockDelayResets: 0,
      lastFrameTime: 0,
      dropAccumulator: 0,
    });
  },
  lockPiece: () => {
    get().clearLockDelay();
    set({ lockDelayResets: 0 });
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
      get().startLockDelay();
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
    if (get().isOnGround()) {
      get().resetLockDelay();
    } else {
      get().clearLockDelay();
    }
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
    if (get().isOnGround()) {
      get().resetLockDelay();
    } else {
      get().clearLockDelay();
    }
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

    // SRS Wall Kick: select offset table by piece type
    const offsetTable = currentPiece.type === 'I' ? WALL_KICK_OFFSETS_I : WALL_KICK_OFFSETS;
    const kickKey = `${currentRotation}>${newRotation}`;
    const kicks = offsetTable[kickKey];

    if (kicks) {
      for (const [dx, dy] of kicks) {
        const testPiece: Tetromino = {
          ...currentPiece,
          shape: newShape,
          rotation: newRotation,
          x: currentPiece.x + dx,
          y: currentPiece.y - dy, // SRS y-axis: positive dy = up, screen y = down
        };
        if (!gridSystem.checkCollision(testPiece)) {
          set({ currentPiece: testPiece });
          get().updateGhost();
          if (get().isOnGround()) {
            get().resetLockDelay();
          } else {
            get().clearLockDelay();
          }
          return true;
        }
      }
    }

    return false;
  },

  hardDrop: () => {
    get().clearLockDelay();
    let dropDistance = 0;
    while (get().moveDown()) {
      dropDistance++;
    }
    get().clearLockDelay();
    get().lockPiece();
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

  isOnGround: () => {
    const { currentPiece, gridSystem } = get();
    if (!currentPiece || !gridSystem) {
      return false;
    }
    const testPiece: Tetromino = {
      ...currentPiece,
      y: currentPiece.y + 1,
    };
    return gridSystem.checkCollision(testPiece);
  },

  startLockDelay: () => {
    const { lockDelayTimer } = get();
    if (lockDelayTimer) {
      return;
    }
    const timer = setTimeout(() => {
      set({ lockDelayTimer: null });
      get().lockPiece();
    }, LOCK_DELAY_MS);
    set({ lockDelayTimer: timer as any });
  },

  resetLockDelay: () => {
    const { lockDelayTimer, lockDelayResets } = get();
    if (lockDelayResets >= MAX_LOCK_DELAY_RESETS) {
      return;
    }
    if (lockDelayTimer) {
      clearTimeout(lockDelayTimer);
    }
    const newResets = lockDelayResets + 1;
    const timer = setTimeout(() => {
      set({ lockDelayTimer: null });
      get().lockPiece();
    }, LOCK_DELAY_MS);
    set({ lockDelayTimer: timer as any, lockDelayResets: newResets });
  },

  clearLockDelay: () => {
    const { lockDelayTimer } = get();
    if (lockDelayTimer) {
      clearTimeout(lockDelayTimer);
    }
    set({ lockDelayTimer: null });
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
  setDifficulty: (level: 'easy' | 'normal' | 'hard') => set({ difficulty: level }),
  setShowGhost: (show: boolean) => set({ showGhost: show }),
  setShowGrid: (show: boolean) => set({ showGrid: show }),
  resetHighScore: () => {
    set({ highScore: 0 });
    localStorage.removeItem('tetris_highScore');
  },
  consumeEffects: () => {
    const effects = get().clearEffects;
    set({ clearEffects: [] });
    return effects;
  },
}));

export default useGameStore;