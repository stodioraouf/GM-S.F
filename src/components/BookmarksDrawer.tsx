import React from 'react';
import { X, Bookmark, Play, Trash2, ArrowRight } from 'lucide-react';
import { Game } from '../types/game';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedGames: Game[];
  onSelectGame: (game: Game) => void;
  onPlayInstant: (game: Game) => void;
  onRemoveBookmark: (gameId: string) => void;
}

export const BookmarksDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  bookmarkedGames,
  onSelectGame,
  onPlayInstant,
  onRemoveBookmark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in text-right">
      <div className="relative w-full max-w-md bg-[#0b101c] border-r border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 bg-[#0e1424] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">ألعابي المفضلة ({bookmarkedGames.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Games List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {bookmarkedGames.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
              <p className="text-sm font-semibold">لم تقم بحفظ أي ألعاب بعد</p>
              <p className="text-xs text-slate-500 mt-1">اضغط على أيقونة الإشارة المرجعية بأي بطاقة لإضافتها هنا للوصول السريع.</p>
            </div>
          ) : (
            bookmarkedGames.map((game) => (
              <div
                key={game.id}
                className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition flex items-center gap-3 group"
              >
                <img
                  src={game.coverImage}
                  alt={game.titleAr}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-xs truncate group-hover:text-cyan-400 transition">
                    {game.titleAr}
                  </h4>
                  <span className="text-[10px] text-slate-400 block">{game.genreAr} · {game.size}</span>
                  <div className="flex items-center gap-2 mt-2">
                    {game.isPlayableInBrowser ? (
                      <button
                        onClick={() => {
                          onClose();
                          onPlayInstant(game);
                        }}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded-lg flex items-center gap-1 transition"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>لعب</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onClose();
                          onSelectGame(game);
                        }}
                        className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black font-bold text-[10px] rounded-lg transition"
                      >
                        التفاصيل
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveBookmark(game.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition"
                  title="حذف من المفضلة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0e1424] border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
          >
            إغلاق المفضلة
          </button>
        </div>
      </div>
    </div>
  );
};
