export class Level {
    private currentLevel: number;
    private linesCleared: number;
    private dropSpeed: number;
    private difficultyMultiplier: number;

    constructor() {
        this.currentLevel = 1;
        this.linesCleared = 0;
        this.dropSpeed = this.calculateDropSpeed(1);
        this.difficultyMultiplier = 1.0;
    }

    public getLevel(): number {
        return this.currentLevel;
    }

    public getDropSpeed(level?: number): number {
        if (level !== undefined) {
            return this.calculateDropSpeed(level) * this.difficultyMultiplier;
        }
        return this.dropSpeed * this.difficultyMultiplier;
    }

    public getLinesCleared(): number {
        return this.linesCleared;
    }

    public getDifficultyMultiplier(): number {
        return this.difficultyMultiplier;
    }

    public setDifficulty(difficulty: 'easy' | 'normal' | 'hard'): void {
        switch (difficulty) {
            case 'easy':
                this.difficultyMultiplier = 1.5;
                break;
            case 'normal':
                this.difficultyMultiplier = 1.0;
                break;
            case 'hard':
                this.difficultyMultiplier = 0.6;
                break;
            default:
                this.difficultyMultiplier = 1.0;
        }
    }

    public setSpeedMultiplier(multiplier: number): void {
        this.difficultyMultiplier = multiplier;
        this.dropSpeed = this.calculateDropSpeed(this.currentLevel);
    }


    public getLinesForNextLevel(): number {
        return this.currentLevel * 10;
    }

    public addLinesCleared(lines: number): void {
        this.linesCleared += lines;

        // Check if level should increase (every 10 lines per level)
        // Use while loop to handle multi-level jumps correctly
        while (this.linesCleared >= this.currentLevel * 10) {
            this.levelUp();
        }
    }

    private levelUp(): void {
        this.currentLevel++;
        this.dropSpeed = this.calculateDropSpeed(this.currentLevel);
    }

    private calculateDropSpeed(level: number): number {
        // Non-linear speed curve using exponential decay
        // Starts at 1000ms, decays by 15% per level, minimum 50ms
        const speed = Math.max(50, 1000 * Math.pow(0.85, level - 1));
        return speed;
    }

    public reset(): void {
        this.currentLevel = 1;
        this.linesCleared = 0;
        this.dropSpeed = this.calculateDropSpeed(1);
        this.difficultyMultiplier = 1.0;
    }
}