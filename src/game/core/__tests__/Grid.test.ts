import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from '../Grid';
import { BLOCK_COLORS } from '../Block';
import type { Tetromino, TetrominoType } from '../../types';

function createTetromino(
  type: TetrominoType,
  shape: number[][],
  x = 0,
  y = 0,
  rotation = 0,
): Tetromino {
  return {
    type,
    shape,
    x,
    y,
    rotation,
    color: BLOCK_COLORS[type],
  };
}

function fillRow(grid: Grid, row: number): void {
  for (let col = 0; col < 10; col++) {
    const piece = createTetromino('I', [[1]], col, row);
    grid.lockPiece(piece);
  }
}

describe('Grid', () => {
  let grid: Grid;

  beforeEach(() => {
    grid = new Grid(10, 20);
  });

  describe('constructor', () => {
    it('should create a grid with given width and height', () => {
      const cells = grid.getCells();
      expect(cells.length).toBe(20);
      expect(cells[0].length).toBe(10);
    });

    it('should initialize all cells as null', () => {
      const cells = grid.getCells();
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          expect(cells[row][col]).toBeNull();
        }
      }
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty in-bounds cell', () => {
      expect(grid.isEmpty(0, 0)).toBe(true);
      expect(grid.isEmpty(5, 10)).toBe(true);
    });

    it('should return false for out-of-bounds cell', () => {
      expect(grid.isEmpty(-1, 0)).toBe(false);
      expect(grid.isEmpty(0, -1)).toBe(false);
      expect(grid.isEmpty(10, 0)).toBe(false);
      expect(grid.isEmpty(0, 20)).toBe(false);
    });

    it('should return false for occupied cell', () => {
      const tetromino = createTetromino('I', [[1, 1, 1, 1]], 0, 0);
      grid.lockPiece(tetromino);
      expect(grid.isEmpty(0, 0)).toBe(false);
    });
  });

  describe('getCell', () => {
    it('should return null for empty cell', () => {
      expect(grid.getCell(0, 0)).toBeNull();
    });

    it('should return cell for occupied cell', () => {
      const tetromino = createTetromino('I', [[1, 1, 1, 1]], 0, 0);
      grid.lockPiece(tetromino);
      const cell = grid.getCell(0, 0);
      expect(cell).not.toBeNull();
    });
  });

  describe('getCells', () => {
    it('should return a 2D array of cells', () => {
      const cells = grid.getCells();
      expect(Array.isArray(cells)).toBe(true);
      expect(Array.isArray(cells[0])).toBe(true);
    });

    it('should return null for empty cells', () => {
      const cells = grid.getCells();
      expect(cells[0][0]).toBeNull();
    });
  });

  describe('checkCollision', () => {
    it('should return false for valid placement', () => {
      const tetromino = createTetromino('I', [[1, 1, 1, 1]], 0, 0);
      expect(grid.checkCollision(tetromino)).toBe(false);
    });

    it('should return true for left wall collision', () => {
      const tetromino = createTetromino('I', [[1, 1, 1, 1]], -1, 0);
      expect(grid.checkCollision(tetromino)).toBe(true);
    });

    it('should return true for right wall collision', () => {
      const tetromino = createTetromino('I', [[1, 1, 1, 1]], 7, 0);
      expect(grid.checkCollision(tetromino)).toBe(true);
    });

    it('should return true for bottom collision', () => {
      const tetromino = createTetromino('I', [[1, 1, 1, 1]], 0, 20);
      expect(grid.checkCollision(tetromino)).toBe(true);
    });

    it('should return true for collision with locked piece', () => {
      const piece1 = createTetromino('I', [[1, 1, 1, 1]], 0, 0);
      grid.lockPiece(piece1);
      const piece2 = createTetromino('I', [[1, 1, 1, 1]], 0, 0);
      expect(grid.checkCollision(piece2)).toBe(true);
    });

    it('should not collide for shape cells that are 0', () => {
      const tetromino = createTetromino('O', [
        [1, 1],
        [1, 1],
      ], 8, 18);
      expect(grid.checkCollision(tetromino)).toBe(false);
    });
  });

  describe('lockPiece', () => {
    it('should place the piece on the grid', () => {
      const tetromino = createTetromino('I', [[1, 1, 1, 1]], 0, 0);
      grid.lockPiece(tetromino);
      // getCell(x, y) — x is column, y is row
      expect(grid.getCell(0, 0)).not.toBeNull();
      expect(grid.getCell(1, 0)).not.toBeNull();
      expect(grid.getCell(2, 0)).not.toBeNull();
      expect(grid.getCell(3, 0)).not.toBeNull();
    });

    it('should fill multiple rows', () => {
      // Use 1x1 blocks to fill row 0 completely (10 columns)
      for (let col = 0; col < 10; col++) {
        const piece = createTetromino('I', [[1]], col, 0);
        grid.lockPiece(piece);
      }
      for (let col = 0; col < 10; col++) {
        expect(grid.getCell(col, 0)).not.toBeNull();
      }
    });
  });

  describe('clearLines', () => {
    it('should return 0 when no lines are full', () => {
      const tetromino = createTetromino('I', [[1, 1, 1, 1]], 0, 0);
      grid.lockPiece(tetromino);
      expect(grid.clearLines()).toBe(0);
    });

    it('should return 1 when one line is full', () => {
      fillRow(grid, 0);
      expect(grid.clearLines()).toBe(1);
    });

    it('should return 2 when two lines are full', () => {
      fillRow(grid, 0);
      fillRow(grid, 1);
      expect(grid.clearLines()).toBe(2);
    });

    it('should clear full lines and shift down', () => {
      fillRow(grid, 0);

      const cleared = grid.clearLines();
      expect(cleared).toBe(1);

      // After clearing, the row should be empty
      for (let col = 0; col < 10; col++) {
        expect(grid.getCell(col, 0)).toBeNull();
      }
    });
  });

  describe('getGhostY', () => {
    it('should return the lowest y without collision', () => {
      const tetromino = createTetromino('I', [[1, 1, 1, 1]], 0, 0);
      const ghostY = grid.getGhostY(tetromino, tetromino.x, tetromino.y);
      // I-piece is 1 row tall, grid height is 20, so it can go to y=19
      expect(ghostY).toBe(19);
    });

    it('should stop above a locked piece', () => {
      const piece1 = createTetromino('I', [[1, 1, 1, 1]], 0, 10);
      grid.lockPiece(piece1);

      const piece2 = createTetromino('I', [[1, 1, 1, 1]], 0, 0);
      const ghostY = grid.getGhostY(piece2, piece2.x, piece2.y);
      expect(ghostY).toBe(9);
    });

    it('should handle O-piece correctly', () => {
      const tetromino = createTetromino(
        'O',
        [
          [1, 1],
          [1, 1],
        ],
        0,
        0,
      );
      const ghostY = grid.getGhostY(tetromino, tetromino.x, tetromino.y);
      // O-piece is 2 rows tall, grid height is 20, so it can go to y=18
      expect(ghostY).toBe(18);
    });
  });

  describe('reset', () => {
    it('should clear all cells', () => {
      const tetromino = createTetromino('I', [[1, 1, 1, 1]], 0, 0);
      grid.lockPiece(tetromino);
      grid.reset();

      const cells = grid.getCells();
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          expect(cells[row][col]).toBeNull();
        }
      }
    });
  });
});