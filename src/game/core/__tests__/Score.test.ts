import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreSystem } from '../Score';

describe('ScoreSystem', () => {
  let score: ScoreSystem;

  beforeEach(() => {
    score = new ScoreSystem();
  });

  describe('addLineClear', () => {
    it('should return 100 for single line clear', () => {
      const result = score.addLineClear(1, false, false, false);
      expect(result).toBe(100);
    });

    it('should return 300 for double line clear', () => {
      const result = score.addLineClear(2, false, false, false);
      expect(result).toBe(300);
    });

    it('should return 500 for triple line clear', () => {
      const result = score.addLineClear(3, false, false, false);
      expect(result).toBe(500);
    });

    it('should return 800 for Tetris', () => {
      const result = score.addLineClear(4, false, false, false);
      expect(result).toBe(800);
    });

    it('should return 0 for 0 lines without T-Spin', () => {
      const result = score.addLineClear(0, false, false, false);
      expect(result).toBe(0);
    });

    it('should apply B2B bonus for consecutive Tetris', () => {
      score.addLineClear(4, false, false, true);
      const result = score.addLineClear(4, false, false, true);
      expect(result).toBe(1200);
    });

    it('should still apply B2B when state.btb is true even if isBtb=false', () => {
      score.addLineClear(4, false, false, true);
      const result = score.addLineClear(4, false, false, false);
      expect(result).toBe(1200);
    });

    it('should reset B2B on non-difficult clear', () => {
      score.addLineClear(4, false, false, true);
      score.addLineClear(1, false, false, false);
      const result = score.addLineClear(4, false, false, true);
      expect(result).toBe(800);
    });

    it('should apply combo bonus on consecutive clears', () => {
      score.addLineClear(1, false, false, false);
      const result = score.addLineClear(1, false, false, false);
      expect(result).toBeGreaterThanOrEqual(100);
    });

    it('should award T-Spin with no lines', () => {
      const result = score.addLineClear(0, true, false, false);
      expect(result).toBe(400);
    });

    it('should award T-Spin single', () => {
      const result = score.addLineClear(1, true, false, false);
      expect(result).toBe(800);
    });

    it('should award T-Spin double', () => {
      const result = score.addLineClear(2, true, false, false);
      expect(result).toBe(1200);
    });

    it('should award T-Spin mini', () => {
      const result = score.addLineClear(0, true, true, false);
      expect(result).toBe(200);
    });

    it('should apply B2B bonus for consecutive difficult clears', () => {
      score.addLineClear(4, false, false, true);
      const result = score.addLineClear(2, false, false, true);
      expect(result).toBe(300);
    });
  });

  describe('updateLevel', () => {
    it('should set level based on lines', () => {
      score.updateLevel(10);
      expect(score.getState().level).toBe(2);
    });

    it('should set level to 1 for 0 lines', () => {
      score.updateLevel(0);
      expect(score.getState().level).toBe(1);
    });

    it('should set level to 1 for less than 10 lines', () => {
      score.updateLevel(5);
      expect(score.getState().level).toBe(1);
    });

    it('should set level to 3 for 20 lines', () => {
      score.updateLevel(20);
      expect(score.getState().level).toBe(3);
    });
  });

  describe('addLines', () => {
    it('should accumulate lines across multiple calls', () => {
      score.addLines(5);
      score.addLines(5);
      expect(score.getState().lines).toBe(10);
      expect(score.getState().level).toBe(2);
    });

    it('should update level when crossing threshold', () => {
      score.addLines(9);
      expect(score.getState().level).toBe(1);
      score.addLines(1);
      expect(score.getState().level).toBe(2);
    });
  });

  describe('getState', () => {
    it('should return initial score state', () => {
      const state = score.getState();
      expect(state.score).toBe(0);
      expect(state.lines).toBe(0);
      expect(state.level).toBe(1);
      expect(state.combo).toBe(-1);
      expect(state.btb).toBe(false);
    });

    it('should reflect updates after addLineClear', () => {
      score.addLineClear(2, false, false, false);
      const state = score.getState();
      expect(state.score).toBe(300);
      expect(state.lines).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      score.addLineClear(4, false, false, true);
      score.addLines(10);
      score.reset();
      const state = score.getState();
      expect(state.score).toBe(0);
      expect(state.lines).toBe(0);
      expect(state.level).toBe(1);
      expect(state.combo).toBe(-1);
      expect(state.btb).toBe(false);
    });
  });
});