import React from 'react';
import { Gamepad2, ShieldCheck, ShieldAlert, Search, Bookmark, Smartphone, Monitor, Tv, Flame } from 'lucide-react';
import { DeviceType, HumanVerificationState } from '../types/game';

interface Props {
  selectedDevice: DeviceType | 'all';
  onSelectDevice: (device: DeviceType | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  verificationState: HumanVerificationState;
  onOpenAntiBot: () => void;
  onOpenSecurityCenter: () => void;
  bookmarkedCount: number;
  onOpenBookmarks: () => void;
}

export const Navbar: React.FC<Props> = ({
  selectedDevice,
  onSelectDevice,
  searchQuery,
  onSearchChange,
  verificationState,
  onOpenAntiBot,
  onOpenSecurityCenter,
  bookmarkedCount,
  onOpenBookmarks,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectDevice('all')}
            className="flex items-center gap-2.5 text-right group transition focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition">
              <Gamepad2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-gaming font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                  GM S.F
                </span>
                <span className="text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-1.5 py-0.2 rounded">
                  مجاناً
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">منصة الألعاب الذكية وحماية البوتات</p>
            </div>
          </button>
        </div>

        {/* Quick Device Segmented Controls */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => onSelectDevice('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              selectedDevice === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>الكل</span>
          </button>

          <button
            onClick={() => onSelectDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              selectedDevice === 'mobile'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>الهواتف</span>
          </button>

          <button
            onClick={() => onSelectDevice('pc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              selectedDevice === 'pc'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>الكمبيوتر</span>
          </button>

          <button
            onClick={() => onSelectDevice('console')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              selectedDevice === 'console'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>الكونسول</span>
          </button>
        </nav>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن لعبة (صبواي، ببجي، ماين كرافت...)"
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 text-white text-xs rounded-xl pr-9 pl-3 py-2 placeholder-slate-500 focus:outline-none transition shadow-inner"
          />
        </div>

        {/* Action Buttons: Anti-Bot Shield & Bookmarks */}
        <div className="flex items-center gap-2">
          {/* Smart Anti-Bot Human Badge */}
          <button
            onClick={onOpenAntiBot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              verificationState.isVerified
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900/60 shadow-sm'
                : 'bg-amber-950/60 text-amber-300 border-amber-600/50 hover:bg-amber-900/60 animate-pulse'
            }`}
            title="حالة التحقق البشري ونظام الحماية"
          >
            {verificationState.isVerified ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">تحقق بشري: موثق ✅</span>
                <span className="sm:hidden">موثق</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">فحص الحماية الذكي</span>
                <span className="sm:hidden">الحماية</span>
              </>
            )}
          </button>

          {/* Security Center Open */}
          <button
            onClick={onOpenSecurityCenter}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-xl border border-slate-800 transition hidden md:flex items-center"
            title="فتح لوحة مراقبة البوتات GM Shield"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            className="relative p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition"
            title="ألعابي المفضلة"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            {bookmarkedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {bookmarkedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
