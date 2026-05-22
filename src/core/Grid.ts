// @ts-nocheck
import { Block, BlockType } from './Block';

export class Grid {
    private width: number;
    private height: number;
    private grid: (BlockType | null)[][];

    constructor(width: number = 10, height: number = 20) {
        this.width = width;
        this.height = height;
        this.grid = this.createEmptyGrid();
    }

    private createEmptyGrid(): (BlockType | null)[][] {
        const grid: (BlockType | null)[][] = [];
        for (let y = 0; y < this.height; y++) {
            grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                grid[y][x] = null;
            }
        }
        return grid;
    }

    public isValidPosition(block: Block, offsetX: number = 0, offsetY: number = 0): boolean {
        const shape = block.getCurrentShape();
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = block.x + x + offsetX;
                    const newY = block.y + y + offsetY;
                    if (newX < 0 || newX >= this.width || newY >= this.height) {
                        return false;
                    }
                    if (newY >= 0 && this.grid[newY][newX] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public placeBlock(block: Block): void {
        const shape = block.getCurrentShape();
        const blockType = block.getType();
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const gridY = block.y + y;
                    const gridX = block.x + x;
                    if (gridY >= 0 && gridY < this.height && gridX >= 0 && gridX < this.width) {
                        this.grid[gridY][gridX] = blockType;
                    }
                }
            }
        }
    }

    public clearLines(): number {
        let linesCleared = 0;
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.isLineFull(y)) {
                this.removeLine(y);
                linesCleared++;
                y++;
            }
        }
        return linesCleared;
    }

    private isLineFull(y: number): boolean {
        for (let x = 0; x < this.width; x++) {
            if (this.grid[y][x] === null) {
                return false;
            }
        }
        return true;
    }

    private removeLine(y: number): void {
        for (let row = y; row > 0; row--) {
            this.grid[row] = [...this.grid[row - 1]];
        }
        this.grid[0] = new Array(this.width).fill(null);
    }

    public getGrid(): (BlockType | null)[][] {
        return this.grid;
    }

    public getBoard(): (BlockType | null)[][] {
        return this.grid;
    }

    public setBoard(board: (BlockType | null)[][]): void {
        this.grid = board;
    }

    public createEmptyRow(): (BlockType | null)[] {
        return new Array(this.width).fill(null);
    }

    public getCell(x: number, y: number): BlockType | null {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.grid[y][x];
    }

    public clearRow(rowIndex: number): void {
        if (rowIndex >= 0 && rowIndex < this.height) {
            this.grid[rowIndex] = this.createEmptyRow();
        }
    }

    public reset(): void {
        this.grid = this.createEmptyGrid();
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }
}