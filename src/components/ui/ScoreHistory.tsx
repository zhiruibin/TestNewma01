import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import './ScoreHistory.css';

type SortKey = 'score' | 'date' | 'lines' | 'level';
type SortDir = 'asc' | 'desc';

export const ScoreHistory: React.FC = () => {
  const scoreHistory = useGameStore((state) => state.scoreHistory);
  const clearScoreHistory = useGameStore((state) => state.clearScoreHistory);
  const setShowScoreHistory = useUIStore((state) => state.setShowScoreHistory);

  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [confirmClear, setConfirmClear] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const sortedHistory = useMemo(() => {
    const sorted = [...scoreHistory].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [scoreHistory, sortKey, sortDir]);

  const bestScore = useMemo(() => {
    if (scoreHistory.length === 0) return null;
    return scoreHistory.reduce(
      (max, r) => (r.score > max.score ? r : max),
      scoreHistory[0],
    );
  }, [scoreHistory]);

  const stats = useMemo(() => {
    if (scoreHistory.length === 0) return null;
    const totalGames = scoreHistory.length;
    const avgScore = Math.round(scoreHistory.reduce((s, r) => s + r.score, 0) / totalGames);
    const totalLines = scoreHistory.reduce((s, r) => s + r.lines, 0);
    return { totalGames, avgScore, totalLines };
  }, [scoreHistory]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const getSortIcon = (key: SortKey): string => {
    if (sortKey !== key) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const rankBadges: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setShowScoreHistory(false);
      setIsClosing(false);
    }, 300);
  }, [isClosing, setShowScoreHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  useEffect(() => {
    if (!confirmClear) return;
    const timer = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmClear]);

  return (
    <div
      className={`score-history-overlay${isClosing ? ' closing' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="score-history-card">
        <div className="score-history-header">
          <h2 className="score-history-title">积分记录</h2>
          <button
            className="score-history-close"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>
        {scoreHistory.length === 0 ? (
          <div className="score-history-empty">
            <span className="score-history-empty-icon">🎮</span>
            <p>暂无游戏记录</p>
          </div>
        ) : (
          <>
            {bestScore && (
              <div className="score-history-best">
                <span className="score-history-best-icon">🏆</span>
                <span className="score-history-best-label">最佳成绩</span>
                <span className="score-history-best-score">
                  {bestScore.score}
                </span>
                <span className="score-history-best-date">
                  {bestScore.date}
                </span>
              </div>
            )}

            {stats && (
              <div className="score-history-stats">
                <span>共 {stats.totalGames} 局</span>
                <span className="score-history-stats-dot">·</span>
                <span>平均 {stats.avgScore} 分</span>
                <span className="score-history-stats-dot">·</span>
                <span>累计 {stats.totalLines} 行</span>
              </div>
            )}

            <div className="score-history-table-wrapper">
              <table className="score-history-table">
                <thead>
                  <tr>
                    <th>排名</th>
                    <th
                      className="score-history-sortable"
                      onClick={() => handleSort('score')}
                    >
                      分数{getSortIcon('score')}
                    </th>
                    <th
                      className="score-history-sortable"
                      onClick={() => handleSort('level')}
                    >
                      等级{getSortIcon('level')}
                    </th>
                    <th
                      className="score-history-sortable"
                      onClick={() => handleSort('lines')}
                    >
                      行数{getSortIcon('lines')}
                    </th>
                    <th
                      className="score-history-sortable"
                      onClick={() => handleSort('date')}
                    >
                      日期{getSortIcon('date')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((record, index) => (
                    <tr
                      key={index}
                      className={`rank-${index + 1} ${
                        index % 2 === 0
                          ? 'score-history-row-even'
                          : 'score-history-row-odd'
                      }`}
                    >
                      <td>
                        {rankBadges[index + 1] ? (
                          <span className="score-history-rank-badge">
                            {rankBadges[index + 1]}
                          </span>
                        ) : (
                          <span className="score-history-rank-number">
                            {index + 1}
                          </span>
                        )}
                      </td>
                      <td>{record.score}</td>
                      <td>{record.level}</td>
                      <td>{record.lines}</td>
                      <td>{record.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="score-history-footer">
              <button
                className={`score-history-clear-btn${confirmClear ? ' confirming' : ''}`}
                onClick={() => {
                  if (confirmClear) {
                    clearScoreHistory();
                    setConfirmClear(false);
                  } else {
                    setConfirmClear(true);
                  }
                }}
              >
                {confirmClear ? '⚠️ 确定清除？' : '🗑️ 清除记录'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScoreHistory;
