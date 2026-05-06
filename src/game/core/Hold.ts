import { Tetromino, TetrominoType } from '../../types';

export class Hold {
  private heldPiece: TetrominoType | null = null;
  private canHold: boolean = true;

  /*** 获取当前暂存的方块类型
   */
  getHeldPiece(): TetrominoType | null {
    return this.heldPiece;
  }

  /*** 检查是否可以暂存方块
   */
  canHoldPiece(): boolean {
    return this.canHold;
  }

  /*** 暂存当前方块并返回之前暂存的方块（如果有）
   * @param currentPiece 当前方块类型
   * @returns 之前暂存的方块类型，如果没有则返回 null
   */
  hold(currentPiece: TetrominoType): TetrominoType | null {
    if (!this.canHold) {
      return null;
    }

    const previousHeld = this.heldPiece;
    this.heldPiece = currentPiece;
    this.canHold = false;

    return previousHeld;
  }

  /*** 重置暂存状态（新回合开始时调用）
   */
  reset(): void {
    this.canHold = true;
  }

  /*** 完全重置暂存器（新游戏开始时调用）
   */
  clear(): void {
    this.heldPiece = null;
    this.canHold = true;
  }

  /*** 获取暂存状态（用于序列化/保存）
   */
  getState(): {
    heldPiece: TetrominoType | null;
    canHold: boolean;
  } {
    return {
      heldPiece: this.heldPiece,
      canHold: this.canHold,
    };
  }

  /*** 从状态恢复暂存器
   */
  setState(state: {
    heldPiece: TetrominoType | null;
    canHold: boolean;
  }): void {
    this.heldPiece = state.heldPiece;
    this.canHold = state.canHold;
  }
}