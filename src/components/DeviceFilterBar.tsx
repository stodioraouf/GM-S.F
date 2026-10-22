import React from 'react';
import {
  Smartphone,
  Monitor,
  Tv,
  Globe,
  Sparkles,
  Flame,
  Star,
  PlayCircle,
  Swords,
  Compass,
  Trophy,
  Puzzle,
  Crosshair,
  Car,
  Zap,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { DeviceType, GameGenre } from '../types/game';

interface Props {
  selectedDevice: DeviceType | 'all';
  onSelectDevice: (device: DeviceType | 'all') => void;
  selectedGenre: GameGenre | 'all';
  onSelectGenre: (genre: GameGenre | 'all') => void;
  onlyPlayable: boolean;
  onToggleOnlyPlayable: () => void;
  sortBy: 'popular' | 'rating' | 'downloads';
  onSortChange: (sort: 'popular' | 'rating' | 'downloads') => void;
  totalGamesCount: number;
  genreCounts?: Record<string, number>;
}

export const DeviceFilterBar: React.FC<Props> = ({
  selectedDevice,
  onSelectDevice,
  selectedGenre,
  onSelectGenre,
  onlyPlayable,
  onToggleOnlyPlayable,
  sortBy,
  onSortChange,
  totalGamesCount,
  genreCounts = {},
}) => {
  // Electronic Devices List
  const devicesList: { id: DeviceType | 'all'; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'all', label: 'جميع الأجهزة', icon: <Globe className="w-4 h-4" />, desc: 'تصفح كل الألعاب' },
    { id: 'mobile', label: 'الهواتف الذكية (Mobile)', icon: <Smartphone className="w-4 h-4" />, desc: 'أندرويد وآيفون' },
    { id: 'pc', label: 'أجهزة الكمبيوتر (PC)', icon: <Monitor className="w-4 h-4" />, desc: 'ويندوز وماك' },
    { id: 'console', label: 'أجهزة الكونسول (Console)', icon: <Tv className="w-4 h-4" />, desc: 'PS5 و Xbox و Switch' },
  ];

  // Specific Game Categories requested: أكشن، مغامرات، رياضة، ألغاز، إلخ.
  const categoriesList: {
    id: GameGenre | 'all';
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    activeClass: string;
  }[] = [
    {
      id: 'all',
      label: 'كل الفئات',
      icon: <Layers className="w-4 h-4" />,
      colorClass: 'text-slate-300',
      activeClass: 'bg-cyan-500 text-slate-950 shadow-cyan-500/25',
    },
    {
      id: 'action',
      label: 'أكشن',
      icon: <Swords className="w-4 h-4" />,
      colorClass: 'text-rose-400',
      activeClass: 'bg-rose-500 text-white shadow-rose-500/25',
    },
    {
      id: 'adventure',
      label: 'مغامرات',
      icon: <Compass className="w-4 h-4" />,
      colorClass: 'text-amber-400',
      activeClass: 'bg-amber-500 text-slate-950 shadow-amber-500/25',
    },
    {
      id: 'sports',
      label: 'رياضة',
      icon: <Trophy className="w-4 h-4" />,
      colorClass: 'text-emerald-400',
      activeClass: 'bg-emerald-500 text-slate-950 shadow-emerald-500/25',
    },
    {
      id: 'puzzle',
      label: 'ألغاز',
      icon: <Puzzle className="w-4 h-4" />,
      colorClass: 'text-purple-400',
      activeClass: 'bg-purple-500 text-white shadow-purple-500/25',
    },
    {
      id: 'battle_royale',
      label: 'باتل رويال',
      icon: <Crosshair className="w-4 h-4" />,
      colorClass: 'text-red-400',
      activeClass: 'bg-red-500 text-white shadow-red-500/25',
    },
    {
      id: 'racing',
      label: 'سباق',
      icon: <Car className="w-4 h-4" />,
      colorClass: 'text-sky-400',
      activeClass: 'bg-sky-500 text-slate-950 shadow-sky-500/25',
    },
    {
      id: 'arcade',
      label: 'أركيد وفوري',
      icon: <Zap className="w-4 h-4" />,
      colorClass: 'text-cyan-400',
      activeClass: 'bg-cyan-400 text-slate-950 shadow-cyan-400/25',
    },
  ];

  const activeCategory = categoriesList.find((c) => c.id === selectedGenre);

  return (
    <div className="space-y-4 mb-6">
      {/* 1. Primary Device Filter Selector */}
      <div className="bg-[#0b101c] p-2.5 sm:p-3 rounded-2xl border border-slate-800">
        <div className="text-xs text-slate-400 mb-2 px-1 flex items-center justify-between">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>قائمة الأجهزة الإلكترونية المدعومة:</span>
          </span>
          <span className="text-slate-400 text-[11px] font-mono">{totalGamesCount} لعبة متاحة</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {devicesList.map((d) => {
            const isActive = selectedDevice === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onSelectDevice(d.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-right transition group cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                    isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-cyan-400 group-hover:scale-105'
                  }`}
                >
                  {d.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {d.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{d.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Categorization by Genres (أكشن، مغامرات، رياضة، ألغاز، إلخ) */}
      <div className="bg-[#090e18] p-3 rounded-2xl border border-cyan-500/20 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-white">تصنيف وفئات الألعاب:</span>
            {selectedGenre !== 'all' && (
              <span className="text-[11px] text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span>تصفية: {activeCategory?.label}</span>
                <button
                  onClick={() => onSelectGenre('all')}
                  className="hover:text-rose-300 mr-1 cursor-pointer font-bold"
                  title="إلغاء تصفية الفئة"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          {selectedGenre !== 'all' && (
            <button
              onClick={() => onSelectGenre('all')}
              className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إظهار جميع الفئات</span>
            </button>
          )}
        </div>

        {/* Categories Button Grid / Ribbon */}
        <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-1.5 sm:gap-2">
          {categoriesList.map((cat) => {
            const isCatActive = selectedGenre === cat.id;
            const count = cat.id === 'all' ? totalGamesCount : genreCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectGenre(cat.id)}
                className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border text-center transition cursor-pointer group active:scale-95 ${
                  isCatActive
                    ? `${cat.activeClass} font-bold shadow-lg border-transparent`
                    : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
                title={`ألعاب ${cat.label} (${count})`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 transition ${
                    isCatActive
                      ? 'bg-black/20 text-current'
                      : `bg-slate-800/90 ${cat.colorClass} group-hover:scale-110`
                  }`}
                >
                  {cat.icon}
                </div>
                <span className="text-xs font-semibold whitespace-nowrap truncate w-full">
                  {cat.label}
                </span>
                <span
                  className={`text-[10px] font-mono mt-0.5 ${
                    isCatActive ? 'opacity-85' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  {count} {count === 1 ? 'لعبة' : 'ألعاب'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Utility Bar: Instant Playable in browser toggle & Sort dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleOnlyPlayable}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              onlyPlayable
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>ألعاب فورية تعمل بالمتصفح فقط</span>
          </button>

          {onlyPlayable && (
            <span className="text-[11px] text-emerald-400">بدون أي تحميل</span>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <span className="text-slate-400 text-[11px]">ترتيب حسب:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'popular' | 'rating' | 'downloads')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="popular">الأكثر شعبية 🔥</option>
            <option value="rating">الأعلى تقييماً ⭐</option>
            <option value="downloads">الأكثر تحميلاً 📥</option>
          </select>
        </div>
      </div>
    </div>
  );
};
