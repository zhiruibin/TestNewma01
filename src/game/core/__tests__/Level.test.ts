import { describe, it, expect, beforeEach } from 'vitest';
import { Level } from '../Level';

describe('Level', () => {
  let level: Level;

  beforeEach(() => {
    level = new Level();
  });

  describe('initialization', () => {
    it('should start at level 1', () => {
      expect(level.getLevel()).toBe(1);
    });

    it('should start with 0 lines cleared', () => {
      expect(level.getLinesCleared()).toBe(0);
    });

    it('should start with normal difficulty multiplier', () => {
      expect(level.getDifficultyMultiplier()).toBe(1.0);
    });
  });

  describe('addLinesCleared', () => {
    it('should add lines and update level correctly', () => {
      level.addLinesCleared(5);
      expect(level.getLinesCleared()).toBe(5);
      expect(level.getLevel()).toBe(1);
    });

    it('should level up every 10 lines', () => {
      level.addLinesCleared(10);
      expect(level.getLevel()).toBe(2);

      level.addLinesCleared(10);
      expect(level.getLevel()).toBe(3);
    });

    it('should handle multiple line additions', () => {
      level.addLinesCleared(3);
      level.addLinesCleared(4);
      level.addLinesCleared(3);
      expect(level.getLinesCleared()).toBe(10);
      expect(level.getLevel()).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      level.addLinesCleared(25);
      level.reset();
      expect(level.getLevel()).toBe(1);
      expect(level.getLinesCleared()).toBe(0);
    });
  });

  describe('getDropSpeed', () => {
    it('should return decreasing speed as level increases', () => {
      const speed1 = level.getDropSpeed();
      level.addLinesCleared(50);
      const speed6 = level.getDropSpeed();
      expect(speed6).toBeLessThan(speed1);
    });

    it('should have a minimum speed', () => {
      level.addLinesCleared(1000);
      const speed = level.getDropSpeed();
      expect(speed).toBeGreaterThan(0);
    });
  });

  describe('difficulty', () => {
    it('should set easy difficulty', () => {
      level.setDifficulty('easy');
      expect(level.getDifficultyMultiplier()).toBe(1.5);
    });

    it('should set normal difficulty', () => {
      level.setDifficulty('normal');
      expect(level.getDifficultyMultiplier()).toBe(1.0);
    });

    it('should set hard difficulty', () => {
      level.setDifficulty('hard');
      expect(level.getDifficultyMultiplier()).toBe(0.6);
    });
  });

  describe('getLinesForNextLevel', () => {
    it('should return lines needed to reach next level', () => {
      level.addLinesCleared(5);
      expect(level.getLinesForNextLevel()).toBe(10);
    });

    it('should return 10 when at level boundary', () => {
      level.addLinesCleared(10);
      expect(level.getLinesForNextLevel()).toBe(20);
    });

    it('should return correct value at higher levels', () => {
      level.addLinesCleared(25);
      expect(level.getLevel()).toBe(3);
      expect(level.getLinesForNextLevel()).toBe(30);
    });
  });
});