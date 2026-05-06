import { Block, BlockType } from './Block';

/*** 暂存系统 - 管理俄罗斯方块的暂存和交换功能
 ** 功能：
 * - 允许玩家暂存当前方块
 * - 每个方块只能暂存一次（下落期间）
 * - 可以与暂存的方块交换
 */
export class Hold {
  private heldBlock: BlockType | null;
  private canSwap: boolean;

  constructor() {
    this.heldBlock = null;
    this.canSwap = true;
  }

  /*** 获取暂存的方块类型
   */
  getHeldBlock(): BlockType | null {
    return this.heldBlock;
  }

  /*** 检查是否可以交换
   */
  canExchange(): boolean {
    return this.canSwap;
  }

  /**
   * 交换当前方块与暂存方块
   * @param currentBlock 当前方块类型
   * @returns 交换后的方块类型（如果暂存为空则返回 null）
   */
  exchange(currentBlock: BlockType): BlockType | null {
    if (!this.canSwap) {
      return null;
    }

    const previousHeld = this.heldBlock;
    this.heldBlock = currentBlock;
    this.canSwap = false;

    return previousHeld;
  }

  /*** 重置交换状态（当新方块生成时调用）
   */
  resetSwap(): void {
    this.canSwap = true;
  }

  /*** 完全重置暂存系统（新游戏时调用）
   */
  reset(): void {
    this.heldBlock = null;
    this.canSwap = true;
  }

  /**
   * 序列化暂存状态
   */
  serialize(): { heldBlock: BlockType | null; canSwap: boolean } {
    return {
      heldBlock: this.heldBlock,
      canSwap: this.canSwap,
    };
  }

  /*** 从序列化数据恢复暂存状态
   */
  static deserialize(data: { heldBlock: BlockType | null; canSwap: boolean }): Hold {
    const hold = new Hold();
    hold.heldBlock = data.heldBlock;
    hold.canSwap = data.canSwap;
    return hold;
  }
}