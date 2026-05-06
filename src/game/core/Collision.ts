// 碰撞检测模块，处理游戏方块与边界和已放置方块的碰撞判断
import { Block, TetrominoType } from './Block';
import { Grid } from './Grid';
import { Position } from '../../types';

// Collision 类，提供多种碰撞检测方法
/*** 碰撞检测系统
 * 负责检测方块与网格边界、已固定方块的碰撞
 */
export class Collision {
  private grid: Grid;
// 初始化碰撞检测器，设置网格引用
  constructor(grid: Grid) {
    this.grid = grid;
  }

  // 检查方块是否与游戏边界碰撞
  /*** 检查方块在指定位置是否有效（无碰撞）
   * @param block - 要检查的方块
   * @param offsetX - X 轴偏移量
   * @param offsetY - Y 轴偏移量
   * @returns 如果位置有效返回 true，否则返回 false
   */
  isValidPosition(block: Block, offsetX: number = 0, offsetY: number = 0): boolean {
    const shape = block.getShape();
    const blockSize = shape.length;

    // 检查方块是否与已放置的方块碰撞
for (let row = 0; row < blockSize; row++) {
      for (let col = 0; col < blockSize; col++) {
        if (shape[row][col] === 0) {
          continue;
        }

        const x = block.position.x + col + offsetX;
        const y = block.position.y + row + offsetY;

        if (x < 0 || x >= this.grid.width || y < 0 || y >= this.grid.height) {
          return false;
        }

        if (this.grid.isCellOccupied(x, y)) {
          return false;
        }
      }
    }

    return true;
  }

  /*** 检查方块是否可以向左移动
   * @param block - 要检查的方块
   * @returns 如果可以移动返回 true，否则返回 false
   */
  // 检查方块是否可以移动到指定位置
  canMoveLeft(block: Block): boolean {
    return this.isValidPosition(block, -1, 0);
  }

  /*** 检查方块是否可以向右移动
   * @param block - 要检查的方块
   * @returns 如果可以移动返回 true，否则返回 false
   */
  canMoveRight(block: Block): boolean {
    return this.isValidPosition(block, 1, 0);
  // 检查指定位置是否有效（在边界内且无方块）
  }

  /*** 检查方块是否可以向下移动
   * @param block - 要检查的方块
   * @returns 如果可以移动返回 true，否则返回 false
   */
  canMoveDown(block: Block): boolean {
    return this.isValidPosition(block, 0, 1);
  }

  // 获取方块所有单元格的绝对位置
  /*** 检查方块是否可以旋转
   * @param block - 要检查的方块
   * @param rotation - 旋转后的形状
   * @returns 如果可以旋转返回 true，否则返回 false
   */
  canRotate(block: Block, rotation: number[][]): boolean {
    const blockSize = rotation.length;
    const originalShape = block.shape;

    // 临时设置旋转后的形状
    block.shape = rotation;

    // 检查旋转后的位置是否有效
    const isValid = this.isValidPosition(block);

    // 恢复原始形状
    block.shape = originalShape;

    return isValid;
  }

  /*** 检查方块是否可以硬降落（直接落到底部）
   * @param block - 要检查的方块
   * @returns 如果可以硬降落返回 true，否则返回 false
   */
  canHardDrop(block: Block): boolean {
    // 硬降落总是可以的，只需要找到最终位置
    return true;
  }

  /*** 获取方块硬降落后的最终 Y 位置
   * @param block - 方块
   * @returns 最终 Y 坐标
   */
  getHardDropY(block: Block): number {
    let dropY = 0;

    // 持续向下检查直到碰撞
    while (this.isValidPosition(block, 0, dropY + 1)) {
      dropY++;
    }

    return block.position.y + dropY;
  }

  /*** 获取幽灵方块的位置（预测落点）
   * @param block - 当前方块
   * @returns 幽灵方块的位置
   */
  getGhostPosition(block: Block): Position {
    const ghostY = this.getHardDropY(block);

    return {
      x: block.position.x,
      y: ghostY
    };
  }

  /*** 检查方块是否已着陆（无法继续下落）
   * @param block - 要检查的方块
   * @returns 如果已着陆返回 true，否则返回 false
   */
  isLanded(block: Block): boolean {
    return !this.canMoveDown(block);
  }

  /*** 检查是否发生顶部溢出（游戏结束条件）
   * @returns 如果顶部有方块返回 true，否则返回 false
   */
  checkTopOverflow(): boolean {
    // 检查顶部几行是否有已固定的方块
    const overflowRows = 2;

    for (let y = 0; y < overflowRows; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        if (this.grid.isCellOccupied(x, y)) {
          return true;
        }
      }
    }

    return false;
  }

  /*** 检测并返回所有碰撞的单元格位置
   * @param block - 要检查的方块
   * @param offsetX - X 轴偏移量
   * @param offsetY - Y 轴偏移量
   * @returns 碰撞位置数组
   */
  getCollisionPoints(block: Block, offsetX: number = 0, offsetY: number = 0): Position[] {
    const collisions: Position[] = [];
    const shape = block.getShape();
    const blockSize = shape.length;

    for (let row = 0; row < blockSize; row++) {
      for (let col = 0; col < blockSize; col++) {
        if (shape[row][col] === 0) {
          continue;
        }

        const gridX = block.position.x + col + offsetX;
        const gridY = block.position.y + row + offsetY;

        if (!this.isWithinBounds(gridX, gridY) || this.grid.isCellOccupied(gridX, gridY)) {
          collisions.push({ x: gridX, y: gridY });
        }
      }
    }

    return collisions;
  }

  /*** 墙踢检测 - 检查旋转时是否可以通过偏移避免碰撞
   * @param block - 要旋转的方块
   * @param rotation - 旋转后的形状
   * @returns 有效的偏移量，如果无法旋转返回 null
   */
  checkWallKick(block: Block, rotation: number[][]): Position | null {
    // 标准墙踢偏移测试顺序
    const kickTests: Position[] = [
      { x: 0, y: 0 },   // 原始位置
      { x: -1, y: 0 },  // 左移 1 格
      { x: 1, y: 0 },   // 右移 1 格
      { x: -2, y: 0 },  // 左移 2 格
      { x: 2, y: 0 },   // 右移 2 格
      { x: 0, y: -1 },  // 上移 1 格（用于某些特殊情况）
    ];

    const originalShape = block.shape;
    block.shape = rotation;

    for (const kick of kickTests) {
      if (this.isValidPosition(block, kick.x, kick.y)) {
        block.shape = originalShape;
        return kick;
      }
    }

    block.shape = originalShape;
    return null;
  }
}