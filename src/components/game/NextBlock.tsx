// 导入 React 和类型定义
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Tetromino, TetrominoType } from '../../types';

// NextBlock 组件属性接口
interface NextBlockProps {
  className?: string;
}

const BLOCK_SIZE = 20;
// NextBlock 组件，显示下一个即将出现的方块
const PREVIEW_GRID_SIZE = 4;

const NextBlock: React.FC<NextBlockProps> = ({ className = '' }) => {
    const nextPiece = useGameStore((state) => state.nextPiece);

    if (!nextPiece) {
        return (
            <div className="next-block-placeholder">
                <div>NEXT</div>
                <div>-</div>
            </div>
        );
    }

    return (
        <div className={`next-block-container ${className}`.trim()}>
            <div className="next-block-label">NEXT</div>
            <div className="next-block-preview">
                {renderNextBlock(nextPiece)}
            </div>
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
    <>
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="next-block-cell"
            style={{
              backgroundColor: cell || 'transparent',
              width: BLOCK_SIZE,
              height: BLOCK_SIZE,
            }}
          />
        ))
      )}
    </>
  );
};

export default NextBlock;