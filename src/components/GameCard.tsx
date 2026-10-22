import React from 'react';
import { Smartphone, Monitor, Tv, Star, Play, Download, Bookmark, Zap } from 'lucide-react';
import { Game } from '../types/game';

interface Props {
  game: Game;
  onSelectGame: (game: Game) => void;
  onPlayInstant: (game: Game) => void;
  isBookmarked: boolean;
  onToggleBookmark: (gameId: string) => void;
}

export const GameCard: React.FC<Props> = ({
  game,
  onSelectGame,
  onPlayInstant,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <div className="group relative bg-[#0d121f] rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/20 flex flex-col overflow-hidden text-right">
      {/* Thumbnail Banner */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={game.coverImage}
          alt={game.titleAr}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between pointer-events-none">
          {/* Free Badge */}
          <span className="text-[11px] font-black bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
            مجاناً 100%
          </span>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(game.id);
            }}
            className="pointer-events-auto w-8 h-8 rounded-lg bg-black/60 backdrop-blur hover:bg-black/90 text-slate-300 hover:text-amber-400 flex items-center justify-center transition border border-white/10"
            title={isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Browser Instant Play Badge */}
        {game.isPlayableInBrowser && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>لعب فوري بالمتصفح</span>
          </div>
        )}
      </div>

      {/* Card Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Clean Unboxed Metadata Line (Frontend Constitution compliant) */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
            <span className="text-cyan-400 font-medium">{game.genreAr}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{game.size}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-0.5 text-amber-300">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{game.rating}</span>
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectGame(game)}
            className="font-bold text-white text-base leading-snug hover:text-cyan-400 transition cursor-pointer line-clamp-1"
          >
            {game.titleAr}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {game.descriptionAr}
          </p>
        </div>

        {/* Supported Electronic Devices Indicator */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[11px]">الأجهزة:</span>
            <div className="flex items-center gap-1 text-slate-300">
              {game.devices.includes('mobile') && (
                <span title="الهاتف الذكي (Mobile)" className="hover:text-cyan-400 transition">
                  <Smartphone className="w-3.5 h-3.5" />
                </span>
              )}
              {game.devices.includes('pc') && (
                <span title="الكمبيوتر (PC)" className="hover:text-cyan-400 transition">
                  <Monitor className="w-3.5 h-3.5" />
                </span>
              )}
              {game.devices.includes('console') && (
                <span title="أجهزة الكونسول (PlayStation/Xbox)" className="hover:text-cyan-400 transition">
                  <Tv className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>

          <span className="text-[10px] text-slate-500 font-mono">
            {game.downloadsCount} لاعب
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex items-center gap-2">
          {game.isPlayableInBrowser ? (
            <button
              onClick={() => onPlayInstant(game)}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>العب الآن فورا</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectGame(game)}
              className="flex-1 py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل وتشغيل مجاني</span>
            </button>
          )}

          <button
            onClick={() => onSelectGame(game)}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition text-xs font-semibold"
            title="التفاصيل ومتطلبات التشغيل"
          >
            التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
};
