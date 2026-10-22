import React, { useState } from 'react';
import {
  X,
  Star,
  Download,
  Play,
  Smartphone,
  Monitor,
  Tv,
  ShieldCheck,
  Check,
  Bookmark,
  Share2,
  Cpu,
  MessageSquare,
  Send,
  Zap,
} from 'lucide-react';
import { Game, HumanVerificationState } from '../types/game';

interface Props {
  game: Game | null;
  onClose: () => void;
  onPlayInstant: (game: Game) => void;
  onVerifyAndDownload: (game: Game) => void;
  isBookmarked: boolean;
  onToggleBookmark: (gameId: string) => void;
  verificationState: HumanVerificationState;
}

export const GameDetailModal: React.FC<Props> = ({
  game,
  onClose,
  onPlayInstant,
  onVerifyAndDownload,
  isBookmarked,
  onToggleBookmark,
  verificationState,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'controls' | 'specs' | 'reviews'>('overview');
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [comments, setComments] = useState<{ name: string; date: string; text: string; rating: number }[]>([
    {
      name: 'أحمد الجيمر',
      date: 'منذ يومين',
      text: 'لعبة أسطورية وشغالة على هاتفي بسرعة 60 إطار بدون أي تقطيع! شكراً GM S.F.',
      rating: 5,
    },
    {
      name: 'سارة القيصر',
      date: 'منذ 4 أيام',
      text: 'نظام الحماية ضد البوتات رائع جداً، يحمي الروابط من الإعلانات المزعجة والتنزيل فوري ومجاني.',
      rating: 5,
    },
    {
      name: 'Ali Gamer',
      date: 'منذ أسبوع',
      text: 'جربت تشغيلها على شاشة التلفاز ويد البلايستيشن والتحكم استجاب فوراً.',
      rating: 5,
    },
  ]);

  if (!game) return null;

  const handleDownloadClick = () => {
    if (!verificationState.isVerified) {
      onVerifyAndDownload(game);
      return;
    }

    setDownloadStarted(true);
    setTimeout(() => {
      setDownloadStarted(false);
      alert(`تم بدء التحميل الآمن والمجاني للعبة ${game.titleAr} بنجاح عبر خوادم GM S.F السريعة!`);
    }, 1500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    setComments([
      {
        name: 'أنت (لاعب موثق)',
        date: 'الآن مباشرة',
        text: userComment,
        rating: 5,
      },
      ...comments,
    ]);
    setUserComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in text-right">
      <div className="relative w-full max-w-4xl bg-[#0b101c] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header & Hero Artwork */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={game.bannerImage || game.coverImage}
            alt={game.titleAr}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b101c] via-[#0b101c]/50 to-transparent" />

          {/* Top Bar Floating Controls */}
          <div className="absolute top-4 right-4 left-4 flex items-center justify-between">
            <span className="text-xs font-black bg-cyan-500 text-slate-950 px-3 py-1 rounded-lg shadow-lg">
              مجاني بالكامل 100%
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleBookmark(game.id)}
                className="p-2 rounded-xl bg-black/60 backdrop-blur text-slate-300 hover:text-amber-400 border border-white/10 transition"
                title="حفظ اللعبة"
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-black/60 backdrop-blur text-slate-300 hover:text-white border border-white/10 transition"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Banner bottom titles */}
          <div className="absolute bottom-4 right-4 left-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-cyan-300 mb-1">
                <span>{game.genreAr}</span>
                <span>·</span>
                <span>المطور: {game.developer}</span>
                <span>·</span>
                <span>سنة الإصدار: {game.releaseYear}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">{game.titleAr}</h2>
              <span className="text-xs text-slate-400 font-mono">{game.title}</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-white font-bold text-sm">{game.rating}</span>
              <span className="text-slate-400 text-xs">({game.reviewsCount} تقييم)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 bg-[#0e1422] text-xs font-semibold overflow-x-auto">
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-xl transition ${
                activeTab === 'overview'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              نظرة عامة ومميزات
            </button>
            <button
              onClick={() => setActiveTab('controls')}
              className={`px-3 py-2 rounded-xl transition ${
                activeTab === 'controls'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              أزرار التحكم (هاتف/كمبيوتر/كونسول)
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-3 py-2 rounded-xl transition ${
                activeTab === 'specs'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              متطلبات التشغيل
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-2 rounded-xl transition ${
                activeTab === 'reviews'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              آراء اللاعبين ({comments.length})
            </button>
          </div>

          <div className="text-slate-400 text-xs font-mono hidden md:block">
            حجم اللعبة: <span className="text-cyan-300 font-bold">{game.size}</span>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-2">عن اللعبة</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{game.descriptionAr}</p>
                <p className="text-slate-400 text-xs mt-2 italic">{game.description}</p>
              </div>

              {/* Supported Devices Showcase */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
                <h4 className="text-xs font-bold text-cyan-300 mb-3">الأجهزة الإلكترونية المتوافقة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      game.devices.includes('mobile')
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold">الهواتف الذكية</div>
                      <div className="text-[10px] text-slate-400">
                        {game.devices.includes('mobile') ? 'مدعوم بالكامل (أندرويد وآيفون)' : 'غير مخصص للهواتف'}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      game.devices.includes('pc')
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Monitor className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold">أجهزة الكمبيوتر</div>
                      <div className="text-[10px] text-slate-400">
                        {game.devices.includes('pc') ? 'مدعوم (Windows و Mac و Linux)' : 'غير مخصص للحاسوب'}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      game.devices.includes('console')
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Tv className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold">أجهزة الكونسول</div>
                      <div className="text-[10px] text-slate-400">
                        {game.devices.includes('console') ? 'PlayStation / Xbox / Switch' : 'غير متوفر للكونسول'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-3">أبرز المميزات الحصرية في GM S.F</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {game.featuresAr.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Screenshots Gallery */}
              {game.screenshots.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-300 mb-3">لقطات شاشة من داخل اللعبة</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {game.screenshots.map((s, idx) => (
                      <img
                        key={idx}
                        src={s}
                        alt={`Screenshot ${idx + 1}`}
                        className="rounded-xl border border-slate-800 object-cover aspect-video hover:opacity-90 transition"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white mb-2">دليل أزرار التحكم لكل منصة وجهاز</h4>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>تحكم الهواتف الذكية (Mobile Touch):</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pr-6">{game.controls.mobile}</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Monitor className="w-4 h-4" />
                  <span>تحكم الكمبيوتر (Keyboard & Mouse):</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pr-6">{game.controls.pc}</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Tv className="w-4 h-4" />
                  <span>تحكم الكونسول وذراع التحكم (Gamepad / Controller):</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pr-6">{game.controls.console}</p>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white mb-2">متطلبات التشغيل والمواصفات المطلوبة</h4>

              {game.systemRequirements?.mobile && (
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <div className="text-xs font-bold text-cyan-400 mb-1">📱 مواصفات الهواتف المطلوبة:</div>
                  <div className="text-xs text-slate-300">{game.systemRequirements.mobile}</div>
                </div>
              )}

              {game.systemRequirements?.pc && (
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <div className="text-xs font-bold text-cyan-400 mb-1">💻 مواصفات الكمبيوتر (PC Requirements):</div>
                  <div className="text-xs text-slate-300">{game.systemRequirements.pc}</div>
                </div>
              )}

              {game.systemRequirements?.console && (
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <div className="text-xs font-bold text-cyan-400 mb-1">🎮 أجهزة الكونسول المدعومة:</div>
                  <div className="text-xs text-slate-300">{game.systemRequirements.console}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <form onSubmit={handleAddComment} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">أضف رأيك أو تقييمك للعبة:</span>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="شارك تجربتك مع زملائك اللاعبين في GM S.F..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">تقييمك: ⭐⭐⭐⭐⭐</span>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>نشر التقييم</span>
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {comments.map((c, i) => (
                  <div key={i} className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-300">{c.name}</span>
                      <span className="text-slate-500 text-[10px]">{c.date}</span>
                    </div>
                    <p className="text-xs text-slate-300">{c.text}</p>
                    <div className="text-[10px] text-amber-400">{'⭐'.repeat(c.rating)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Fixed Action Bar with Anti-Bot Status */}
        <div className="p-4 sm:p-5 bg-[#0e1422] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="block font-semibold">
                حماية أمان GM Shield:{' '}
                {verificationState.isVerified ? (
                  <strong className="text-emerald-400">هوية بشرية مصرحة ✅</strong>
                ) : (
                  <strong className="text-amber-400">يتطلب الفحص قبل التحميل لمنع البوتات</strong>
                )}
              </span>
              <span className="text-[11px] text-slate-500">حماية من الفيروسات والروابط التالفة والسكريبتات</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {game.isPlayableInBrowser && (
              <button
                onClick={() => {
                  onClose();
                  onPlayInstant(game);
                }}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>العب بالمتصفح فورا</span>
              </button>
            )}

            <button
              onClick={handleDownloadClick}
              disabled={downloadStarted}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadStarted ? 'جارٍ فحص الرابط وبدء التنزيل...' : 'تحميل مجاني 100%'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
