import { describe, it, expect, beforeEach } from 'vitest';
import { Block, BLOCK_COLORS, BLOCK_SHAPES } from '../Block';
import type { Tetromino, BlockType } from '../../types';

describe('Block', () => {
  describe('constructor', () => {
    it('should create a block with default position (3, 0)', () => {
      const block = new Block('I');
      expect(block.x).toBe(3);
      expect(block.y).toBe(0);
    });

    it('should create a block with custom position', () => {
      const block = new Block('T', 5, 2);
      expect(block.x).toBe(5);
      expect(block.y).toBe(2);
    });

    it('should set the correct type', () => {
      const block = new Block('L');
      expect(block.type).toBe('L');
    });

    it('should set the correct color from BLOCK_COLORS', () => {
      const block = new Block('I');
      expect(block.color).toBe(BLOCK_COLORS['I']);
    });

    it('should initialize rotation to 0', () => {
      const block = new Block('O');
      expect(block.rotation).toBe(0);
    });

    it('should initialize shape from BLOCK_SHAPES', () => {
      const block = new Block('T');
      expect(block.getShape()).toEqual(BLOCK_SHAPES['T'][0]);
    });
  });

  describe('getCells', () => {
    it('should return correct cells for I block at default position', () => {
      const block = new Block('I', 3, 0);
      const cells = block.getCells();
      const shape = BLOCK_SHAPES['I'][0];
      const expected: Array<{ x: number; y: number }> = [];
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            expected.push({ x: 3 + col, y: 0 + row });
          }
        }
      }
      expect(cells).toEqual(expected);
    });

    it('should return correct cells for O block', () => {
      const block = new Block('O', 3, 0);
      const cells = block.getCells();
      const shape = BLOCK_SHAPES['O'][0];
      const expected: Array<{ x: number; y: number }> = [];
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            expected.push({ x: 3 + col, y: 0 + row });
          }
        }
      }
      expect(cells).toEqual(expected);
    });

    it('should return correct cells for T block at custom position', () => {
      const block = new Block('T', 5, 5);
      const cells = block.getCells();
      const shape = BLOCK_SHAPES['T'][0];
      const expected: Array<{ x: number; y: number }> = [];
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            expected.push({ x: 5 + col, y: 5 + row });
          }
        }
      }
      expect(cells).toEqual(expected);
    });

    it('should return exactly 4 cells', () => {
      const block = new Block('L', 3, 0);
      const cells = block.getCells();
      expect(cells.length).toBe(4);
    });

    it('should return exactly 4 cells for each block type', () => {
      const types: BlockType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      for (const type of types) {
        const block = new Block(type);
        const cells = block.getCells();
        expect(cells.length).toBe(4);
      }
    });
  });

  describe('rotate', () => {
    it('should rotate a Tetromino clockwise and return new rotation', () => {
      const block = new Block('T');
      const piece: Tetromino = {
        type: 'T',
        shape: BLOCK_SHAPES['T'][0],
        color: BLOCK_COLORS['T'],
        rotation: 0,
        x: 3,
        y: 0,
      };
      const newRotation = block.rotate(piece, true);
      expect(newRotation).toBe(1);
      expect(piece.rotation).toBe(1);
      expect(piece.shape).toEqual(BLOCK_SHAPES['T'][1]);
    });

    it('should rotate a Tetromino counter-clockwise and return new rotation', () => {
      const block = new Block('T');
      const piece: Tetromino = {
        type: 'T',
        shape: BLOCK_SHAPES['T'][1],
        color: BLOCK_COLORS['T'],
        rotation: 1,
        x: 3,
        y: 0,
      };
      const newRotation = block.rotate(piece, false);
      expect(newRotation).toBe(0);
      expect(piece.rotation).toBe(0);
      expect(piece.shape).toEqual(BLOCK_SHAPES['T'][0]);
    });

    it('should wrap around from rotation 3 to 0 when rotating clockwise', () => {
      const block = new Block('T');
      const piece: Tetromino = {
        type: 'T',
        shape: BLOCK_SHAPES['T'][3],
        color: BLOCK_COLORS['T'],
        rotation: 3,
        x: 3,
        y: 0,
      };
      const newRotation = block.rotate(piece, true);
      expect(newRotation).toBe(0);
      expect(piece.rotation).toBe(0);
      expect(piece.shape).toEqual(BLOCK_SHAPES['T'][0]);
    });

    it('should wrap around from rotation 0 to 3 when rotating counter-clockwise', () => {
      const block = new Block('T');
      const piece: Tetromino = {
        type: 'T',
        shape: BLOCK_SHAPES['T'][0],
        color: BLOCK_COLORS['T'],
        rotation: 0,
        x: 3,
        y: 0,
      };
      const newRotation = block.rotate(piece, false);
      expect(newRotation).toBe(3);
      expect(piece.rotation).toBe(3);
      expect(piece.shape).toEqual(BLOCK_SHAPES['T'][3]);
    });

    it('should update shape for I block when rotating clockwise', () => {
      const block = new Block('I');
      const piece: Tetromino = {
        type: 'I',
        shape: BLOCK_SHAPES['I'][0],
        color: BLOCK_COLORS['I'],
        rotation: 0,
        x: 3,
        y: 0,
      };
      block.rotate(piece, true);
      expect(piece.shape).toEqual(BLOCK_SHAPES['I'][1]);
    });

    it('should update shape for L block when rotating counter-clockwise', () => {
      const block = new Block('L');
      const piece: Tetromino = {
        type: 'L',
        shape: BLOCK_SHAPES['L'][0],
        color: BLOCK_COLORS['L'],
        rotation: 0,
        x: 3,
        y: 0,
      };
      block.rotate(piece, false);
      expect(piece.shape).toEqual(BLOCK_SHAPES['L'][3]);
    });
  });

  describe('createRandom (static)', () => {
    beforeEach(() => {
      Block.resetBag();
    });

    it('should return a Block instance', () => {
      const block = Block.createRandom();
      expect(block).toBeInstanceOf(Block);
    });

    it('should return a block with a valid type', () => {
      const validTypes: BlockType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      const block = Block.createRandom();
      expect(validTypes).toContain(block.type);
    });

    it('should return a block with default position', () => {
      const block = Block.createRandom();
      expect(block.x).toBe(3);
      expect(block.y).toBe(0);
    });

    it('should return a block with rotation 0', () => {
      const block = Block.createRandom();
      expect(block.rotation).toBe(0);
    });

    it('should return a block with correct color for its type', () => {
      const block = Block.createRandom();
      expect(block.color).toBe(BLOCK_COLORS[block.type]);
    });

    it('should distribute all 7 block types over 7 consecutive calls (7-bag)', () => {
      const types = new Set<BlockType>();
      for (let i = 0; i < 7; i++) {
        const block = Block.createRandom();
        types.add(block.type);
      }
      expect(types.size).toBe(7);
    });
  });

  describe('resetBag (static)', () => {
    it('should be callable without errors', () => {
      expect(() => Block.resetBag()).not.toThrow();
    });

    it('should reset the bag so next 7 calls produce all 7 types', () => {
      Block.resetBag();
      // Drain the current bag
      for (let i = 0; i < 7; i++) {
        Block.createRandom();
      }
      // Reset and verify all 7 types appear again
      Block.resetBag();
      const types = new Set<BlockType>();
      for (let i = 0; i < 7; i++) {
        const block = Block.createRandom();
        types.add(block.type);
      }
      expect(types.size).toBe(7);
    });
  });
});