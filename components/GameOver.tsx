
import React from 'react';

interface GameOverProps {
  score: number;
  highScore: number;
  commentary: string;
  loadingCommentary: boolean;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, highScore, commentary, loadingCommentary, onRestart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 backdrop-blur-lg">
      <div className="text-center max-w-lg px-6">
        <div className="relative inline-block mb-4">
          <h2 className="text-7xl font-game text-white mb-0 italic tracking-tighter">
            WASTED!
          </h2>
          <div className="absolute -bottom-2 left-0 right-0 h-2 bg-yellow-500 transform -skew-x-12"></div>
        </div>
        
        <p className="text-slate-400 font-bold uppercase tracking-widest mb-8">Stunt Fail - Scene 42</p>
        
        <div className="bg-slate-900/80 p-8 rounded-3xl border-2 border-slate-800 mb-10 shadow-2xl">
          <div className="flex justify-around items-center mb-6">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Distance</p>
              <p className="text-4xl font-game text-white">{score}m</p>
            </div>
            <div className="h-10 w-px bg-slate-800"></div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Best Take</p>
              <p className="text-3xl font-game text-yellow-500">{highScore}m</p>
            </div>
          </div>

          <div className="relative min-h-[80px] flex items-center justify-center text-center">
            {loadingCommentary ? (
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
              </div>
            ) : (
              <p className="text-xl font-medium text-slate-300 italic px-4 leading-relaxed">"{commentary}"</p>
            )}
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-16 py-5 bg-white text-slate-950 font-game text-2xl rounded-xl hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_0_rgb(200,200,200)]"
        >
          NEXT TAKE
        </button>
      </div>
    </div>
  );
};

export default GameOver;
