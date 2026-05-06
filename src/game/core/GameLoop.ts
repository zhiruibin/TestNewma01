import { Block, TetrominoType } from './Block';
import { Grid } from './Grid';
import { Collision } from './Collision';
import { LineClear } from './LineClear';
import { Ghost } from './Ghost';
import { Score } from './Score';
import { Level } from './Level';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface GameLoopConfig {
    initialSpeed: number;
    minSpeed: number;
    speedIncrement: number;
}

export interface GameStats {
    score: number;
    lines: number;
    level: number;
    combo: number;
    tSpin: boolean;
    b2b: boolean;
}

export class GameLoop {
    private state: GameState;
    private grid: Grid;
    private collision: Collision;
    private lineClear: LineClear;
    private ghost: Ghost;
    private score: Score;
    private level: Level;
    
    private currentBlock: Block | null;
    private nextBlock: Block | null;
    private holdBlock: Block | null;
    private canHold: boolean;
    
    private lastTime: number;
    private dropCounter: number;
    private dropInterval: number;
    private animationFrameId: number | null;
    
    private config: GameLoopConfig;
    private onStateChange?: (state: GameState) => void;
    private onStatsChange?: (stats: GameStats) => void;
    private onBlockChange?: (block: Block | null) => void;
    private onGridChange?: (grid: number[][]) => void;
    private onGameOver?: (stats: GameStats) => void;

    constructor(config: Partial = {}) {
        this.config = {
            initialSpeed: 1000,
            minSpeed: 100,
            speedIncrement: 50,
            ...config
        };

        this.state = 'menu';
        this.grid = new Grid();
        this.collision = new Collision();
        this.lineClear = new LineClear();
        this.ghost = new Ghost();
        this.score = new Score();
        this.level = new Level(this.config.initialSpeed, this.config.minSpeed, this.config.speedIncrement);
        
        this.currentBlock = null;
        this.nextBlock = null;
        this.holdBlock = null;
        this.canHold = true;
        
        this.lastTime = 0;
        this.dropCounter = 0;
        this.dropInterval = this.level.getSpeed();
        this.animationFrameId = null;
    }

    public setState(state: GameState): void {
        this.state = state;
        this.onStateChange?.(state);
    }

    public getState(): GameState {
        return this.state;
    }

    public start(): void {
        this.reset();
        this.setState('playing');
        this.lastTime = performance.now();
        this.dropCounter = 0;
        this.dropInterval = this.level.getSpeed();
        this.spawnBlock();
        this.gameLoop(this.lastTime);
    }

    public pause(): void {
        if (this.state === 'playing') {
            this.setState('paused');
            if (this.animationFrameId !== null) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
    }

    public resume(): void {
        if (this.state === 'paused') {
            this.setState('playing');
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
        }
    }

    public stop(): void {
        this.setState('menu');
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    public reset(): void {
        this.grid.clear();
        this.score.reset();
        this.level.reset();
        this.currentBlock = null;
        this.nextBlock = null;
        this.holdBlock = null;
        this.canHold = true;
        this.dropCounter = 0;
        this.dropInterval = this.level.getSpeed();
        this.updateStats();
    }

    private gameLoop(currentTime: number): void {
        if (this.state !== 'playing') {
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.dropCounter += deltaTime;
        if (this.dropCounter >= this.dropInterval) {
            this.drop();
            this.dropCounter = 0;
        }

        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    public spawnBlock(): void {
        if (this.nextBlock === null) {
            this.nextBlock = Block.createRandom();
        }
        
        this.currentBlock = this.nextBlock;
        this.nextBlock = Block.createRandom();
        this.canHold = true;
        
        if (this.collision.checkCollision(this.grid.getGrid(), this.currentBlock, 0, 0)) {
            this.gameOver();
            return;
        }
        
        this.onBlockChange?.(this.currentBlock);
        this.onBlockChange?.(this.nextBlock);
        this.onGridChange?.(this.grid.getGrid());
    }

    public drop(): boolean {
        if (!this.currentBlock) return false;
        
        if (this.collision.checkCollision(this.grid.getGrid(), this.currentBlock, 0, 1)) {
            this.lockBlock();
            return false;
        }
        
        this.currentBlock.move(0, 1);
        this.onBlockChange?.(this.currentBlock);
        return true;
    }

    public hardDrop(): void {
        if (!this.currentBlock) return;
        
        let dropDistance = 0;
        while (!this.collision.checkCollision(this.grid.getGrid(), this.currentBlock, 0, dropDistance + 1)) {
            dropDistance++;
        }
        
        this.currentBlock.move(0, dropDistance);
        this.score.addHardDrop(dropDistance);
        this.lockBlock();
    }

    public moveLeft(): boolean {
        if (!this.currentBlock) return false;
        
        if (!this.collision.checkCollision(this.grid.getGrid(), this.currentBlock, -1, 0)) {
            this.currentBlock.move(-1, 0);
            this.onBlockChange?.(this.currentBlock);
            return true;
        }
        return false;
    }

    public moveRight(): boolean {
        if (!this.currentBlock) return false;
        
        if (!this.collision.checkCollision(this.grid.getGrid(), this.currentBlock, 1, 0)) {
            this.currentBlock.move(1, 0);
            this.onBlockChange?.(this.currentBlock);
            return true;
        }
        return false;
    }

    public rotate(clockwise: boolean = true): boolean {
        if (!this.currentBlock) return false;
        
        const rotated = this.currentBlock.clone();
        rotated.rotate(clockwise);
        
        if (!this.collision.checkCollisionWithBlock(this.grid.getGrid(), rotated, 0, 0)) {
            this.currentBlock.rotate(clockwise);
            this.onBlockChange?.(this.currentBlock);
            return true;
        }
        
        const kicks = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: -2, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: -1 },
            { x: -1, y: -1 },
            { x: 1, y: -1 }
        ];
        
        for (const kick of kicks) {
            if (!this.collision.checkCollisionWithBlock(this.grid.getGrid(), rotated, kick.x, kick.y)) {
                this.currentBlock.rotate(clockwise);
                this.currentBlock.move(kick.x, kick.y);
                this.onBlockChange?.(this.currentBlock);
                return true;
            }
        }
        
        return false;
    }

    public hold(): void {
        if (!this.currentBlock || !this.canHold) return;
        
        if (this.holdBlock === null) {
            this.holdBlock = new Block(this.currentBlock.getType());
            this.spawnBlock();
        } else {
            const temp = this.holdBlock;
            this.holdBlock = new Block(this.currentBlock.getType());
            this.currentBlock = temp;
            this.currentBlock.resetPosition();
        }
        
        this.canHold = false;
        this.onBlockChange?.(this.holdBlock);
        this.onBlockChange?.(this.currentBlock);
    }

    private lockBlock(): void {
        if (!this.currentBlock) return;
        
        const cells = this.currentBlock.getOccupiedCells();
        const blockType = this.currentBlock.getType();
        
        for (const cell of cells) {
            this.grid.setCell(cell.y, cell.x, blockType);
        }
        
        const clearResult = this.lineClear.clearLines(this.grid.getGrid());
        if (clearResult.linesCleared > 0) {
            const isTSpin = this.lineClear.isTSpin(this.currentBlock, this.grid.getGrid());
            this.score.addLines(clearResult.linesCleared, this.level.getLevel(), isTSpin, this.score.getCombo());
            this.level.increaseLevel(this.score.getLines());
            this.dropInterval = this.level.getSpeed();
        } else {
            this.score.resetCombo();
        }
        
        this.onGridChange?.(this.grid.getGrid());
        this.updateStats();
        this.spawnBlock();
    }

    private gameOver(): void {
        this.setState('gameover');
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        const stats = this.getStats();
        this.onGameOver?.(stats);
    }

    public getGhostY(): number {
        if (!this.currentBlock) return 0;
        return this.ghost.getGhostY(this.grid.getGrid(), this.currentBlock);
    }

    public getNextBlock(): Block | null {
        return this.nextBlock;
    }

    public getHoldBlock(): Block | null {
        return this.holdBlock;
    }

    public canHoldPiece(): boolean {
        return this.canHold;
    }

    public getStats(): GameStats {
        return {
            score: this.score.getScore(),
            lines: this.score.getLines(),
            level: this.level.getLevel(),
            combo: this.score.getCombo(),
            tSpin: this.score.getLastTSpin(),
            b2b: this.score.getB2B()
        };
    }

    private updateStats(): void {
        this.onStatsChange?.(this.getStats());
    }

    public onStateChangeCallback(callback: (state: GameState) => void): void {
        this.onStateChange = callback;
    }

    public onStatsChangeCallback(callback: (stats: GameStats) => void): void {
        this.onStatsChange = callback;
    }

    public onBlockChangeCallback(callback: (block: Block | null) => void): void {
        this.onBlockChange = callback;
    }

    public onGridChangeCallback(callback: (grid: number[][]) => void): void {
        this.onGridChange = callback;
    }

    public onGameOverCallback(callback: (stats: GameStats) => void): void {
        this.onGameOver = callback;
    }
}