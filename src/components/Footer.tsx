import React from 'react';
import { Gamepad2, ShieldCheck, Smartphone, Monitor, Tv, Heart } from 'lucide-react';

interface Props {
  onOpenSecurityCenter: () => void;
  onOpenAntiBot: () => void;
}

export const Footer: React.FC<Props> = ({ onOpenSecurityCenter, onOpenAntiBot }) => {
  return (
    <footer className="mt-16 bg-[#080c16] border-t border-slate-800 text-right text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-black">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="font-gaming font-black text-lg text-white">GM S.F</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              منصة ألعاب GM S.F الشاملة لجميع ألعاب الهواتف الذكية والحواسيب وأجهزة الكونسول. كل الألعاب مجانية بنسبة 100% ومحمية بنظام أمان ذكي متقدم لمنع البوتات.
            </p>
          </div>

          {/* Electronic Devices Supported */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs mb-3">الأجهزة الإلكترونية المدعومة</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>الهواتف الذكية (Android & iOS)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>أجهزة الكمبيوتر (Windows / Mac)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span>منصات الكونسول (PS5 / Xbox / Switch)</span>
              </li>
            </ul>
          </div>

          {/* Smart Anti-Bot Security */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs mb-3">نظام الحماية الذكي GM Shield</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              نظام أمان عصبي متطور يحلل حركة اللمس وحركة المؤشر وزمن الاستجابة البيولوجي لمنع برامج الأتمتة وهجمات DDoS وحظر البوتات تلقائياً.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSecurityCenter}
                className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold text-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>عرض لوحة الحماية المباشرة</span>
              </button>
            </div>
          </div>

          {/* Quick Links & Terms */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs mb-3">عن المنصة والألعاب</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>✨ جميع الألعاب مجانية بدون اشتراكات أو رسوم</li>
              <li>⚡ سيرفرات لعب فوري داخل المتصفح</li>
              <li>🔒 روابط فحص خالية من البرمجيات الضارة</li>
              <li>📱 تحكم لمسي كامل مخصص للهواتف</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} GM S.F Gaming Hub - جميع الحقوق محفوظة لجمهور اللاعبين مجاناً.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>صُممت بعناية فائقة لتجربة لعب فورية وآمنة</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
