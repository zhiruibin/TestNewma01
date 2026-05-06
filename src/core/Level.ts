/*** 等级系统
 * 管理俄罗斯方块游戏的难度递增和下落速度
 */

export class Level {
  private currentLevel: number;
  private linesCleared: number;
  private linesPerLevel: number;

  constructor() {
    this.currentLevel = 1;
    this.linesCleared = 0;
    this.linesPerLevel = 10;
  }

  /*** 获取当前等级
   */
  getLevel(): number {
    return this.currentLevel;
  }

  /*** 获取当前等级的下落速度（毫秒）
   * 等级越高，速度越快（间隔时间越短）
   */
  getDropSpeed(): number {
    // 基础速度 1000ms，每级减少 50ms，最低 100ms
    const speed = 1000 - (this.currentLevel - 1) * 50;
    return Math.max(speed, 100);
  }

  /*** 获取当前等级已消除的行数
   */
  getLinesCleared(): number {
    return this.linesCleared;
  }

  /*** 获取升级到下一级还需要消除的行数
   */
  getLinesToNextLevel(): number {
    const linesInCurrentLevel = this.linesCleared % this.linesPerLevel;
    return this.linesPerLevel - linesInCurrentLevel;
  }

  /*** 添加已消除的行数，并检查是否升级
   * @param lines - 本次消除的行数
   * @returns 是否升级
   */
  addLinesCleared(lines: number): boolean {
    const previousLevel = this.currentLevel;
    this.linesCleared += lines;

    // 计算新等级
    this.currentLevel = Math.floor(this.linesCleared / this.linesPerLevel) + 1;

    // 限制最高等级为 15 级
    if (this.currentLevel > 15) {
      this.currentLevel = 15;
    }

    return this.currentLevel > previousLevel;
  }

  /*** 重置等级系统
   */
  reset(): void {
    this.currentLevel = 1;
    this.linesCleared = 0;
  }

  /*** 获取等级信息对象
   */
  getInfo(): {
    level: number;
    linesCleared: number;
    linesToNextLevel: number;
    dropSpeed: number;
  } {
    return {
      level: this.currentLevel,
      linesCleared: this.linesCleared,
      linesToNextLevel: this.getLinesToNextLevel(),
      dropSpeed: this.getDropSpeed(),
    };
  }
}