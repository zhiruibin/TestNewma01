import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Tetromino } from '../../types';

interface NextBlockProps {
  className?: string;
}

const BLOCK_SIZE = 16;
const PREVIEW_GRID_SIZE = 4;
const PREVIEW_COUNT = 3;
const PREVIEW_GAP = 8;

const NextBlock: React.FC<NextBlockProps> = ({ className = '' }) => {
    const nextPieces = useGameStore((state) => state.nextPieces);

    return (
        <div className={`next-block-container ${className}`.trim()}>
            <div className="next-block-title">NEXT</div>
            <div className="next-block-grid">
                {Array.from({ length: PREVIEW_COUNT }, (_, index) => {
                    const piece = nextPieces?.[index];
                    return (
                        <div
                            key={index}
                            className="next-block-item"
                        >
                            {piece ? renderNextBlock(piece) : renderPlaceholder()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const renderPlaceholder = (): React.ReactNode => {
    return (
        <div className="next-block-preview">
            {Array(PREVIEW_GRID_SIZE * PREVIEW_GRID_SIZE)
                .fill(null)
                .map((_, index) => (
                    <div
                        key={index}
                        className="next-block-cell next-block-cell-placeholder"
                        style={{
                            width: BLOCK_SIZE,
                            height: BLOCK_SIZE,
                        }}
                    />
                ))}
        </div>
    );
};

const renderNextBlock = (block: Tetromino): React.ReactNode => {
    const shape = block.shape;
    const gridSize = shape.length;
    const offset = (PREVIEW_GRID_SIZE - gridSize) / 2;

    const grid: (string | null)[][] = Array(PREVIEW_GRID_SIZE)
        .fill(null)
        .map(() => Array(PREVIEW_GRID_SIZE).fill(null));

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (shape[row][col]) {
                const gridRow = Math.floor(offset) + row;
                const gridCol = Math.floor(offset) + col;
                if (gridRow >= 0 && gridRow < PREVIEW_GRID_SIZE && gridCol >= 0 && gridCol < PREVIEW_GRID_SIZE) {
                    grid[gridRow][gridCol] = block.color;
                }
            }
        }
    }

    return (
        <div className="next-block-preview">
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`next-block-cell ${cell ? 'next-block-cell-filled' : 'next-block-cell-empty'}`}
                        style={{
                            backgroundColor: cell || 'transparent',
                            width: BLOCK_SIZE,
                            height: BLOCK_SIZE,
                        }}
                    />
                ))
            )}
        </div>
    );
};

export default NextBlock;