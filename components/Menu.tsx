
import React from 'react';

interface MenuProps {
  onStart: () => void;
  highScore: number;
}

const Menu: React.FC<MenuProps> = ({ onStart, highScore }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-50 backdrop-blur-sm">
      <div className="text-center p-10 rounded-3xl border-4 border-yellow-500 bg-slate-900 shadow-[0_0_60px_rgba(234,179,8,0.2)] max-w-lg">
        <h1 className="text-6xl font-game text-white mb-2 tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          JACKIE <span className="text-yellow-500">STUNT</span>
        </h1>
        <p className="text-yellow-200 font-bold mb-8 uppercase tracking-[0.3em] text-xs">Express Railway Chase</p>
        
        <div className="mb-10 bg-slate-800/50 py-4 rounded-xl border border-slate-700">
          <p className="text-slate-500 uppercase text-[10px] font-black mb-1 tracking-widest">Global Ranking High Score</p>
          <p className="text-5xl font-game text-white">{highScore}</p>
        </div>

        <button
          onClick={onStart}
          className="group relative px-16 py-5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-game text-2xl rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_8px_0_rgb(161,98,7)] mb-4"
        >
          ACTION!
        </button>

        <div className="mt-8 flex justify-center gap-6">
          <div className="text-center">
            <kbd className="bg-slate-700 px-3 py-1 rounded text-white font-bold block mb-1">A/D</kbd>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Dodge</span>
          </div>
          <div className="text-center">
            <kbd className="bg-slate-700 px-3 py-1 rounded text-white font-bold block mb-1">W</kbd>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Vault</span>
          </div>
          <div className="text-center">
            <kbd className="bg-slate-700 px-3 py-1 rounded text-white font-bold block mb-1">S</kbd>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Slide</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
