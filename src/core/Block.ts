export type BlockType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position {
    x: number;
    y: number;
}

export interface BlockShape {
    type: BlockType;
    color: string;
    shape: number[][];
}

export class Block {
    private type: BlockType;
    private shape: number[][];
    private color: string;
    private position: Position;
    private rotationIndex: number;

    private static readonly SHAPES: Record<BlockType, BlockShape> = {
        I: {
            type: 'I',
            color: '#00f0f0',
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
        },
        O: {
            type: 'O',
            color: '#f0f000',
            shape: [
                [1, 1],
                [1, 1]
            ]
        },
        T: {
            type: 'T',
            color: '#a000f0',
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ]
        },
        S: {
            type: 'S',
            color: '#00f000',
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ]
        },
        Z: {
            type: 'Z',
            color: '#f00000',
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ]
        },
        J: {
            type: 'J',
            color: '#0000f0',
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ]
        },
        L: {
            type: 'L',
            color: '#f0a000',
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ]
        }
    };

    constructor(type: BlockType, startX: number = 3, startY: number = 0) {
        this.type = type;
        const shapeData = Block.SHAPES[type];
        this.color = shapeData.color;
        this.shape = this.deepCopy(shapeData.shape);
        this.position = { x: startX, y: startY };
        this.rotationIndex = 0;
    }

    private deepCopy(matrix: number[][]): number[][] {
        return matrix.map(row => [...row]);
    }

    public getType(): BlockType {
        return this.type;
    }

    public getColor(): string {
        return this.color;
    }

    public getShape(): number[][] {
        return this.shape;
    }

    public getPosition(): Position {
        return { ...this.position };
    }

    public setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    public move(dx: number, dy: number): void {
        this.position.x += dx;
        this.position.y += dy;
    }

    public rotate(): void {
        const n = this.shape.length;
        const rotated: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                rotated[j][n - 1 - i] = this.shape[i][j];
            }
        }
        
        this.shape = rotated;
        this.rotationIndex = (this.rotationIndex + 1) % 4;
    }

    public getCells(): Position[] {
        const cells: Position[] = [];
        const n = this.shape.length;
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (this.shape[i][j] === 1) {
                    cells.push({
                        x: this.position.x + j,
                        y: this.position.y + i
                    });
                }
            }
        }
        
        return cells;
    }

    public static getRandomType(): BlockType {
        const types: BlockType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        return types[Math.floor(Math.random() * types.length)];
    }

    public static createRandom(startX: number = 3, startY: number = 0): Block {
        const type = Block.getRandomType();
        return new Block(type, startX, startY);
    }
}