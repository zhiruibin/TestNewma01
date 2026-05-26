// 游戏网格系统核心模块，负责方块碰撞检测和锁定逻辑
import { Tetromino, Cell } from '../../types';

export class Grid {
  private width: number;
  private height: number;
  private cells: (Cell | null)[][];

  constructor(width: number = 10, height: number = 20) {
    this.width = width;
    this.height = height;
    this.cells = this.createEmptyGrid();
  }

  private createEmptyGrid(): (Cell | null)[][] {
    // Grid 类，管理游戏板的网格状态和碰撞检测
    return Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => null)
    );
  }

public reset(): void {
    this.cells = this.createEmptyGrid();
  }

  public clear(): void {
    this.cells = this.createEmptyGrid();
  }

public lockPiece(tetromino: Tetromino): void {
    const shape = tetromino.shape;
    const offsetX = tetromino.x;
    const offsetY = tetromino.y;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = offsetX + x;
          const boardY = offsetY + y;
          if (boardY >= 0 && boardY < this.height && boardX >= 0 && boardX < this.width) {
            this.cells[boardY][boardX] = {
              filled: true,
              color: tetromino.color,
              type: tetromino.type
            };
          }
        }
      }
    }
  }

  public getWidth(): number {  // 参数 piece 包含方块的形状、位置和旋转状态
    return this.width;
  }

  public getHeight(): number {
    // 遍历方块形状的每个单元格进行碰撞检测
    return this.height;
  }

public getCells(): (Cell | null)[][] {
    return this.cells.map(row => row.map(cell => cell ? { ...cell } : null));
  }

  public getGrid(): number[][] {
    return this.cells.map(row =>
      row.map(cell => cell ? 1 : 0)
    // 检查是否超出左右边界
    );
  }

  public getCell(x: number, y: number): Cell | null {
    if (this.isValidPosition(x, y)) {
      // 检查是否超出底部边界
      return this.cells[y][x];
    }
    return null;
  }

public isValidPosition(x: number, y: number): boolean {
    // y=-1 is the spawn position, should be considered valid (no collision)
    return x >= 0 && x < this.width && y >= -1 && y < this.height;
  }

public clearLines(rows?: number[]): number {
    // 收集需要消除的行索引
    const linesToClear = rows ?? [];
    if (linesToClear.length === 0) {
      for (let y = 0; y < this.height; y++) {
        if (this.isLineComplete(y)) {
          linesToClear.push(y);
        }
      }
    }

    if (linesToClear.length === 0) return 0;

    // 用 filter 一步过滤掉所有需消除的行，再在顶部补空行
    const clearSet = new Set(linesToClear);
    const remaining = this.cells.filter((_, idx) => !clearSet.has(idx));
    const emptyRows = Array.from({ length: linesToClear.length }, () =>
      Array.from({ length: this.width }, () => null)
    );
    this.cells = [...emptyRows, ...remaining];

    return linesToClear.length;
  }
  public isLineComplete(y: number): boolean {
    for (let x = 0; x < this.width; x++) {
      const cell = this.cells[y][x];
      if (cell === null || !cell.filled) {
        return false;
      }
    }
    return true;
  }


  public isEmpty(x: number, y: number): boolean {
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
      return false;
    }
    return this.cells[y][x] === null;
  }
public checkCollision(tetromino: Tetromino): boolean {
    const shape = tetromino.shape;
    const offsetX = tetromino.x;
    const offsetY = tetromino.y;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = offsetX + x;
          const boardY = offsetY + y;

          // Check bounds
          if (!this.isValidPosition(boardX, boardY)) {
            return true;
          }

          // Check if cell is already occupied
          if (!this.isEmpty(boardX, boardY)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  public getGhostY(tetromino: Tetromino, startX: number, startY: number): number {
    let ghostY = startY;

while (!this.checkCollision({ ...tetromino, x: startX, y: ghostY + 1 })) {
      ghostY++;
    }

    return ghostY;
  }

public isGameOver(tetromino: Tetromino): boolean {
    // Create test piece at spawn position to check for game over
    const testPiece: Tetromino = {
      ...tetromino,
      x: Math.floor(this.width / 2) - 2,
      y: 0
    };
    return this.checkCollision(testPiece);
  }

  public getFilledCellsCount(): number {
    let count = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.cells[y][x] !== null && this.cells[y][x].filled) {
          count++;
        }
      }
    }
    return count;
  }

  public copy(): Grid {
    const newGrid = new Grid(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.cells[y][x];
        if (cell !== null) {
          newGrid.cells[y][x] = { ...cell };
        }
      }
    }
    return newGrid;
  }

  public clearRow(y: number): void {
    // 将上方行向下移动填补空缺
    for (let row = y; row > 0; row--) {
      this.cells[row] = this.cells[row - 1].map(cell => cell ? { ...cell } : null);
    }
  }

  public getBoard(): (string | null)[][] {
    return this.cells.map(row =>
      row.map(cell => cell ? cell.type : null)
    );
  }

  public setBoard(board: (string | null)[][]): void {
    for (let y = 0; y < this.height && y < board.length; y++) {
      for (let x = 0; x < this.width && x < board[y].length; x++) {
        const cellValue = board[y][x];
        if (cellValue !== null) {
          this.cells[y][x] = {
            filled: true,
            color: cellValue,
            type: cellValue
          };
        } else {
          this.cells[y][x] = null;
        }
      }
    }
  }

  public createEmptyRow(): (string | null)[] {
    return Array.from({ length: this.width }, () => null);
  }
}