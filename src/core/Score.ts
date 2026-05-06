/*** 分数系统 - 俄罗斯方块标准计分规则
 ** 实现标准俄罗斯方块计分系统，包括：
 * - 基础分数（根据消除行数）
 * - 连击奖励
 * - Tetris 奖励（一次消除 4 行）
 * - 软降/硬降分数
 */
export class Score {
  private score: number;
  private linesCleared: number;
  private combos: number;
  private level: number;

  // 标准计分表（基础分数 × 等级）
  private static readonly LINE_SCORES = [0, 100, 300, 500, 800];
  private static readonly TETRIS_BONUS = 1200;
  private static readonly COMBO_MULTIPLIER = 50;
  private static readonly SOFT_DROP_POINTS = 1;
  private static readonly HARD_DROP_POINTS = 2;

  constructor() {
    this.score = 0;
    this.linesCleared = 0;
    this.combos = 0;
    this.level = 1;
  }

  /*** 添加消除行数的分数
   * @param lines - 消除的行数 (1-4)
   * @param isTetris - 是否为 Tetris（一次消除 4 行）
   */
  addLinesCleared(lines: number, isTetris: boolean = false): number {
    if (lines <= 0 || lines > 4) {
      return 0;
    }

    let points: number;

    if (isTetris || lines === 4) {
      // Tetris 奖励
      points = Score.TETRIS_BONUS * this.level;
      this.combos++;
    } else {
      // 标准分数
      points = Score.LINE_SCORES[lines] * this.level;
      
      // 连击奖励
      if (this.combos > 0) {
        points += this.combos * Score.COMBO_MULTIPLIER * this.level;
        this.combos++;
      } else {
        this.combos = 1;
      }
    }

    this.score += points;
    this.linesCleared += lines;

    return points;
  }

  /*** 添加软降分数（手动加速下落）
   * @param cells - 下落的格子数
   */
  addSoftDrop(cells: number): number {
    const points = cells * Score.SOFT_DROP_POINTS;
    this.score += points;
    return points;
  }

  /*** 添加硬降分数（瞬间放置）
   * @param cells - 下落的格子数
   */
  addHardDrop(cells: number): number {
    const points = cells * Score.HARD_DROP_POINTS;
    this.score += points;
    return points;
  }

  /*** 重置连击计数（当没有消除行时调用）
   */
  resetCombo(): void {
    this.combos = 0;
  }

  /*** 设置当前等级（影响分数倍率）
   * @param level - 等级 (1-15)
   */
  setLevel(level: number): void {
    this.level = Math.max(1, Math.min(15, level));
  }

  /**
   * 获取当前分数
   */
  getScore(): number {
    return this.score;
  }

  /*** 获取消除的总行数
   */
  getLinesCleared(): number {
    return this.linesCleared;
  }

  /*** 获取当前连击数
   */
  getCombo(): number {
    return this.combos;
  }

  /*** 获取当前等级
   */
  getLevel(): number {
    return this.level;
  }

  /*** 重置所有分数数据
   */
  reset(): void {
    this.score = 0;
    this.linesCleared = 0;
    this.combos = 0;
    this.level = 1;
  }

  /*** 序列化分数数据
   */
  toJSON(): Record<string, number> {
    return {
      score: this.score,
      linesCleared: this.linesCleared,
      combos: this.combos,
      level: this.level,
    };
  }

  /*** 从 JSON 数据恢复分数
   * @param data - 序列化的分数数据
   */
  static fromJSON(data: Record<string, number>): Score {
    const score = new Score();
    score.score = data.score ?? 0;
    score.linesCleared = data.linesCleared ?? 0;
    score.combos = data.combos ?? 0;
    score.level = data.level ?? 1;
    return score;
  }
}