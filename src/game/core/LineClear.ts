// 导入必要的类型定义和工具函数
import { Grid } from './Grid';
import { Block } from './Block';
import { TetrominoType } from '../../types';

// LineClear 类，负责处理游戏行消除逻辑
/*** 消除行信息
 */
export interface ClearLineInfo {
  rowIndex: number;
  isTSpin: boolean;
  // 构造函数，初始化行消除器实例
  isMini: boolean;
}

/*** 消除结果
 */
// 检查并消除已满的行
export interface ClearResult {
  linesCleared: number;
  score: number;
  isTSpin: boolean;
  isMini: boolean;
  combo: number;
  backToBack: boolean;
  clearedRows: number[];
}

// 计算消除行数对应的得分
/*** 消除特效数据
 */
export interface ClearEffect {
  type: 'line' | 'tetris' | 'combo' | 'tspin' | 'backToBack';
  rows: number[];
  intensity: number;
  duration: number;
}

/** 消除逻辑与特效管理类
 * 负责检测完整行、消除行、计算分数、触发特效
 */
export class LineClear {
  private grid: Grid;
  private combo: number = 0;
  private backToBack: boolean = false;
  private lastClearWasDifficult: boolean = false;
  private pendingEffects: ClearEffect[] = [];

  // 通知游戏状态更新
  constructor(grid: Grid) {
    this.grid = grid;
  }

  /*** 检测并消除完整行
   * @param currentBlock 当前方块（用于 T-Spin 检测）
   * @returns 消除结果，如果没有消除则返回 null
   */
  public checkAndClear(currentBlock?: Block): ClearResult | null {
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

    // 执行消除
    this.clearRows(completeRows);

    // 计算分数
    const score = this.calculateScore(linesCleared, isTSpin, isMini);

    // 添加特效
    this.addEffects(linesCleared, isTSpin, isMini, completeRows);

    return {
      linesCleared,
      score,
      isTSpin,
      isMini,
      combo: this.combo,
      backToBack: this.backToBack,
      clearedRows: completeRows,
    };
  }

  /*** 查找所有完整的行
   * @returns 完整行的索引数组
   */
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
  /*** 消除指定的行
   * @param rows 要消除的行索引数组
   */
  public clearRows(rows: number[]): void {
    // 直接调用 Grid 的 clearLines 方法，由 Grid 处理消除和下落
    this.grid.clearLines(rows);
  }

  /*** 检查一行是否为空
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
  public detectTSpin(block: Block, clearedRows: number[]): { isTSpin: boolean; isMini: boolean } | null {
    if (block.getType() !== 'T') {
      return null;
    }

    // T-Spin 需要消除行且最后动作是旋转
    if (clearedRows.length === 0 || !block.wasLastMoveRotation()) {
      return null;
    }

    const position = block.getPosition();
    const corners = this.getTCorners(position);
    const filledCorners = corners.filter((corner) => this.isCornerFilled(corner));

    // 标准 T-Spin: 至少 3 个角被填充
    // 标准 T-Spin: 至少 3 个角被填充
    const isTSpin = filledCorners.length >= 3;

    // Mini T-Spin: 2 个角被填充且满足特定条件
    const isMini = filledCorners.length === 2 && this.isMiniTSpin(position, corners);

    return { isTSpin, isMini };
  }

  /*** 获取 T 方块的四个角位置
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

  /*** 检查角位置是否被填充
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

  /*** 检测 Mini T-Spin
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

  /*** 计算消除分数
   * @param lines 消除行数
   * @param isTSpin 是否 T-Spin
   * @param isMini 是否 Mini T-Spin
   * @returns 分数
   */
  private calculateScore(lines: number, isTSpin: boolean, isMini: boolean): number {
    let baseScore = 0;

    // 基础消除分数
    switch (lines) {
      case 1:
        baseScore = 100;
        break;
      case 2:
        baseScore = 300;
        break;
      case 3:
        baseScore = 500;
        break;
      case 4:
        baseScore = 800;
        break;
    }

    // T-Spin 分数
    if (isTSpin) {
      switch (lines) {
        case 0:
          baseScore = 400;
          break;
        case 1:
          baseScore = 800;
          break;
        case 2:
          baseScore = 1200;
          break;
        case 3:
          baseScore = 1600;
          break;
      }

      // Mini T-Spin 分数减半
      if (isMini) {
        baseScore = Math.floor(baseScore / 2);
      }
    }

    // Back-to-Back 加成
    if (this.backToBack && (lines === 4 || isTSpin)) {
      baseScore = Math.floor(baseScore * 1.5);
    }

    // Combo 加成
    if (this.combo > 0) {
      baseScore += 50 * this.combo;
    }

    return baseScore;
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
      });
    }

    // Back-to-Back 特效
    if (this.backToBack) {
      this.pendingEffects.push({
        type: 'backToBack',
        rows,
        intensity: 0.8,
        duration: 600,
      });
    }
  }

  /*** 获取待处理的特效
   * @returns 特效数组
   */
  public getPendingEffects(): ClearEffect[] {
    const effects = [...this.pendingEffects];
    this.pendingEffects = [];
    return effects;
  }

  /*** 获取当前 Combo 数
   * @returns Combo 数
   */
  public getCombo(): number {
    return this.combo;
  }

  /*** 获取 Back-to-Back 状态
   * @returns 是否 Back-to-Back
   */
  public isBackToBack(): boolean {
    return this.backToBack;
  }

  /*** 重置消除状态
   */
  public reset(): void {
    this.combo = 0;
    this.backToBack = false;
    this.lastClearWasDifficult = false;
    this.pendingEffects = [];
  }

  /*** 设置 Combo 数（用于游戏加载）
   * @param combo Combo 数
   */
  public setCombo(combo: number): void {
    this.combo = combo;
  }

  /*** 设置 Back-to-Back 状态（用于游戏加载）
   * @param value Back-to-Back 状态
   */
  public setBackToBack(value: boolean): void {
    this.backToBack = value;
  }
}