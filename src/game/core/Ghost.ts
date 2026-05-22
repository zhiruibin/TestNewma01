// @ts-nocheck
// 导入游戏核心类型定义和工具函数
import { Block } from './Block';
import { Grid } from './Grid';
import { Collision } from './Collision';
import { Position, TetrominoType } from '../../types';

export class Ghost {
  private grid: Grid;
  private collision: Collision;

  constructor(grid: Grid, collision: Collision) {  // 初始化 Ghost 实例，设置初始位置和状态
    this.grid = grid;
    this.collision = collision;
  }

  // 计算 Ghost 的最终下落位置
  /*** 计算幽灵方块的位置（当前方块会落到的位置）
   * @param block 当前方块
   * @returns 幽灵方块的 Y 坐标
   */
  getGhostY(block: Block): number {
    // 更新 Ghost 的位置以匹配当前活动方块
    let ghostY = block.y;

    // 向下移动直到碰撞
    while (!this.collision.checkCollision(block, this.grid, 0, ghostY - block.y + 1)) {
      ghostY++;
    // 渲染 Ghost 到游戏面板，显示半透明预览
    }

    return ghostY;
  }

  // 重置 Ghost 状态，准备下一轮下落
  /*** 获取幽灵方块的所有单元格位置
   * @param block 当前方块
   * @returns 幽灵方块占据的单元格位置数组
   */
  getGhostCells(block: Block): Position[] {
    const ghostY = this.getGhostY(block);
    const cells: Position[] = [];
    const shape = block.getShape();

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          cells.push({ x: block.x + col, y: ghostY + row });
        }
      }
    }

    return cells;
  }

  /*** 重置幽灵方块
   */
  reset(): void {
    // 幽灵方块不需要特殊重置逻辑
  }
}