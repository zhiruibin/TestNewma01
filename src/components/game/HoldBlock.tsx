import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { TetrominoType } from '../../types';

interface HoldBlockProps {
    cellSize?: number;
}

const HoldBlock: React.FC<HoldBlockProps> = ({ cellSize = 25 }) => {
    const { holdPiece } = useGameStore();

    const getTetrominoShape = (type: TetrominoType | null): number[][] => {
        if (!type) return [];

        const shapes: Record<string, number[][]> = {
            I: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            O: [
                [1, 1],
                [1, 1]
            ],
            T: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            S: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            Z: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            J: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            L: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ]
        };

        return shapes[type];
    };

    const getTetrominoColor = (type: TetrominoType | null): string => {
        if (!type) return '#1a1a2e';

        const colors: Record<string, string> = {
            I: '#00f5ff',
            O: '#ffeb3b',
            T: '#9c27b0',
            S: '#4caf50',
            Z: '#f44336',
            J: '#2196f3',
            L: '#ff9800'
        };

        return colors[type];
    };

    const shape = getTetrominoShape(holdPiece?.type ?? null);
    const color = getTetrominoColor(holdPiece?.type ?? null);
    const isEmpty = !holdPiece;

return (
        <div className="hold-block">
            <div className="hold-label">HOLD</div>
            <div className="hold-grid">
                {isEmpty ? (
                    <div className="hold-empty">EMPTY</div>
                ) : (
                    Array.from({ length: 16 }).map((_, index) => {
                        const row = Math.floor(index / 4);
                        const col = index % 4;
                        const isActive = shape[row] && shape[row][col] === 1;

                        return (
                            <div
                                key={index}
                                className="cell"
                                style={{
                                    backgroundColor: isActive ? color : '#1a1a2e',
                                    border: `1px solid ${isActive ? color : '#333'}`
                                }}
                            />
                        );
                    })
                )}
            </div>
            <div className="hold-hint">Press C to hold</div>
        </div>
    );
};

export default HoldBlock;