// 导入 React 和必要的钩子
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import './PauseMenu.css';

interface PauseMenuProps {
  // 暂停菜单组件属性接口定义
  onResume: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
}

// 暂停菜单组件，显示游戏暂停时的选项
// 暂停菜单组件，显示游戏暂停时的选项
export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onQuitToMenu,
}) => {
  const { score, level, lines } = useGameStore();
  const [selectedOption, setSelectedOption] = React.useState(0);
  const optionsCount = 3;

  // 用 ref 稳定回调引用，避免 useEffect 反复重挂监听器
  const callbacksRef = React.useRef({ onResume, onRestart, onQuitToMenu });
  callbacksRef.current = { onResume, onRestart, onQuitToMenu };
  const selectedOptionRef = React.useRef(selectedOption);
  selectedOptionRef.current = selectedOption;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedOption(prev => (prev - 1 + optionsCount) % optionsCount);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedOption(prev => (prev + 1) % optionsCount);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const { onResume: resume, onRestart: restart, onQuitToMenu: quit } = callbacksRef.current;
        if (selectedOptionRef.current === 0) resume();
        else if (selectedOptionRef.current === 1) restart();
        else if (selectedOptionRef.current === 2) quit();
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        callbacksRef.current.onResume();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
return (
    <div className="pause-menu menu-overlay">
      <div className="menu-content">
        <h2>游戏暂停</h2>
        
        <div className="stats">
          <div className="stat-item">
            <span>分数</span>
            <span>{score.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span>等级</span>
            <span>{level}</span>
          </div>
          <div className="stat-item">
            <span>消除行数</span>
            <span>{lines}</span>
          </div>
        </div>

        <div className="buttons">
          <button
            className={selectedOption === 0 ? 'selected' : ''}
            onClick={onResume}
            onKeyDown={(e) => e.preventDefault()}
          >
            继续游戏
          </button>
          <button
            className={selectedOption === 1 ? 'selected' : ''}
            onClick={onRestart}
            onKeyDown={(e) => e.preventDefault()}
          >
            重新开始
          </button>
          <button
            className={selectedOption === 2 ? 'selected' : ''}
            onClick={onQuitToMenu}
            onKeyDown={(e) => e.preventDefault()}
          >
            返回主菜单
          </button>
        </div>

        <p className="hint">按 P 键或 ESC 键继续游戏</p>
      </div>
    </div>
  );
};

export default PauseMenu;