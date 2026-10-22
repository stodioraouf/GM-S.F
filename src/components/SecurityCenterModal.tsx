import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Activity, Terminal, Lock, RefreshCw, X, Play, CheckCircle2 } from 'lucide-react';
import { HumanVerificationState, SecurityThreatLog } from '../types/game';
import { MOCK_SECURITY_LOGS } from '../data/games';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  verificationState: HumanVerificationState;
  onTriggerVerification: () => void;
}

export const SecurityCenterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  verificationState,
  onTriggerVerification,
}) => {
  const [logs, setLogs] = useState<SecurityThreatLog[]>(MOCK_SECURITY_LOGS);
  const [isSimulatingAttack, setIsSimulatingAttack] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [securityLevel, setSecurityLevel] = useState<'high' | 'ultra' | 'balanced'>('ultra');

  if (!isOpen) return null;

  const simulateBotAttack = () => {
    setIsSimulatingAttack(true);
    setSimulationResult(null);

    setTimeout(() => {
      const newLog: SecurityThreatLog = {
        id: `sim-${Date.now()}`,
        timestamp: 'الآن مباشرة',
        ipMasked: '185.190.14.***',
        threatType: 'Headless Bot',
        action: 'Blocked',
        threatLevel: 'Critical',
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 5)]);
      setIsSimulatingAttack(false);
      setSimulationResult('تم رصد الهجوم الآلي بنجاح واعتراضه في 12ms دون أي تأثير على الموقع!');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-right">
      <div className="relative w-full max-w-2xl bg-[#0c101a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#101726] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>مركز الحماية الذكي GM S.F Sentinel</span>
                <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                  ACTIVE 100%
                </span>
              </h2>
              <p className="text-xs text-slate-400">مراقبة التهديدات، حظر البوتات، وحماية سرعة ألعاب السيرفرات</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User Human Status Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  verificationState.isVerified
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {verificationState.isVerified ? <CheckCircle2 className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
              </div>
              <div>
                <span className="text-xs text-slate-400 block">حالة التحقق البشرية الخاصة بك:</span>
                <h4 className="text-base font-bold text-white">
                  {verificationState.isVerified ? 'هوية بشرية موثقة (Human Verified)' : 'تحتاج لإجراء التحقق البشري'}
                </h4>
                <span className="text-[11px] text-cyan-400 font-mono">
                  درجة الثقة: {verificationState.isVerified ? '99.8% (آمن تماماً)' : '0% (قيد المراجعة)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onTriggerVerification();
              }}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition whitespace-nowrap active:scale-95"
            >
              {verificationState.isVerified ? 'إعادة فحص الهوية' : 'التحقق الآن (GM Shield)'}
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">بوتات محظورة اليوم</span>
              <span className="text-xl font-black text-rose-400 font-mono">14,291</span>
            </div>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">زمن الفحص الذكي</span>
              <span className="text-xl font-black text-cyan-400 font-mono">18 ms</span>
            </div>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">حماية الهجمات DDoS</span>
              <span className="text-xl font-black text-emerald-400 font-mono">مفعلة</span>
            </div>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">معدل الدقة البشرية</span>
              <span className="text-xl font-black text-amber-400 font-mono">99.9%</span>
            </div>
          </div>

          {/* How the Protection Works */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>كيف يعمل نظام الحماية الذكي في GM S.F لمنع البوتات؟</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <strong className="text-cyan-300 block mb-1">1. التموج الحركي واللمسي</strong>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  يقيس انحناءات حركة الماوس ولمسات الشاشة الطبيعية غير المستقيمة التي يستحيل على برامج الروبوت محاكاتها بدقة.
                </p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <strong className="text-cyan-300 block mb-1">2. فحص محركات الأتمتة</strong>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  كشف أدوات الأتمتة الشائعة كـ Puppeteer و Selenium و Headless Chrome قبل وصولها لروابط الألعاب المجانية.
                </p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <strong className="text-cyan-300 block mb-1">3. زمن الاستجابة البيولوجي</strong>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  التحقق من أن أوقات التفاعل لا تقل عن 150 ملي ثانية لمنع النقر الآلي الفوري الصادر من السكربتات الخبيثة.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Bot Simulation Sandbox */}
          <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">محاكي اختبار الدفاع (Test Defense Sandbox)</span>
              </div>
              <button
                onClick={simulateBotAttack}
                disabled={isSimulatingAttack}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                {isSimulatingAttack ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ إرسال بوت تجريبي...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>إرسال هجوم بوت تجريبي</span>
                  </>
                )}
              </button>
            </div>

            {simulationResult && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-600/40 rounded-lg text-xs text-emerald-300 mb-3 animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{simulationResult}</span>
              </div>
            )}

            {/* Live Blocked Logs Table */}
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="text-slate-500 text-[10px] pb-1 border-b border-slate-800 flex justify-between">
                <span>سجل التهديدات الآلية المعترضة حديثاً:</span>
                <span>الحالة</span>
              </div>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800/80 text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400">🛡️ {log.threatType}</span>
                    <span className="text-slate-500">({log.ipMasked})</span>
                    <span className="text-slate-600 text-[10px]">{log.timestamp}</span>
                  </div>
                  <span className="text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60 font-bold">
                    {log.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#101726] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>خوارزمية الحماية تعمل بشكل حي على جميع صفحات الموقع</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
