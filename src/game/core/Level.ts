export class Level {
    private currentLevel: number;
    private linesCleared: number;
    private linesForNextLevel: number;
    private dropSpeed: number;

    constructor() {
        this.currentLevel = 1;
        this.linesCleared = 0;
        this.linesForNextLevel = 10;
        this.dropSpeed = this.calculateDropSpeed(1);
    }

    public getLevel(): number {
        return this.currentLevel;
    }

    public getDropSpeed(): number {
        return this.dropSpeed;
    }

    public getLinesCleared(): number {
        return this.linesCleared;
    }

    public addLinesCleared(lines: number): void {
        this.linesCleared += lines;
        
        // Check if level should increase
        const requiredLines = this.linesForNextLevel * this.currentLevel;
        if (this.linesCleared >= requiredLines) {
            this.levelUp();
        }
    }

    private levelUp(): void {
        this.currentLevel++;
        this.dropSpeed = this.calculateDropSpeed(this.currentLevel);
    }

    private calculateDropSpeed(level: number): number {
        // Speed increases with level (lower value = faster drop)
        // Starting at 1000ms, decreasing by 50ms per level, minimum 100ms
        const speed = Math.max(100, 1000 - (level - 1) * 50);
        return speed;
    }

    public reset(): void {
        this.currentLevel = 1;
        this.linesCleared = 0;
        this.dropSpeed = this.calculateDropSpeed(1);
    }
}