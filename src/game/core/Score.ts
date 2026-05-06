export interface ScoreConfig {
  // Line clear base scores
  single: number;
  double: number;
  triple: number;
  tetris: number;
  
  // T-Spin scores
  tSpinMini: number;
  tSpin: number;
  tSpinMiniSingle: number;
  tSpinMiniDouble: number;
  tSpinSingle: number;
  tSpinDouble: number;
  tSpinTriple: number;
  
  // Combo base score
  comboBase: number;
  
  // Back-to-back bonus multiplier
  btbMultiplier: number;
  
  // Soft drop and hard drop scores
  softDrop: number;
  hardDrop: number;
}

export interface ScoreState {
  score: number;
  lines: number;
  level: number;
  combo: number;
  btb: boolean;
  btbCount: number;
  totalTSpins: number;
  totalTetrises: number;
}

export const DEFAULT_SCORE_CONFIG: ScoreConfig = {
  single: 100,
  double: 300,
  triple: 500,
  tetris: 800,
  
  tSpinMini: 200,
  tSpin: 400,
  tSpinMiniSingle: 200,
  tSpinMiniDouble: 400,
  tSpinSingle: 800,
  tSpinDouble: 1200,
  tSpinTriple: 1600,
  
  comboBase: 50,
  
  btbMultiplier: 1.5,
  
  softDrop: 1,
  hardDrop: 2,
};

export class ScoreSystem {
  private config: ScoreConfig;
  private state: ScoreState;
  
  constructor(config: ScoreConfig = DEFAULT_SCORE_CONFIG) {
    this.config = config;
    this.state = this.createInitialState();
  }
  
  private createInitialState(): ScoreState {
    return {
      score: 0,
      lines: 0,
      level: 1,
      combo: -1,
      btb: false,
      btbCount: 0,
      totalTSpins: 0,
      totalTetrises: 0,
    };
  }
  
  reset(): void {
    this.state = this.createInitialState();
  }
  
  getState(): ScoreState {
    return { ...this.state };
  }
  
  getScore(): number {
    return this.state.score;
  }
  
  getLines(): number {
    return this.state.lines;
  }
  
  getLevel(): number {
    return this.state.level;
  }
  
  updateLevel(lines: number): void {
    this.state.level = Math.floor(lines / 10) + 1;
  }
  
  addLines(count: number): void {
    this.state.lines += count;
    this.updateLevel(this.state.lines);
  }
  
  addSoftDrop(lines: number): void {
    const points = lines * this.config.softDrop * this.state.level;
    this.state.score += points;
  }
  
  addHardDrop(lines: number): void {
    const points = lines * this.config.hardDrop * this.state.level;
    this.state.score += points;
  }
  
  addLineClear(
    linesCleared: number,
    isTSpin: boolean = false,
    isTSpinMini: boolean = false,
    isBtb: boolean = false
  ): number {
    let points = 0;
    let isBtbAction = false;
    
    if (isTSpin) {
      points = this.calculateTSpinScore(linesCleared, isTSpinMini);
      isBtbAction = true;
      this.state.totalTSpins++;
    } else if (linesCleared >= 4) {
      points = this.config.tetris;
      isBtbAction = true;
      this.state.totalTetrises++;
    } else if (linesCleared > 0) {
      points = this.calculateLineClearScore(linesCleared);
      this.state.btb = false;
      this.state.btbCount = 0;
    }
    
    if (isBtbAction) {
      if (isBtb || this.state.btb) {
        this.state.btb = true;
        this.state.btbCount++;
        points = Math.floor(points * this.config.btbMultiplier);
      } else {
        this.state.btb = true;
        this.state.btbCount = 1;
      }
    }
    
    if (linesCleared > 0) {
      this.addLines(linesCleared);
    }
    
    this.state.score += points;
    return points;
  }
  
  private calculateLineClearScore(lines: number): number {
    switch (lines) {
      case 1:
        return this.config.single;
      case 2:
        return this.config.double;
      case 3:
        return this.config.triple;
      case 4:
        return this.config.tetris;
      default:
        return 0;
    }
  }
  
  private calculateTSpinScore(lines: number, isMini: boolean = false): number {
    if (isMini) {
      switch (lines) {
        case 0:
          return this.config.tSpinMini;
        case 1:
          return this.config.tSpinMiniSingle;
        case 2:
          return this.config.tSpinMiniDouble;
        default:
          return this.config.tSpinMini;
      }
    } else {
      switch (lines) {
        case 0:
          return this.config.tSpin;
        case 1:
          return this.config.tSpinSingle;
        case 2:
          return this.config.tSpinDouble;
        case 3:
          return this.config.tSpinTriple;
        default:
          return this.config.tSpin;
      }
    }
  }
  
  addCombo(comboCount: number): number {
    if (comboCount <= 0) {
      this.state.combo = -1;
      return 0;
    }
    
    this.state.combo = comboCount;
    const points = this.config.comboBase * comboCount * this.state.level;
    this.state.score += points;
    return points;
  }
  
  resetCombo(): void {
    this.state.combo = -1;
  }
  
  getCombo(): number {
    return this.state.combo;
  }
  
  isBtb(): boolean {
    return this.state.btb;
  }
  
  getBtbCount(): number {
    return this.state.btbCount;
  }
  
  getTotalTSpins(): number {
    return this.state.totalTSpins;
  }
  
  getTotalTetrises(): number {
    return this.state.totalTetrises;
  }
  
  addBonus(points: number, reason: string): void {
    this.state.score += points;
  }
  
  setLevel(level: number): void {
    this.state.level = Math.max(1, level);
  }
  
  setScore(score: number): void {
    this.state.score = Math.max(0, score);
  }
  
  setLines(lines: number): void {
    this.state.lines = Math.max(0, lines);
    this.updateLevel(lines);
  }
}

export default ScoreSystem;