import React from 'react';
import { X, Maximize2, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { Game } from '../types/game';
import { CyberRunnerGame } from './playable/CyberRunnerGame';
import { SpaceShooterGame } from './playable/SpaceShooterGame';
import { Cyber2048Game } from './playable/Cyber2048Game';
import { ArcadeSpeedway } from './playable/ArcadeSpeedway';

interface Props {
  game: Game | null;
  onClose: () => void;
}

export const PlayableGameModal: React.FC<Props> = ({ game, onClose }) => {
  if (!game) return null;

  const renderGameContent = () => {
    switch (game.playableGameId) {
      case 'cyber-runner':
        return <CyberRunnerGame onClose={onClose} />;
      case 'space-shooter':
        return <SpaceShooterGame onClose={onClose} />;
      case 'cyber-2048':
        return <Cyber2048Game onClose={onClose} />;
      case 'arcade-speedway':
        return <ArcadeSpeedway onClose={onClose} />;
      default:
        return <CyberRunnerGame onClose={onClose} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#090d17] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top bar with quick instructions */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#0d1424] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              جلسة لعب حية: {game.titleAr}
            </h3>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800 hidden sm:inline">
              سيرفرات GM S.F فائقة السرعة
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> لمس الهواتف مدعوم
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" /> كيبورد وماوس
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-white transition"
              title="خروج من اللعبة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Container */}
        <div className="p-3 sm:p-6 overflow-y-auto flex items-center justify-center min-h-[500px]">
          {renderGameContent()}
        </div>
      </div>
    </div>
  );
};
