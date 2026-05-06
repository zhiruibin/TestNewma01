import { Tetromino } from '../../types';

export type BlockType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position {
    x: number;
    y: number;
}

export interface BlockShape {
    type: BlockType;
    color: string;
    rotations: number[][][];
}

export const BLOCK_COLORS: Record<BlockType, string> = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

export const BLOCK_SHAPES: Record<BlockType, number[][][]> = {
    I: [
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ],
    O: [
        [
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    ],
    T: [
        [
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ]
    ],
    S: [
        [
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [1, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ]
    ],
    Z: [
        [
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    ],
    J: [
        [
            [1, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ]
    ],
    L: [
        [
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ]
    ]
};

export class Block {
    public type: BlockType;
    public position: Position;
public rotationIndex: number;
    private lastMoveWasRotation: boolean = false;

    public get rotation(): number {
        return this.rotationIndex;
    }

    public get x(): number {
        return this.position.x;
    }

    public get y(): number {
        return this.position.y;
    }
    public color: string;

    constructor(type: BlockType, startX: number = 3, startY: number = 0) {
        this.type = type;
        this.position = { x: startX, y: startY };
        this.rotationIndex = 0;
        this.color = BLOCK_COLORS[type];
    }

    public getShape(): number[][] {
        return BLOCK_SHAPES[this.type][this.rotationIndex];
    }

public getCells(): Position[] {
        const shape = this.getShape();
        const cells: Position[] = [];
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    cells.push({
                        x: this.position.x + col,
                        y: this.position.y + row
                    });
                }
            }
        }
        return cells;
    }

public move(piece: Tetromino, dx: number, dy: number): Position {
        piece.x += dx;
        piece.y += dy;
        return { x: piece.x, y: piece.y };
    }

public resetPosition(piece: Tetromino): Position {
        piece.x = 3;
        piece.y = 0;
        return { x: piece.x, y: piece.y };
    }

public rotate(piece: Tetromino, clockwise: boolean): number {
        const newRotation = (piece.rotation + (clockwise ? 1 : 3)) % 4;
        this.rotationIndex = newRotation;
        piece.rotation = newRotation;
        piece.shape = BLOCK_SHAPES[this.type][newRotation];
        return newRotation;
    }
    public getType(): BlockType {
        return this.type;
    }

    public getPosition(): Position {
        return this.position;
    }

    public wasLastMoveRotation(): boolean {
        return this.lastMoveWasRotation;
    }

    public setLastMoveWasRotation(value: boolean): void {
        this.lastMoveWasRotation = value;
    }

    private static bag: BlockType[] = [];

public static createRandom(): Block {
    if (Block.bag.length === 0) {
        Block.bag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        for (let i = Block.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [Block.bag[i], Block.bag[j]] = [Block.bag[j], Block.bag[i]];
        }
    }
    
    const type = Block.bag.pop()!;
    return new Block(type);
}
}