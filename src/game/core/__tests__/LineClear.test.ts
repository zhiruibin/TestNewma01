import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from '../Grid';
import { LineClear } from '../LineClear';
import { Block, BLOCK_COLORS } from '../Block';
import type { Tetromino } from '../../types';

function makePiece(type: string, x: number, y: number): Tetromino {
  const block = new Block(type as any);
  return {
    type: type as any,
    shape: block.getShape(),
    color: BLOCK_COLORS[type as keyof typeof BLOCK_COLORS],
    rotation: 0,
    x,
    y,
  };
}

function fillRow(grid: Grid, row: number): void {
  const board = grid.getBoard();
  for (let x = 0; x < grid.getWidth(); x++) {
    board[row][x] = { type: 'I', color: BLOCK_COLORS.I };
  }
  grid.setBoard(board);
}

function fillRowExcept(grid: Grid, row: number, exceptX: number): void {
  const board = grid.getBoard();
  for (let x = 0; x < grid.getWidth(); x++) {
    if (x === exceptX) continue;
    board[row][x] = { type: 'I', color: BLOCK_COLORS.I };
  }
  grid.setBoard(board);
}

describe('LineClear', () => {
  let grid: Grid;
  let lineClear: LineClear;

  beforeEach(() => {
    grid = new Grid(10, 20);
    lineClear = new LineClear(grid);
  });

  describe('findCompleteRows', () => {
    it('should detect no rows when grid is empty', () => {
      const rows = lineClear.findCompleteRows();
      expect(rows).toHaveLength(0);
    });

    it('should detect a single complete row', () => {
      fillRow(grid, 19);
      const rows = lineClear.findCompleteRows();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toBe(19);
    });

    it('should detect multiple complete rows', () => {
      fillRow(grid, 18);
      fillRow(grid, 19);
      const rows = lineClear.findCompleteRows();
      expect(rows).toHaveLength(2);
      expect(rows).toContain(18);
      expect(rows).toContain(19);
    });

    it('should not detect incomplete rows', () => {
      fillRowExcept(grid, 19, 5);
      const rows = lineClear.findCompleteRows();
      expect(rows).toHaveLength(0);
    });

    it('should detect rows at specific positions', () => {
      fillRow(grid, 10);
      fillRow(grid, 15);
      const rows = lineClear.findCompleteRows();
      expect(rows).toHaveLength(2);
      expect(rows).toContain(10);
      expect(rows).toContain(15);
    });
  });

  describe('clearRows', () => {
    it('should clear a single row', () => {
      fillRow(grid, 19);
      const rows = lineClear.findCompleteRows();
      lineClear.clearRows(rows);
      expect(grid.getCell(0, 19)).toBeNull();
      expect(grid.getCell(9, 19)).toBeNull();
    });

    it('should clear multiple rows', () => {
      fillRow(grid, 18);
      fillRow(grid, 19);
      const rows = lineClear.findCompleteRows();
      lineClear.clearRows(rows);
      expect(grid.getCell(0, 18)).toBeNull();
      expect(grid.getCell(0, 19)).toBeNull();
      expect(grid.getCell(9, 18)).toBeNull();
      expect(grid.getCell(9, 19)).toBeNull();
    });

    it('should shift rows down after clearing', () => {
      fillRow(grid, 18);
      fillRow(grid, 19);

      const rows = lineClear.findCompleteRows();
      lineClear.clearRows(rows);

      expect(grid.getCell(0, 18)).toBeNull();
      expect(grid.getCell(0, 19)).toBeNull();
    });

    it('should handle clearing when grid is empty', () => {
      lineClear.clearRows([]);
      expect(grid.getCell(0, 0)).toBeNull();
    });

    it('should clear non-adjacent rows', () => {
      fillRow(grid, 10);
      fillRow(grid, 19);

      const rows = lineClear.findCompleteRows();
      lineClear.clearRows(rows);

      expect(grid.getCell(0, 10)).toBeNull();
      expect(grid.getCell(0, 19)).toBeNull();
    });
  });

  describe('checkAndClear integration', () => {
    it('should return null when no rows are complete', () => {
      const result = lineClear.checkAndClear();
      expect(result).toBeNull();
    });

    it('should clear a single row and return result', () => {
      fillRow(grid, 19);
      const result = lineClear.checkAndClear();
      expect(result).not.toBeNull();
      expect(result!.clearedRows).toHaveLength(1);
      expect(result!.clearedRows[0]).toBe(19);
      expect(result!.score).toBe(150);
      expect(grid.getCell(0, 19)).toBeNull();
    });

    it('should clear a double row and return result', () => {
      fillRow(grid, 18);
      fillRow(grid, 19);
      const result = lineClear.checkAndClear();
      expect(result).not.toBeNull();
      expect(result!.clearedRows).toHaveLength(2);
      expect(result!.score).toBe(350);
    });

    it('should clear a triple row and return result', () => {
      fillRow(grid, 17);
      fillRow(grid, 18);
      fillRow(grid, 19);
      const result = lineClear.checkAndClear();
      expect(result).not.toBeNull();
      expect(result!.clearedRows).toHaveLength(3);
      expect(result!.score).toBe(550);
    });

    it('should clear a tetris and return result', () => {
      fillRow(grid, 16);
      fillRow(grid, 17);
      fillRow(grid, 18);
      fillRow(grid, 19);
      const result = lineClear.checkAndClear();
      expect(result).not.toBeNull();
      expect(result!.clearedRows).toHaveLength(4);
      expect(result!.score).toBe(850);
    });

    it('should track combo across multiple clears', () => {
      fillRow(grid, 19);
      const r1 = lineClear.checkAndClear();
      expect(r1!.combo).toBe(1);

      fillRow(grid, 19);
      const r2 = lineClear.checkAndClear();
      expect(r2!.combo).toBe(2);

      fillRow(grid, 19);
      const r3 = lineClear.checkAndClear();
      expect(r3!.combo).toBe(3);
    });

    it('should reset combo when no lines are cleared', () => {
      fillRow(grid, 19);
      const r1 = lineClear.checkAndClear();
      expect(r1!.combo).toBe(1);

      const r2 = lineClear.checkAndClear();
      expect(r2).toBeNull();
    });

    it('should track back-to-back for tetris clears', () => {
      fillRow(grid, 16);
      fillRow(grid, 17);
      fillRow(grid, 18);
      fillRow(grid, 19);
      const r1 = lineClear.checkAndClear();
      expect(r1!.backToBack).toBe(false);

      fillRow(grid, 16);
      fillRow(grid, 17);
      fillRow(grid, 18);
      fillRow(grid, 19);
      const r2 = lineClear.checkAndClear();
      expect(r2!.backToBack).toBe(true);
      expect(r2!.score).toBe(1300);
    });

    it('should reset back-to-back on non-tetris clear', () => {
      fillRow(grid, 16);
      fillRow(grid, 17);
      fillRow(grid, 18);
      fillRow(grid, 19);
      const r1 = lineClear.checkAndClear();
      expect(r1!.backToBack).toBe(false);

      fillRow(grid, 19);
      const r2 = lineClear.checkAndClear();
      expect(r2!.backToBack).toBe(false);

      fillRow(grid, 16);
      fillRow(grid, 17);
      fillRow(grid, 18);
      fillRow(grid, 19);
      const r3 = lineClear.checkAndClear();
      expect(r3!.backToBack).toBe(false);
      expect(r3!.score).toBe(950);
    });

    it('should detect perfect clear', () => {
      fillRow(grid, 19);
      const result = lineClear.checkAndClear();
      expect(result).not.toBeNull();
      expect(result!.clearedRows).toHaveLength(1);
      expect(result!.score).toBe(150);
    });

    it('should not detect perfect clear when blocks remain', () => {
      fillRow(grid, 19);
      fillRowExcept(grid, 18, 5);
      const result = lineClear.checkAndClear();
      expect(result).not.toBeNull();
      expect(result!.clearedRows).toHaveLength(1);
    });
  });

  describe('integration with Grid', () => {
    it('should detect and clear rows in a full game scenario', () => {
      fillRow(grid, 19);
      fillRow(grid, 18);

      const rows = lineClear.findCompleteRows();
      expect(rows).toHaveLength(2);

      lineClear.clearRows(rows);

      expect(grid.getCell(0, 18)).toBeNull();
      expect(grid.getCell(0, 19)).toBeNull();
    });

    it('should handle partial fills correctly', () => {
      fillRowExcept(grid, 19, 3);
      const rows = lineClear.findCompleteRows();
      expect(rows).toHaveLength(0);
    });

    it('should place a single block and verify no line clear', () => {
      const piece = makePiece('I', 5, 19);
      grid.lockPiece(piece);

      const rows = lineClear.findCompleteRows();
      expect(rows).toHaveLength(0);
    });
  });
});