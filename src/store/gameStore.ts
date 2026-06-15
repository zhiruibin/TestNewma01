import { create } from 'zustand';
import { Tetromino, GameState, GameStatus, Cell } from '../../types';
import { Block, BlockType, BLOCK_SHAPES } from '../game/core/Block';
import { Grid } from '../game/core/Grid';
import { ScoreSystem as Score } from '../game/core/Score';
import { Level } from '../game/core/Level';
import { Hold } from '../game/core/Hold';
import { LineClear, ClearEffect } from '../game/core/LineClear';
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const LOCK_DELAY_MS = 500;
const MAX_LOCK_DELAY_RESETS = 15;
const NEXT_QUEUE_SIZE = 5;
const CLEAR_ANIMATION_MS = 400;

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

interface GameStats {
  tSpinCount: number;
  tetrisCount: number;
  maxCombo: number;
  totalActions: number;
  startTime: number;
}

interface GameStore {
  // Game State
  status: GameStatus;
  grid: Cell[][];
  currentPiece: Tetromino | null;
  nextPieces: Tetromino[];
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
  clearLabel: string;
  setClearLabel: (label: string) => void;
  clearEffects: Array<{ type: string; rows: number[]; intensity: number; duration: number; cellTypes: (string | null)[][] }>;
  consumeEffects: () => Array<{ type: string; rows: number[]; intensity: number; duration: number; cellTypes: (string | null)[][] }>;

  // Clear Animation
  clearAnimationActive: boolean;
  clearAnimationRows: number[];

  // Ready Go
  readyGoPhase: 'ready' | 'go' | null;
  readyGoTimer: NodeJS.Timeout | null;

  // Game Statistics
  gameStats: GameStats;

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

  // DAS / ARR
  das: number;
  arr: number;
  setDAS: (das: number) => void;
  setARR: (arr: number) => void;
}

const createInitialGrid = (): (Cell | null)[][] => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null)
  );
};

const createTetrominoFromBlock = (block: Block): Tetromino => {
  const shape = block.getShape();
  const maxWidth = Math.max(...shape.map(row => row.length));
  const startX = Math.floor((BOARD_WIDTH - maxWidth) / 2);
  return {
    type: block.type,
    color: block.color,
    shape,
    rotation: block.rotationIndex,
    x: startX,
    y: 0,
  };
};

const createDefaultGameStats = (): GameStats => ({
  tSpinCount: 0,
  tetrisCount: 0,
  maxCombo: 0,
  totalActions: 0,
  startTime: Date.now(),
});

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial State
  status: 'idle',
  grid: createInitialGrid(),
  currentPiece: null,
  nextPieces: [],
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
  clearLabel: '',
  das: 170,
  arr: 50,

  // Clear Animation
  clearAnimationActive: false,
  clearAnimationRows: [],

  // Ready Go
  readyGoPhase: null,
  readyGoTimer: null,

  // Game Statistics
  gameStats: createDefaultGameStats(),

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

    // Apply current difficulty speed multiplier
    const { difficulty } = get();
    const speedMultiplier = difficulty === 'easy' ? 1.5 : difficulty === 'hard' ? 0.6 : 1.0;
    levelSystem.setSpeedMultiplier(speedMultiplier);

    // Generate next queue (5 pieces)
    const nextPieces: Tetromino[] = [];
    for (let i = 0; i < NEXT_QUEUE_SIZE; i++) {
      const nextBlock = Block.createRandom();
      nextPieces.push(createTetrominoFromBlock(nextBlock));
    }

    // Current piece comes from the front of the queue
    const currentBlock = Block.createRandom();
    const currentPiece = createTetrominoFromBlock(currentBlock);

    gridSystem.clear();

    set({
      block,
      gridSystem,
      scoreSystem,
      levelSystem,
      holdSystem,
      lineClearSystem,
      currentPiece,
      nextPieces,
      holdPiece: null,
      canHold: true,
      grid: gridSystem.getCells(),
      score: 0,
      level: 1,
      lines: 0,
      combo: -1,
      b2b: false,
      tSpin: false,
      clearAnimationActive: false,
      clearAnimationRows: [],
      readyGoPhase: null,
      readyGoTimer: null,
      gameStats: createDefaultGameStats(),
    });
    get().updateGhost();
  },

  startGame: () => {
    get().initGame();

    // Ready → Go countdown sequence
    set({ status: 'playing', readyGoPhase: 'ready' });

    const readyTimer = setTimeout(() => {
      set({ readyGoPhase: 'go' });
      const goTimer = setTimeout(() => {
        set({ readyGoPhase: null, readyGoTimer: null });
        get().startGameLoop();
      }, 500);
      set({ readyGoTimer: goTimer as any });
    }, 1500);
    set({ readyGoTimer: readyTimer as any });
  },

  pauseGame: () => {
    get().clearLockDelay();
    const { gameLoopInterval, readyGoTimer } = get();

    if (gameLoopInterval) {
      cancelAnimationFrame(gameLoopInterval);
    }
    if (readyGoTimer) {
      clearTimeout(readyGoTimer);
    }

    set({ status: 'paused', gameLoopInterval: null, lockDelayTimer: null, lastFrameTime: 0, dropAccumulator: 0, readyGoPhase: null, readyGoTimer: null });
  },

  resumeGame: () => {
    get().startGameLoop();
  },

  startGameLoop: () => {
    const { gameLoopInterval } = get();

    if (gameLoopInterval) {
      cancelAnimationFrame(gameLoopInterval);
    }

    set({ status: 'playing', lastFrameTime: 0, dropAccumulator: 0 });

    const gameLoop = (timestamp: number) => {
      const { status: currentStatus, levelSystem, lastFrameTime, dropAccumulator } = get();
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

      // Use levelSystem.getDropSpeed() for consistent speed calculation
      const dropInterval = levelSystem ? levelSystem.getDropSpeed(get().level) : 1000;

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
    const { gameLoopInterval, readyGoTimer } = get();

    if (gameLoopInterval) {
      cancelAnimationFrame(gameLoopInterval);
    }
    if (readyGoTimer) {
      clearTimeout(readyGoTimer);
    }

    get().updateHighScore();
    get().addScoreRecord();

    set({
      status: 'gameover',
      gameLoopInterval: null,
      lockDelayTimer: null,
      lockDelayResets: 0,
      lastFrameTime: 0,
      dropAccumulator: 0,
      readyGoPhase: null,
      readyGoTimer: null,
      clearAnimationActive: false,
      clearAnimationRows: [],
    });
  },

  resetGame: () => {
    get().clearLockDelay();
    const { gameLoopInterval, readyGoTimer } = get();

    if (gameLoopInterval) {
      cancelAnimationFrame(gameLoopInterval);
    }
    if (readyGoTimer) {
      clearTimeout(readyGoTimer);
    }

    set({
      status: 'idle',
      grid: createInitialGrid(),
      currentPiece: null,
      nextPieces: [],
      holdPiece: null,
      ghostPiece: null,
      canHold: true,
      score: 0,
      level: 1,
      lines: 0,
      combo: -1,
      b2b: false,
      tSpin: false,
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
      clearAnimationActive: false,
      clearAnimationRows: [],
      readyGoPhase: null,
      readyGoTimer: null,
      gameStats: createDefaultGameStats(),
    });
  },

  lockPiece: () => {
    get().clearLockDelay();
    set({ lockDelayResets: 0 });
    const { currentPiece, nextPieces, gridSystem, lineClearSystem, status, clearAnimationActive } = get();
    if (!currentPiece || !gridSystem || nextPieces.length === 0 || !lineClearSystem) {
      return;
    }

    // Don't lock if clear animation is active
    if (clearAnimationActive) {
      return;
    }

    gridSystem.lockPiece(currentPiece);

    const boardData = gridSystem.getCells();
    const pendingRows = lineClearSystem.findCompleteRows();
    const clearedCellTypes = pendingRows.map(row => boardData[row].map(cell => cell?.type ?? null));
    const lineClearResult = lineClearSystem.checkAndClear();

    if (lineClearResult && lineClearResult.linesCleared > 0) {
      const { combo, level, gameStats, b2b } = get();
      const points = lineClearResult.score * level;

      get().addScore(points);
      get().addLines(lineClearResult.linesCleared);
      get().incrementCombo();
      get().setB2B(lineClearResult.backToBack);

      // Track statistics
      const newStats = { ...gameStats };
      if (lineClearResult.linesCleared === 4) {
        newStats.tetrisCount++;
      }
      if (lineClearResult.tSpin) {
        newStats.tSpinCount++;
      }
      const currentCombo = combo + 1;
      if (currentCombo > newStats.maxCombo) {
        newStats.maxCombo = currentCombo;
      }
      set({ gameStats: newStats });

      const effects = lineClearSystem.getPendingEffects();
      if (effects.length > 0) {
        set({ clearEffects: effects.map(e => ({ ...e, cellTypes: clearedCellTypes })) });
      }

      get().levelSystem?.addLinesCleared(lineClearResult.linesCleared);
      const newLevel = get().levelSystem?.getLevel();
      if (newLevel !== undefined && newLevel > level) {
        set({ level: newLevel });
      }

      // Build clearLabel from lineClearResult
      const labelParts: string[] = [];
      if (lineClearResult.tSpin) {
        labelParts.push('T-Spin');
      }
      if (lineClearResult.linesCleared === 4) {
        labelParts.push('Tetris!');
      } else if (lineClearResult.linesCleared === 3) {
        labelParts.push('Triple');
      } else if (lineClearResult.linesCleared === 2) {
        labelParts.push('Double');
      } else if (lineClearResult.linesCleared === 1 && !lineClearResult.tSpin) {
        labelParts.push('Single');
      }
      if (lineClearResult.backToBack) {
        labelParts.push('B2B');
      }
      if (currentCombo > 0) {
        labelParts.push(`${currentCombo} Combo`);
      }
      const clearLabel = labelParts.join(' · ');

      // Set clear animation state, delay actual row removal
      set({
        clearAnimationActive: true,
        clearAnimationRows: pendingRows,
        clearLabel,
      });

      // Auto-clear the label after 1.5 seconds
      setTimeout(() => {
        if (get().clearLabel === clearLabel) {
          set({ clearLabel: '' });
        }
      }, 1500);

      setTimeout(() => {
        const { gridSystem: gs } = get();
        if (gs) {
          set({
            grid: gs.getCells(),
            clearAnimationActive: false,
            clearAnimationRows: [],
          });
        }
      }, CLEAR_ANIMATION_MS);
    } else {
      get().resetCombo();
    }

    // Advance next queue: take from front, append new piece at end
    const nextPiece = nextPieces[0];
    const remainingNext = nextPieces.slice(1);

    // Check game over: can the next piece spawn?
    const testPiece: Tetromino = {
      ...nextPiece,
      y: 0,
    };
    if (gridSystem.checkCollision(testPiece)) {
      get().gameOver();
      return;
    }

    // Generate new piece to append to queue
    const newBlock = Block.createRandom();
    const newNextPiece = createTetrominoFromBlock(newBlock);
    const updatedNextPieces = [...remainingNext, newNextPiece];

    const newCurrentPiece: Tetromino = {
      ...nextPiece,
      x: Math.floor((BOARD_WIDTH - Math.max(...nextPiece.shape.map(row => row.length))) / 2),
      y: 0,
    };

    set({
      currentPiece: newCurrentPiece,
      nextPieces: updatedNextPieces,
      grid: gridSystem.getCells(),
      canHold: true,
    });

    get().updateGhost();
  },


  getGhostY: (currentPiece: Tetromino, gridSystem: Grid): number => {
    let ghostY = currentPiece.y;
    while (true) {
      const testPiece: Tetromino = {
        ...currentPiece,
        y: ghostY + 1,
      };
      if (!gridSystem.checkCollision(testPiece)) {
        ghostY++;
      } else {
        break;
      }
    }
    return ghostY;
  },

  updateGhost: () => {
    const { currentPiece, gridSystem } = get();
    if (!currentPiece || !gridSystem) {
      set({ ghostPiece: null });
      return;
    }

    const ghostY = get().getGhostY(currentPiece, gridSystem);

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
    const { currentPiece, gridSystem, gameStats } = get();
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

    set({
      currentPiece: testPiece,
      gameStats: { ...gameStats, totalActions: gameStats.totalActions + 1 },
    });
    get().updateGhost();
    return true;
  },

  moveLeft: () => {
    const { currentPiece, gridSystem, gameStats } = get();
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

    set({
      currentPiece: testPiece,
      gameStats: { ...gameStats, totalActions: gameStats.totalActions + 1 },
    });
    get().updateGhost();
    if (get().isOnGround()) {
      get().resetLockDelay();
    } else {
      get().clearLockDelay();
    }
    return true;
  },

  moveRight: () => {
    const { currentPiece, gridSystem, gameStats } = get();
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

    set({
      currentPiece: testPiece,
      gameStats: { ...gameStats, totalActions: gameStats.totalActions + 1 },
    });
    get().updateGhost();
    if (get().isOnGround()) {
      get().resetLockDelay();
    } else {
      get().clearLockDelay();
    }
    return true;
  },

  rotate: (clockwise: boolean) => {
    const { currentPiece, gridSystem, gameStats } = get();
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
          set({
            currentPiece: testPiece,
            gameStats: { ...gameStats, totalActions: gameStats.totalActions + 1 },
          });
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
    const { currentPiece, gridSystem, gameStats } = get();
    if (!currentPiece || !gridSystem) {
      return 0;
    }

    get().clearLockDelay();

    // Calculate ghost Y directly (same logic as updateGhost)
    let ghostY = currentPiece.y;
    while (true) {
      const testPiece: Tetromino = {
        ...currentPiece,
        y: ghostY + 1,
      };
      if (!gridSystem.checkCollision(testPiece)) {
        ghostY++;
      } else {
        break;
      }
    }

    const dropDistance = ghostY - currentPiece.y;

    // Move piece to ghost position in a single set
    set({
      currentPiece: { ...currentPiece, y: ghostY },
      ghostPiece: { ...currentPiece, y: ghostY },
    });

    get().lockPiece();
    get().addScore(dropDistance * 2);
    set({ gameStats: { ...gameStats, totalActions: gameStats.totalActions + 1 } });
    return dropDistance;
  },

  hold: () => {
    const { currentPiece, holdPiece, holdSystem, canHold, block, nextPieces, gameStats } = get();
    if (!currentPiece || !holdSystem || !canHold || !block) {
      return;
    }

    // Reset rotation and shape to initial state for held piece
    const initialShape = BLOCK_SHAPES[currentPiece.type][0];
    const newHoldPiece: Tetromino = {
      type: currentPiece.type,
      color: currentPiece.color,
      shape: initialShape,
      rotation: 0,
      x: Math.floor((BOARD_WIDTH - Math.max(...initialShape.map(row => row.length))) / 2),
      y: 0,
    };

    let newCurrentPiece: Tetromino | null = null;
    let updatedNextPieces = [...nextPieces];

    if (holdPiece) {
      // Swap with held piece, reset its rotation too
      const holdInitialShape = BLOCK_SHAPES[holdPiece.type][0];
      newCurrentPiece = {
        type: holdPiece.type,
        color: holdPiece.color,
        shape: holdInitialShape,
        rotation: 0,
        x: Math.floor((BOARD_WIDTH - Math.max(...holdInitialShape.map(row => row.length))) / 2),
        y: 0,
      };
    } else {
      // No held piece yet: take from next queue front
      if (updatedNextPieces.length > 0) {
        const nextUp = updatedNextPieces[0];
        const nextInitialShape = BLOCK_SHAPES[nextUp.type][0];
        newCurrentPiece = {
          type: nextUp.type,
          color: nextUp.color,
          shape: nextInitialShape,
          rotation: 0,
          x: Math.floor((BOARD_WIDTH - Math.max(...nextInitialShape.map(row => row.length))) / 2),
          y: 0,
        };
        updatedNextPieces = updatedNextPieces.slice(1);
        // Append new piece to queue
        const newBlock = Block.createRandom();
        updatedNextPieces.push(createTetrominoFromBlock(newBlock));
      }
    }

    if (!newCurrentPiece) {
      return;
    }

    set({
      holdPiece: newHoldPiece,
      currentPiece: newCurrentPiece,
      nextPieces: updatedNextPieces,
      canHold: false,
      gameStats: { ...gameStats, totalActions: gameStats.totalActions + 1 },
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

  setDifficulty: (level: 'easy' | 'normal' | 'hard') => {
    const { levelSystem } = get();
    const speedMultiplier = level === 'easy' ? 1.5 : level === 'hard' ? 0.6 : 1.0;
    if (levelSystem) {
      levelSystem.setSpeedMultiplier(speedMultiplier);
    }
    set({ difficulty: level });
  },

  setShowGhost: (show: boolean) => set({ showGhost: show }),
  setShowGrid: (show: boolean) => set({ showGrid: show }),

  resetHighScore: () => {
    set({ highScore: 0 });
    localStorage.removeItem('tetris_highScore');
  },

  setDAS: (das: number) => {
    set({ das });
  },

  setARR: (arr: number) => {
    set({ arr });
  },

  consumeEffects: () => {
    const effects = get().clearEffects;
    set({ clearEffects: [] });
    return effects;
  },
}));

export default useGameStore;