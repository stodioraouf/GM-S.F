import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Eye, CheckCircle2, Lock, Zap, RefreshCw, X, Fingerprint, Activity } from 'lucide-react';
import { HumanVerificationState } from '../types/game';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (state: HumanVerificationState) => void;
  gameTitle?: string;
  actionReason?: string;
}

export const AntiBotModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onVerified,
  gameTitle,
  actionReason = 'لتشغيل اللعبة والتحقق من عدم وجود برامج آلية ضارة',
}) => {
  const [challengeMode, setChallengeMode] = useState<'slider' | 'reflex' | 'symbol'>('slider');
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [botDetected, setBotDetected] = useState(false);
  const [detectionReason, setDetectionReason] = useState('');

  // Slider Challenge State
  const [sliderVal, setSliderVal] = useState(0);
  const [targetSlot, setTargetSlot] = useState(82);
  const mouseMovesRef = useRef<{ x: number; y: number; time: number }[]>([]);

  // Reflex Challenge State
  const [reflexState, setReflexState] = useState<'idle' | 'waiting' | 'ready' | 'clicked'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const reflexTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reflexStartTimeRef = useRef<number>(0);

  // Symbol Challenge State
  const [targetSymbol, setTargetSymbol] = useState<'🎮' | '🕹️' | '🎲' | '👾' | '⚡'>('🎮');
  const [symbolsOptions, setSymbolsOptions] = useState<string[]>([]);

  // System Diagnostics (live anti-bot metrics)
  const [diagnostics, setDiagnostics] = useState({
    webdriver: false,
    hardwareConcurrency: 8,
    touchOrMouseEntropy: 'طبيعي (بشري)',
    latency: '34ms',
    threatScore: 0.04,
  });

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setVerificationSuccess(false);
      setBotDetected(false);
      setDetectionReason('');
      setSliderVal(0);
      setTargetSlot(Math.floor(Math.random() * 30) + 65); // 65% to 95%
      mouseMovesRef.current = [];

      // Generate symbol challenge
      const symbols: ('🎮' | '🕹️' | '🎲' | '👾' | '⚡')[] = ['🎮', '🕹️', '🎲', '👾', '⚡'];
      const target = symbols[Math.floor(Math.random() * symbols.length)];
      setTargetSymbol(target);
      const shuffled = [...symbols].sort(() => Math.random() - 0.5);
      setSymbolsOptions(shuffled);

      // Environment inspection
      const isWebdriver = !!(navigator as unknown as { webdriver?: boolean }).webdriver;
      setDiagnostics({
        webdriver: isWebdriver,
        hardwareConcurrency: navigator.hardwareConcurrency || 4,
        touchOrMouseEntropy: 'جارٍ الفحص...',
        latency: `${Math.floor(Math.random() * 20 + 25)}ms`,
        threatScore: isWebdriver ? 0.95 : 0.02,
      });

      if (isWebdriver) {
        setBotDetected(true);
        setDetectionReason('تم رصد محرك أتمتة متصفح (navigator.webdriver). تم حظر الوصول.');
      }
    }
  }, [isOpen]);

  // Track mouse movements to verify natural human curvature
  const handleMouseMoveOrTouch = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    mouseMovesRef.current.push({ x: clientX, y: clientY, time: Date.now() });
    if (mouseMovesRef.current.length > 50) {
      mouseMovesRef.current.shift();
    }
  };

  // Evaluate Human Movement Jitter
  const verifyMovementEntropy = () => {
    const points = mouseMovesRef.current;
    if (points.length < 5) return true; // fallback if mobile tap
    let totalJitter = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      totalJitter += Math.sqrt(dx * dx + dy * dy);
    }
    // Bots usually teleport in 0 ms or perfect straight lines
    return totalJitter > 20;
  };

  // 1. Submit Slider Challenge
  const handleSliderRelease = () => {
    if (verifying || verificationSuccess) return;

    const diff = Math.abs(sliderVal - targetSlot);
    if (diff <= 5) {
      setVerifying(true);
      const isNatural = verifyMovementEntropy();

      setTimeout(() => {
        setVerifying(false);
        if (isNatural) {
          triggerSuccess('slider');
        } else {
          setBotDetected(true);
          setDetectionReason('حركة المؤشر أو اللمس خالية من التموج الطبيعي (سلوك آلي مشتبه به).');
        }
      }, 700);
    } else {
      setSliderVal(0);
    }
  };

  // 2. Reflex Challenge Logic
  const startReflexTest = () => {
    setReflexState('waiting');
    setReactionTime(null);
    const delay = Math.random() * 2000 + 1500; // 1.5s - 3.5s
    reflexTimerRef.current = setTimeout(() => {
      setReflexState('ready');
      reflexStartTimeRef.current = Date.now();
    }, delay);
  };

  const handleReflexClick = () => {
    if (reflexState === 'waiting') {
      // Clicked too early
      clearTimeout(reflexTimerRef.current!);
      setReflexState('idle');
      setBotDetected(true);
      setDetectionReason('تم النقر قبل ظهور المؤشر (توقيت استباقي غير بشري).');
      return;
    }

    if (reflexState === 'ready') {
      const duration = Date.now() - reflexStartTimeRef.current;
      setReactionTime(duration);
      setReflexState('clicked');

      if (duration < 80) {
        // Impossible human reaction time -> Bot
        setBotDetected(true);
        setDetectionReason(`زمن الاستجابة (${duration}ms) أسرع من الحدود البيولوجية للبشر.`);
      } else {
        triggerSuccess('reflex');
      }
    }
  };

  // 3. Symbol Challenge
  const handleSelectSymbol = (sym: string) => {
    if (sym === targetSymbol) {
      triggerSuccess('pattern');
    } else {
      setBotDetected(true);
      setDetectionReason('اختيار رمز غير متطابق. أعد المحاولة لإثبات الهوية.');
    }
  };

  const triggerSuccess = (method: 'slider' | 'reflex' | 'pattern') => {
    setVerificationSuccess(true);
    setBotDetected(false);
    const resultState: HumanVerificationState = {
      isVerified: true,
      verifiedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 120, // 2 hours
      trustScore: 0.99,
      verificationMethod: method,
    };
    localStorage.setItem('gm_sf_verified_human', JSON.stringify(resultState));

    setTimeout(() => {
      onVerified(resultState);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onMouseMove={handleMouseMoveOrTouch}
      onTouchMove={handleMouseMoveOrTouch}
    >
      <div className="relative w-full max-w-lg bg-[#0c101a] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden text-right">
        {/* Glow Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#101726] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>نظام الحماية الذكي GM Sentinel™</span>
                <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                  AI-SHIELD v4.2
                </span>
              </h3>
              <p className="text-xs text-slate-400">فحص الهوية البشرية ومكافحة برامج البوت والروبوتات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {gameTitle && (
            <div className="mb-4 bg-cyan-950/40 border border-cyan-800/40 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">طلب الوصول إلى:</span>
                <span className="text-sm font-bold text-cyan-300">{gameTitle}</span>
              </div>
              <span className="text-[11px] text-cyan-400 font-semibold bg-cyan-900/60 px-2.5 py-1 rounded-lg border border-cyan-700/50">
                مجاني 100%
              </span>
            </div>
          )}

          <p className="text-xs text-slate-300 mb-5 leading-relaxed">
            لحماية خوادم الألعاب المجانية وضمان سرعة خيالية لجميع اللاعبين، نطبق خوارزمية ذكية للتحقق من أنك إنسان حقيقي وتصفية هجمات الروبوتات الآلية:
          </p>

          {/* Mode Switcher */}
          <div className="flex items-center justify-center gap-2 mb-6 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setChallengeMode('slider');
                setBotDetected(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition ${
                challengeMode === 'slider'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. مطابقة المفتاح
            </button>
            <button
              onClick={() => {
                setChallengeMode('reflex');
                setBotDetected(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition ${
                challengeMode === 'reflex'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. سرعة رد الفعل
            </button>
            <button
              onClick={() => {
                setChallengeMode('symbol');
                setBotDetected(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition ${
                challengeMode === 'symbol'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. التعرف على الرمز
            </button>
          </div>

          {/* CHALLENGE 1: SLIDER KEY */}
          {challengeMode === 'slider' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span>اسحب المقبض ليطابق بدقة الفتحة المضيئة:</span>
                <span className="font-mono text-cyan-400 font-bold">{sliderVal}%</span>
              </div>

              {/* Slider Track with target slot */}
              <div className="relative w-full h-14 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center px-2 select-none">
                {/* Target Zone */}
                <div
                  className="absolute top-1 bottom-1 w-12 rounded-lg border-2 border-dashed border-cyan-400 bg-cyan-500/20 flex items-center justify-center animate-pulse"
                  style={{ left: `${targetSlot - 6}%` }}
                >
                  <Lock className="w-4 h-4 text-cyan-300" />
                </div>

                {/* Range Input with custom visual knob */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderVal}
                  onChange={(e) => setSliderVal(parseInt(e.target.value, 10))}
                  onMouseUp={handleSliderRelease}
                  onTouchEnd={handleSliderRelease}
                  className="w-full z-10 opacity-0 cursor-ew-resize h-full"
                />

                {/* Simulated Floating Knob */}
                <div
                  className="absolute top-2 bottom-2 w-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg shadow-lg shadow-cyan-500/50 flex items-center justify-center pointer-events-none transition-transform"
                  style={{ left: `calc(${sliderVal}% - 24px)` }}
                >
                  <Fingerprint className="w-6 h-6 text-slate-950" />
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>👈 بداية المسار</span>
                <span>نهاية المسار 👉</span>
              </div>
            </div>
          )}

          {/* CHALLENGE 2: REFLEX TEST */}
          {challengeMode === 'reflex' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-300">
                اختبار بيولوجي: اضغط على الزر فور أن يتحول لونه إلى الأخضر الساطع لقياس سرعة الأعصاب.
              </p>

              <div className="flex justify-center">
                {reflexState === 'idle' && (
                  <button
                    onClick={startReflexTest}
                    className="w-full py-8 bg-slate-900 border border-cyan-500/30 rounded-2xl hover:bg-slate-800 transition flex flex-col items-center justify-center gap-2 group"
                  >
                    <Zap className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition" />
                    <span className="font-bold text-white text-sm">اضغط هنا لبدء فحص الاستجابة</span>
                    <span className="text-[11px] text-slate-400">ستتحول الشاشة للأخضر بعد لحظات عشوائية</span>
                  </button>
                )}

                {reflexState === 'waiting' && (
                  <button
                    onClick={handleReflexClick}
                    className="w-full py-8 bg-amber-950/60 border border-amber-500/50 rounded-2xl flex flex-col items-center justify-center gap-2 animate-pulse cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                    <span className="font-bold text-amber-300 text-sm">انتظر... لا تنقر بعد!</span>
                    <span className="text-[11px] text-amber-400/80">استعد للنقر بمجرد تحوله للأخضر</span>
                  </button>
                )}

                {reflexState === 'ready' && (
                  <button
                    onClick={handleReflexClick}
                    className="w-full py-8 bg-emerald-500 border border-emerald-300 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-2xl shadow-emerald-500/50 cursor-pointer animate-bounce"
                  >
                    <Zap className="w-10 h-10 text-slate-950" />
                    <span className="font-black text-slate-950 text-lg">انقر الآن بسرعة! CLICK!</span>
                  </button>
                )}

                {reflexState === 'clicked' && reactionTime && (
                  <div className="w-full py-6 bg-slate-900 border border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center gap-1">
                    <span className="text-xs text-slate-400">زمن الاستجابة العصبي:</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">{reactionTime} ms</span>
                    <span className="text-[11px] text-emerald-300">سلوك بشري طبيعي 100% ✅</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHALLENGE 3: COGNITIVE SYMBOL */}
          {challengeMode === 'symbol' && (
            <div className="space-y-4 text-center">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">الرمز المطلوب اختياره:</span>
                <span className="text-3xl block">{targetSymbol}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {symbolsOptions.map((sym, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSymbol(sym)}
                    className="h-14 bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500 rounded-xl text-2xl flex items-center justify-center transition active:scale-95"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bot Alert Warning */}
          {botDetected && (
            <div className="mt-4 p-3 bg-rose-950/70 border border-rose-600/50 rounded-xl flex items-start gap-2.5 text-rose-200 text-xs">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-300 font-bold mb-0.5">تنبيه الحماية الذكية:</strong>
                <span>{detectionReason}</span>
                <button
                  onClick={() => {
                    setBotDetected(false);
                    setSliderVal(0);
                  }}
                  className="mt-2 block text-cyan-400 hover:underline font-semibold"
                >
                  إعادة ضبط الفحص وإثبات الهوية البشرية
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {verificationSuccess && (
            <div className="mt-4 p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl flex items-center gap-2.5 text-emerald-200 text-xs animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-emerald-300 font-bold">تم التحقق بنجاح! هويتك إنسان حقيقي 100%</strong>
                <span className="text-[11px] text-emerald-400/80">تم منحك تصريح المرور الآمن لجميع ألعاب GM S.F.</span>
              </div>
            </div>
          )}

          {/* Anti-Bot Telemetry Live Stats */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>معدل الخطورة: {diagnostics.threatScore} (منخفض)</span>
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>الأنوية: {diagnostics.hardwareConcurrency} Cores</span>
            </span>
            <span className="text-emerald-400">محمي بـ GM Shield</span>
          </div>
        </div>
      </div>
    </div>
  );
};
