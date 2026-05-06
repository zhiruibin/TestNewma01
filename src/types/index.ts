// 游戏核心类型定义

// ==================== 基础类型 ====================

// Optional 工具类型，将属性标记为可选
/** 方块形状类型 */
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/** 方块颜色类型 */
export type BlockColor = string;
// 游戏状态接口定义
/** 坐标位置 */
export interface Position {
    x: number;
    y: number;
// 方块类型枚举，定义 7 种俄罗斯方块形状
}

/** 方块单元格 */
export interface Cell {
    filled: boolean;
    color?: BlockColor;
    type?: TetrominoType;
}

// ==================== 方块相关类型 ====================

/** 方块形状定义 */
export interface TetrominoShape {
    type: TetrominoType;
    rotations: number[][][];
    color: BlockColor;
}

/** 活动方块 */
export interface ActiveBlock {
    type: TetrominoType;
    rotation: number;
    position: Position;
shape: number[][];
}

/** 方块接口 */
export interface Tetromino {
    type: TetrominoType;
    shape: number[][];
    color: BlockColor;
    rotation: number;
    x: number;
    y: number;
}

/** 下一个方块 */
export interface NextBlock {
    type: TetrominoType;
    shape: number[][];
}

/** 暂存方块 */
export interface HoldBlock {
    type: TetrominoType | null;
    shape: number[][] | null;
    canHold: boolean;
}

// ==================== 游戏网格类型 ====================

/** 游戏网格 */
export type Grid = Cell[][];

/** 网格尺寸 */
export interface GridSize {
    width: number;
    height: number;
}

// ==================== 游戏状态类型 ====================

/** 游戏阶段 */
export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover';

/** 游戏状态 */
export interface GameState {
    phase: GamePhase;
    grid: Grid;
    activeBlock: ActiveBlock | null;
    nextBlocks: NextBlock[];
    holdBlock: HoldBlock;
    score: number;
    level: number;
    lines: number;
    combo: number;
    tSpin: boolean;
    lastClear: number;
    isHardDropping: boolean;
}

// ==================== 计分相关类型 ====================

/** 消除类型 */
export type ClearType = 'single' | 'double' | 'triple' | 'tetris' | 'tSpinMini' | 'tSpin' | 'tSpinTriple';

/** 计分事件 */
export interface ScoreEvent {
    type: ClearType;
    lines: number;
    baseScore: number;
    levelMultiplier: number;
    comboBonus: number;
    totalScore: number;
}

/** 计分统计 */
export interface ScoreStats {
    totalScore: number;
    totalLines: number;
    totalTetris: number;
    totalTSpin: number;
    maxCombo: number;
    averageScorePerLine: number;
}

// ==================== 等级与速度类型 ====================

/** 等级配置 */
export interface LevelConfig {
    level: number;
    linesRequired: number;
    dropSpeed: number;
    lockDelay: number;
}

/** 速度设置 */
export interface SpeedSettings {
    softDrop: number;
    hardDrop: number;
    das: number; // Delayed Auto Shift
    arr: number; // Auto Repeat Rate
    lockDelay: number;
}

// ==================== 输入相关类型 ====================

/** 输入动作 */
export type InputAction = 
    | 'moveLeft'
    | 'moveRight'
    | 'softDrop'
    | 'hardDrop'
    | 'rotateCW'
    | 'rotateCCW'
    | 'hold'
    | 'pause'
    | 'restart';

/** 按键映射 */
export interface KeyMapping {
    moveLeft: string[];
    moveRight: string[];
    softDrop: string[];
    hardDrop: string[];
    rotateCW: string[];
    rotateCCW: string[];
    hold: string[];
    pause: string[];
}

/** 输入事件 */
export interface InputEvent {
    action: InputAction;
    timestamp: number;
    isRepeat: boolean;
}

// ==================== 音频相关类型 ====================

/** 音效类型 */
export type SoundEffect = 
    | 'move'
    | 'rotate'
    | 'softDrop'
    | 'hardDrop'
    | 'hold'
    | 'clear'
    | 'tetris'
    | 'tSpin'
    | 'combo'
    | 'levelUp'
    | 'gameOver';

/** 音频配置 */
export interface AudioConfig {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    enabled: boolean;
}

// ==================== 设置相关类型 ====================

/** 游戏设置 */
export interface GameSettings {
    gridSize: GridSize;
    speedSettings: SpeedSettings;
    keyMapping: KeyMapping;
    audioConfig: AudioConfig;
    showGhost: boolean;
    showNextCount: number;
    theme: 'light' | 'dark' | 'auto';
    language: 'zh' | 'en';
}

/** 用户设置 */
export interface UserSettings {
    gameSettings: GameSettings;
    windowSize: {
        width: number;
        height: number;
    };
    fullscreen: boolean;
}

// ==================== 事件相关类型 ====================

/** 游戏事件类型 */
export type GameEventType = 
    | 'GAME_START'
    | 'GAME_PAUSE'
    | 'GAME_RESUME'
    | 'GAME_OVER'
    | 'BLOCK_MOVE'
    | 'BLOCK_ROTATE'
    | 'BLOCK_DROP'
    | 'BLOCK_HOLD'
    | 'LINE_CLEAR'
    | 'LEVEL_UP'
    | 'SCORE_UPDATE';

/** 游戏事件 */
export interface GameEvent {
    type: GameEventType;
    payload?: Record;
    timestamp: number;
}

/** 事件监听器 */
export type EventListener = (event: GameEvent) => void;

// ==================== 存储相关类型 ====================

/** 本地存储数据结构 */
export interface StorageData {
    userSettings: UserSettings;
    highScores: HighScore[];
    statistics: GameStatistics;
    unlockedAchievements: string[];
}

/** 高分记录 */
export interface HighScore {
    score: number;
    lines: number;
    level: number;
    date: string;
    playerId?: string;
}

/** 游戏统计 */
export interface GameStatistics {
    totalGames: number;
    totalWins: number;
    totalLines: number;
    totalTetris: number;
    totalTimePlayed: number;
    bestScore: number;
    bestLines: number;
    averageScore: number;
}

// ==================== 成就相关类型 ====================

/** 成就类型 */
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: (stats: GameStatistics) => boolean;
    unlocked: boolean;
    unlockedDate?: string;
}

/** 成就类别 */
export type AchievementCategory = 'score' | 'lines' | 'combo' | 'tspin' | 'time' | 'special';

// ==================== 渲染相关类型 ====================

/** 渲染配置 */
export interface RenderConfig {
    cellSize: number;
    gridColor: string;
    gridLineColor: string;
    backgroundColor: string;
    ghostAlpha: number;
    animationDuration: number;
}

/** 动画状态 */
export interface AnimationState {
    isAnimating: boolean;
    animationType: 'clear' | 'drop' | 'rotate' | 'none';
    progress: number;
    targetCells: Position[];
}

// ==================== 多人游戏相关类型 ====================

/** 玩家状态 */
export interface PlayerState {
    id: string;
    name: string;
    score: number;
    lines: number;
    level: number;
    isAlive: boolean;
    avatar?: string;
}

/** 多人游戏房间 */
export interface GameRoom {
    id: string;
    name: string;
    players: PlayerState[];
    maxPlayers: number;
    isPrivate: boolean;
    status: 'waiting' | 'playing' | 'finished';
}

/** 攻击事件 */
export interface AttackEvent {
    fromPlayerId: string;
    toPlayerId: string;
    lines: number;
    type: 'garbage' | 'combo' | 'tSpin' | 'tetris';
}

// ==================== 工具类型 ====================

/** 可选属性 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** 只读属性 */
export type Readonly = {
    readonly [K in keyof T]: T[K];
};

/** 深度只读 */
export type DeepReadonly = {
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly : T[K];
};

/** 记录类型 */
export type RecordType = Record;

/** 数组工具类型 */
export type ArrayElement = T extends (infer U)[] ? U : never;

// ==================== 常量类型 ====================

/** 标准网格尺寸 */
export const STANDARD_GRID_WIDTH = 10;
export const STANDARD_GRID_HEIGHT = 20;

/** 方块类型数组 */
export const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/** 最大等级 */
export const MAX_LEVEL = 15;

/** 初始速度 (毫秒/格) */
export const INITIAL_DROP_SPEED = 1000;

/** 最小速度 */
export const MIN_DROP_SPEED = 50;