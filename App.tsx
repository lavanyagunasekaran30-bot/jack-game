
import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import GameEngine from './components/GameEngine';
import Menu from './components/Menu';
import GameOver from './components/GameOver';
import { getGameOverCommentary } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snowdash_highscore') || '0');
  });
  const [commentary, setCommentary] = useState<string>('');
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  const handleGameOver = useCallback(async (finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('snowdash_highscore', finalScore.toString());
    }
    setGameState(GameState.GAME_OVER);
    
    setLoadingCommentary(true);
    const text = await getGameOverCommentary(finalScore);
    setCommentary(text);
    setLoadingCommentary(false);
  }, [highScore]);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setCommentary('');
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden select-none">
      {gameState === GameState.MENU && (
        <Menu onStart={startGame} highScore={highScore} />
      )}

      {gameState === GameState.PLAYING && (
        <GameEngine onGameOver={handleGameOver} />
      )}

      {gameState === GameState.GAME_OVER && (
        <GameOver 
          score={score} 
          highScore={highScore} 
          commentary={commentary}
          loadingCommentary={loadingCommentary}
          onRestart={startGame} 
        />
      )}
    </div>
  );
};

export default App;
