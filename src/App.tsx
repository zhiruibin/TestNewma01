import React, { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import { useUIStore } from './store/uiStore';
import { useAudioStore } from './store/audioStore';
import GameBoard from './components/game/GameBoard';
import NextBlock from './components/game/NextBlock';
import HoldBlock from './components/game/HoldBlock';
import ScoreBoard from './components/game/ScoreBoard';
import MainMenu from './components/ui/MainMenu';
import PauseMenu from './components/ui/PauseMenu';
import GameOver from './components/ui/GameOver';
import Settings from './components/ui/Settings';
import ScoreHistory from './components/ui/ScoreHistory';
import './styles/App.css';

const App: React.FC = () => {
  const {
    status,
    score,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    hold,
  } = useGameStore();

  const { showSettings, setShowSettings, showScoreHistory, setShowScoreHistory } = useUIStore();
const { playSfx, playMusic, stopMusic } = useAudioStore();

  const gameBoardRef = useRef(null);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showSettings) return;
      if (status === 'paused') {
        if (e.code === 'Escape') {
          e.preventDefault();
          resumeGame();
          playSfx('pause');
        }
        return;
      }
        switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
moveLeft();
playSfx('move');
          break;

        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
moveRight();
playSfx('move');
          break;

        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          moveDown();
          playSfx('move');
          break;
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
            rotate(true);
            playSfx('rotate');
break;

        case 'KeyZ':
        case 'KeyJ':
          e.preventDefault();
            rotate(false);
            playSfx('rotate');
          break;

        case 'Space':
          e.preventDefault();
          if (status === 'playing') {
            hardDrop();
            playSfx('drop');
          }
          break;

        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyC':
          e.preventDefault();
hold();
            playSfx('hold');
          break;

        case 'Escape':
          e.preventDefault();
          if (status === 'playing') {
            pauseGame();
            playSfx('pause');
          } else if (status === 'paused') {
            resumeGame();
            playSfx('pause');
          }
          break;


        default:
          break;
      }
    },
    [
      status,
      showSettings,
      moveLeft,
      moveRight,
      moveDown,
      rotate,
hold,
      hardDrop,
      pauseGame,
      resumeGame,
      startGame,
      playSfx,
      playMusic,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (status === 'gameover') {
      stopMusic();
    }
}, [status, stopMusic]);

  const handleStartGame = () => {
    startGame();
    playMusic();
  };


return (
    <div className="app-container">
      {/* Header */}
      {/* Header */}
      <header className="app-header">
        <h1>TETRIS</h1>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </header>

      {/* Main Game Area */}
      <div className="game-container">
        {/* Left Panel - Hold Block */}
        <div className="left-panel">
<HoldBlock />
          <div className="controls-info">
            <h3>Controls</h3>
            <p>← → : Move</p>
            <p>↑ : Rotate</p>
            <p>↓ : Soft Drop</p>
            <p>Space : Hard Drop</p>
            <p>Shift/C : Hold</p>
            <p>Esc : Pause</p>
          </div>
        </div>

        {/* Center - Game Board */}
        <div className="center-panel">
          <GameBoard ref={gameBoardRef} />
        </div>

        {/* Right Panel - Next Block & Score */}
        <div className="right-panel">
          <NextBlock />
          <ScoreBoard />
        </div>
      </div>

      {/* Overlays */}
      {status === 'idle' && (
        <MainMenu onStartGame={handleStartGame} onOpenSettings={() => setShowSettings(true)} onOpenScoreHistory={() => setShowScoreHistory(true)} />
      )}
      {status === 'paused' && (
        <PauseMenu
          onResume={resumeGame}
          onRestart={() => {
            resetGame();
            startGame();
            playMusic();
          }}
          onQuitToMenu={() => {
            resetGame();
          }}
        />
      )}

      {status === 'gameover' && (
        <GameOver
          onRestart={() => {
            resetGame();
            startGame();
            playMusic();
          }}
          onMainMenu={() => {
            resetGame();
          }}
          onOpenScoreHistory={() => setShowScoreHistory(true)}
        />
      )}

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
      {showScoreHistory && (
          <ScoreHistory />
      )}
</div>
  );
};

export default App;