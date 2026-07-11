// 导入必要的类型定义和工具函数
import { Grid } from './Grid';
import { TetrominoType } from '../../types';
import { ScoreSystem } from './Score';
// LineClear 类，负责处理游戏行消除逻辑
/** 消除行信息
 */
export interface ClearLineInfo {
  rowIndex: number;
  isTSpin: boolean;
  isMini: boolean;
}

/** 消除特效数据
 */
/** 消除结果
 */
export interface ClearResult {
  linesCleared: number;
  score: number;
  isTSpin: boolean;
  isMini: boolean;
  combo: number;
  backToBack: boolean;
  rows: number[];
}

/** 消除特效数据
 */
export interface ClearEffect {
  type: 'line' | 'tetris' | 'combo' | 'tspin' | 'backToBack';
  rows: number[];
  intensity: number;
  duration: number;
  isBackToBack?: boolean;
  combo?: number;
}

/** T-Spin 检测所需的方块数据接口 */
export interface TSpinDetectable {
  type: string;
  x: number;
  y: number;
  wasLastMoveRotation?: boolean;
}
export class LineClear {
  private grid: Grid;
  private scoreSystem?: ScoreSystem;
  private combo: number = 0;
  private backToBack: boolean = false;
  private lastClearWasDifficult: boolean = false;
  private pendingEffects: ClearEffect[] = [];
  private pendingClearRows: number[] = [];

  constructor(grid: Grid, scoreSystem?: ScoreSystem) {
    this.grid = grid;
    this.scoreSystem = scoreSystem;
  }

  /** 检测满行、计分、添加特效，但不执行消除
   * 用于延迟消除场景：先获取消除结果和特效，稍后再调用 executeClear
   * @param currentBlock 当前方块（用于 T-Spin 检测）
   * @returns 消除结果，如果没有消除则返回 null
   */
  public detect(currentBlock?: TSpinDetectable): ClearResult | null {
    const completeRows = this.findCompleteRows();

    if (completeRows.length === 0) {
      this.combo = 0;
      return null;
    }

    // 检测 T-Spin
    const tSpinInfo = currentBlock ? this.detectTSpin(currentBlock, completeRows) : null;

    // 计算消除
    const linesCleared = completeRows.length;
    const isTetris = linesCleared === 4;
    const isTSpin = tSpinInfo?.isTSpin ?? false;
    const isMini = tSpinInfo?.isMini ?? false;

    // 更新 Back-to-Back 状态：Tetris 和 T-Spin 均为困难消除，连续困难消除维持 B2B
    const isDifficult = isTetris || isTSpin;
    this.backToBack = isDifficult && this.lastClearWasDifficult;
    this.lastClearWasDifficult = isDifficult;

    // 更新 Combo
    if (this.combo > 0) {
      this.combo++;
    } else {
      this.combo = 1;
    }

    // 缓存待消除行，等待 executeClear 调用
    this.pendingClearRows = completeRows;

    // 计算分数：优先使用 ScoreSystem，否则回退到内联计算
    let score: number;
    if (this.scoreSystem) {
      score = this.scoreSystem.addLineClear(linesCleared, isTSpin, isMini, this.backToBack)
           + this.scoreSystem.addCombo(this.combo);
    } else {
      // 向后兼容的内联计算
      let baseScore = 0;
      switch (linesCleared) {
        case 1: baseScore = 100; break;
        case 2: baseScore = 300; break;
        case 3: baseScore = 500; break;
        case 4: baseScore = 800; break;
      }
      if (isTSpin) {
        switch (linesCleared) {
          case 0: baseScore = 400; break;
          case 1: baseScore = 800; break;
          case 2: baseScore = 1200; break;
          case 3: baseScore = 1600; break;
        }
        if (isMini) {
          baseScore = Math.floor(baseScore / 2);
        }
      }
      if (this.backToBack && (linesCleared === 4 || isTSpin)) {
        baseScore = Math.floor(baseScore * 1.5);
      }
      if (this.combo > 0) {
        baseScore += 50 * this.combo;
      }
      score = baseScore;
    }

    // 添加特效
    this.addEffects(linesCleared, isTSpin, isMini, completeRows);

    return {
      linesCleared,
      score,
      isTSpin,
      isMini,
      combo: this.combo,
      backToBack: this.backToBack,
      rows: completeRows,
    };
  }

  /** 执行实际的行消除（在动画结束后调用）
   * 消除 detect() 缓存的待消除行
   */
  public executeClear(): void {
    if (this.pendingClearRows.length > 0) {
      this.clearRows(this.pendingClearRows);
      this.pendingClearRows = [];
    }
  }

  /** 检测并消除完整行（向后兼容包装）
   * 等价于 detect() + executeClear()，一次性完成检测、计分、消除
   * @param currentBlock 当前方块（用于 T-Spin 检测）
   * @returns 消除结果，如果没有消除则返回 null
   */
  public checkAndClear(currentBlock?: TSpinDetectable): ClearResult | null {
    const result = this.detect(currentBlock);
    if (result !== null) {
      this.executeClear();
    }
    return result;
  }

  /** 检测满行并计算分数，但不执行消除
   * 用于延迟消除场景：先获取消除结果和特效，稍后再调用 clearRows
   * @param currentBlock 当前方块（用于 T-Spin 检测）
   * @returns 消除结果，如果没有消除则返回 null
   */
  public detectAndScore(currentBlock?: TSpinDetectable): ClearResult | null {
    const completeRows = this.findCompleteRows();

    if (completeRows.length === 0) {
      this.combo = 0;
      return null;
    }

    // 检测 T-Spin
    const tSpinInfo = currentBlock ? this.detectTSpin(currentBlock, completeRows) : null;

    // 计算消除
    const linesCleared = completeRows.length;
    const isTetris = linesCleared === 4;
    const isTSpin = tSpinInfo?.isTSpin ?? false;
    const isMini = tSpinInfo?.isMini ?? false;

    // 更新 Back-to-Back 状态：Tetris 和 T-Spin 均为困难消除，连续困难消除维持 B2B
    const isDifficult = isTetris || isTSpin;
    this.backToBack = isDifficult && this.lastClearWasDifficult;
    this.lastClearWasDifficult = isDifficult;

    // 更新 Combo
    if (this.combo > 0) {
      this.combo++;
    } else {
      this.combo = 1;
    }

    // 注意：不调用 this.clearRows()，由调用方在适当时机消除

    // 计算分数：优先使用 ScoreSystem，否则回退到内联计算
    let score: number;
    if (this.scoreSystem) {
      score = this.scoreSystem.addLineClear(linesCleared, isTSpin, isMini, this.backToBack)
           + this.scoreSystem.addCombo(this.combo);
    } else {
      // 向后兼容的内联计算
      let baseScore = 0;
      switch (linesCleared) {
        case 1: baseScore = 100; break;
        case 2: baseScore = 300; break;
        case 3: baseScore = 500; break;
        case 4: baseScore = 800; break;
      }
      if (isTSpin) {
        switch (linesCleared) {
          case 0: baseScore = 400; break;
          case 1: baseScore = 800; break;
          case 2: baseScore = 1200; break;
          case 3: baseScore = 1600; break;
        }
        if (isMini) {
          baseScore = Math.floor(baseScore / 2);
        }
      }
      if (this.backToBack && (linesCleared === 4 || isTSpin)) {
        baseScore = Math.floor(baseScore * 1.5);
      }
      if (this.combo > 0) {
        baseScore += 50 * this.combo;
      }
      score = baseScore;
    }

    // 添加特效
    this.addEffects(linesCleared, isTSpin, isMini, completeRows);

    return {
      linesCleared,
      score,
      isTSpin,
      isMini,
      combo: this.combo,
      backToBack: this.backToBack,
      rows: completeRows,
    };

  }

  /** 查找所有完整的行 */
  public findCompleteRows(): number[] {
    const completeRows: number[] = [];
    const height = this.grid.getHeight();

    for (let y = 0; y < height; y++) {
      if (this.grid.isLineComplete(y)) {
        completeRows.push(y);
      }
    }

    return completeRows;
  }
  /** 消除指定的行
   * @param rows 要消除的行索引数组
   */
  public clearRows(rows: number[]): void {
    // 直接调用 Grid 的 clearLines 方法，由 Grid 处理消除和下落
    this.grid.clearLines(rows);
  }

   /** 检查一行是否为空
   * @param row 行数据
   * @returns 是否为空
   */
  private isRowEmpty(row: (string | null)[]): boolean {
    return row.every((cell) => cell === null);
  }

  /**
   * 检测 T-Spin
   * @param block 当前方块
   * @param clearedRows 已消除的行
   * @returns T-Spin 信息
   */
  public detectTSpin(block: TSpinDetectable, clearedRows: number[]): { isTSpin: boolean; isMini: boolean } | null {
    if (block.type !== 'T') {
      return null;
    }

    // T-Spin 需要消除行且最后动作是旋转
    if (clearedRows.length === 0 || !(block.wasLastMoveRotation ?? false)) {
      return null;
    }

    const position = { x: block.x, y: block.y };
    const corners = this.getTCorners(position);
    const filledCorners = corners.filter((corner) => this.isCornerFilled(corner));

    // 标准 T-Spin: 至少 3 个角被填充
    const isTSpin = filledCorners.length >= 3;

    // Mini T-Spin: 2 个角被填充且满足特定条件
    const isMini = filledCorners.length === 2 && this.isMiniTSpin(position, corners);

    return { isTSpin, isMini };
  }

   /** 获取 T 方块的四个角位置
   * @param position 方块位置
   * @returns 角位置数组
   */
  private getTCorners(position: { x: number; y: number }): { x: number; y: number }[] {
    // T 方块 3x3 矩阵的四个角
    return [
      { x: position.x, y: position.y },
      { x: position.x + 2, y: position.y },
      { x: position.x, y: position.y + 2 },
      { x: position.x + 2, y: position.y + 2 },
    ];
  }

   /** 检查角位置是否被填充
   * @param corner 角位置
   * @returns 是否被填充
   */
  private isCornerFilled(corner: { x: number; y: number }): boolean {
    if (corner.x >= this.grid.getWidth() || corner.y >= this.grid.getHeight()) {
      return true; // 边界外视为填充
    }
    const cell = this.grid.getCell(corner.x, corner.y);
    return cell !== null;
  }

  /** 检测 Mini T-Spin
   * @param position 方块位置
   * @param corners 角位置
   * @returns 是否是 Mini T-Spin
   */
  private isMiniTSpin(position: { x: number; y: number }, corners: { x: number; y: number }[]): boolean {
    // Mini T-Spin 检测：检查是否有墙踢导致的情况
    const board = this.grid.getBoard();

    // 检查方块上方是否有空间
    const hasSpaceAbove = position.y > 0 && this.isRowEmpty(board[position.y - 1]);

    // 检查特定角配置
    const cornerPattern = corners.map((c) => this.isCornerFilled(c));

    // Mini T-Spin 的特定模式
    const miniPatterns = [
      [true, true, false, false],
      [true, false, true, false],
      [false, true, false, true],
      [false, false, true, true],
    ];

    return miniPatterns.some((pattern) => pattern.every((val, i) => val === cornerPattern[i]));
  }


  /**
   * 添加消除特效
   * @param lines 消除行数
   * @param isTSpin 是否 T-Spin
   * @param isMini 是否 Mini T-Spin
   * @param rows 消除的行索引
   */
  private addEffects(lines: number, isTSpin: boolean, isMini: boolean, rows: number[]): void {
    // Tetris 特效
    if (lines === 4) {
      this.pendingEffects.push({
        type: 'tetris',
        rows,
        intensity: 1.0,
        duration: 1000,
      });
    } else if (lines > 0) {
      this.pendingEffects.push({
        type: 'line',
        rows,
        intensity: lines / 4,
        duration: 300 + lines * 100,
      });
    }

    // T-Spin 特效
    if (isTSpin) {
      this.pendingEffects.push({
        type: 'tspin',
        rows,
        intensity: isMini ? 0.5 : 1.0,
        duration: 800,
      });
    }

    // Combo 特效
    if (this.combo > 1) {
      this.pendingEffects.push({
        type: 'combo',
        rows,
        intensity: Math.min(this.combo / 10, 1.0),
        duration: 500,
        combo: this.combo,
      });
    }

    // Back-to-Back 特效
    if (this.backToBack) {
      this.pendingEffects.push({
        type: 'backToBack',
        rows,
        intensity: 0.8,
        duration: 600,
        isBackToBack: true,
      });
    }
  }

   /** 获取待处理的特效
   * @returns 特效数组
   */
  public getPendingEffects(): ClearEffect[] {
    const effects = [...this.pendingEffects];
    this.pendingEffects = [];
    return effects;
  }

   /** 获取当前 Combo 数
   * @returns Combo 数
   */
  public getCombo(): number {
    return this.combo;
  }

  /** 获取 Back-to-Back 状态
   * @returns 是否 Back-to-Back
   */
  public isBackToBack(): boolean {
    return this.backToBack;
  }

  /** 重置消除状态
   */
  public reset(): void {
    this.combo = 0;
    this.backToBack = false;
    this.lastClearWasDifficult = false;
    this.pendingEffects = [];
  }

  /** 设置 Combo 数（用于游戏加载）
   * @param combo Combo 数
   */
  public setCombo(combo: number): void {
    this.combo = combo;
  }

  /** 设置 Back-to-Back 状态（用于游戏加载）
   * @param value Back-to-Back 状态
   */
  public setBackToBack(value: boolean): void {
    this.backToBack = value;
  }
}