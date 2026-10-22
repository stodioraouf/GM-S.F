import React from 'react';
import { Play, ShieldCheck, Smartphone, Monitor, Tv, Flame, Sparkles, Check } from 'lucide-react';

interface Props {
  onQuickPlay: () => void;
  onOpenAntiBot: () => void;
  onSelectDevice: (device: 'mobile' | 'pc' | 'console' | 'all') => void;
  isVerified: boolean;
}

export const HeroBanner: React.FC<Props> = ({
  onQuickPlay,
  onOpenAntiBot,
  onSelectDevice,
  isVerified,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1628] via-[#090e1c] to-[#060912] border border-cyan-500/30 p-6 sm:p-10 mb-8 shadow-2xl shadow-cyan-950/30">
      {/* Decorative cyber grid and glow */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Column Text & CTAs */}
        <div className="flex-1 text-right space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>منصة الألعاب الأولى بنظام الحماية الذكي GM S.F</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            كل ألعابك المفضلة <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
              مجاناً 100% وبدون قيود
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            استمتع بأشهر ألعاب الهواتف والكمبيوتر والكونسول، من صبواي وببجي وفري فاير إلى ألعاب الأركيد الفورية. محمي بحصن أمني ذكي للتحقق من البشر ومنع البوتات المزعجة.
          </p>

          {/* Device Quick Switcher Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
            <span className="text-slate-400 ml-1">اختر جهازك:</span>
            <button
              onClick={() => onSelectDevice('mobile')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 transition"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>ألعاب الهواتف (موبايل)</span>
            </button>
            <button
              onClick={() => onSelectDevice('pc')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 transition"
            >
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>ألعاب الكمبيوتر (PC)</span>
            </button>
            <button
              onClick={() => onSelectDevice('console')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 transition"
            >
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              <span>أجهزة الكونسول (Console)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onQuickPlay}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/30 transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>العب Cyber Subway Surfer فورا</span>
            </button>

            <button
              onClick={onOpenAntiBot}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border text-xs sm:text-sm font-bold transition ${
                isVerified
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-900/80 border-cyan-500/40 text-cyan-300 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isVerified ? 'تصريح الإنسان البشري مفعل ✅' : 'فحص الحماية ومنع البوتات (GM Shield)'}</span>
            </button>
          </div>
        </div>

        {/* Right Column Highlights / Mini Feature Card */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>نظام حماية GM S.F Sentinel</span>
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                ONLINE
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>كل الألعاب مجانية بدون اشتراكات</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>حظر تلقائي للبوتات وبرامج التخمين</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ألعاب فورية تعمل بمتصفح الهاتف والكمبيوتر</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>دعم كامل لأجهزة الكونسول وأيدي التحكم</span>
              </div>
            </div>

            <div className="p-3 bg-[#080d17] rounded-xl border border-cyan-500/20 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">البوتات المحظورة خلال 24 ساعة</div>
              <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">14,291 Bot</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
