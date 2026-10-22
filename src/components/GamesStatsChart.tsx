import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, TrendingUp, Star, Download, Smartphone, Trophy, Sparkles } from 'lucide-react';
import { Game } from '../types/game';

interface Props {
  games: Game[];
  onSelectGame?: (game: Game) => void;
}

export const GamesStatsChart: React.FC<Props> = ({ games, onSelectGame }) => {
  const [metric, setMetric] = useState<'downloads' | 'rating' | 'devices'>('downloads');
  const [chartView, setChartView] = useState<'bar' | 'area'>('bar');

  // Parse downloads count into numeric millions for charting
  const parseDownloadsMillions = (str: string): number => {
    if (str.includes('B')) {
      return parseFloat(str.replace(/[^0-9.]/g, '')) * 1000;
    }
    if (str.includes('M')) {
      return parseFloat(str.replace(/[^0-9.]/g, ''));
    }
    if (str.includes('K')) {
      return parseFloat(str.replace(/[^0-9.]/g, '')) / 1000;
    }
    return 1;
  };

  // Prepare data for downloads & rating
  const chartData = useMemo(() => {
    return games.map((g) => ({
      id: g.id,
      name: g.titleAr.length > 18 ? g.titleAr.slice(0, 16) + '...' : g.titleAr,
      fullName: g.titleAr,
      originalTitle: g.title,
      genre: g.genreAr,
      rating: g.rating,
      reviews: g.reviewsCount,
      downloadsRaw: g.downloadsCount,
      downloadsMillion: parseDownloadsMillions(g.downloadsCount),
      devices: g.devices,
      size: g.size,
    }));
  }, [games]);

  // Sort by active metric
  const sortedData = useMemo(() => {
    const list = [...chartData];
    if (metric === 'downloads') {
      return list.sort((a, b) => b.downloadsMillion - a.downloadsMillion).slice(0, 8);
    }
    if (metric === 'rating') {
      return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 8);
    }
    return list;
  }, [chartData, metric]);

  // Data for device breakdown
  const deviceData = useMemo(() => {
    let mobileCount = 0;
    let pcCount = 0;
    let consoleCount = 0;

    games.forEach((g) => {
      if (g.devices.includes('mobile')) mobileCount++;
      if (g.devices.includes('pc')) pcCount++;
      if (g.devices.includes('console')) consoleCount++;
    });

    return [
      { name: 'ألعاب الهواتف (Mobile)', value: mobileCount, color: '#06b6d4' },
      { name: 'ألعاب الكمبيوتر (PC)', value: pcCount, color: '#3b82f6' },
      { name: 'أجهزة الكونسول (Console)', value: consoleCount, color: '#8b5cf6' },
    ];
  }, [games]);

  // Neon theme colors for bars
  const barColors = [
    '#06b6d4', // cyan
    '#38bdf8', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#a855f7', // violet
    '#ec4899', // pink
    '#f43f5e', // rose
  ];

  // Custom Dark Tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{ payload: typeof chartData[0] }>;
  }

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0c1222] border border-cyan-500/40 p-3.5 rounded-xl shadow-2xl text-right text-xs max-w-xs z-50">
          <p className="font-bold text-white text-sm mb-1">{data.fullName}</p>
          <p className="text-[10px] text-cyan-400 font-mono mb-2">{data.originalTitle}</p>
          <div className="space-y-1 text-slate-300 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">التصنيف:</span>
              <span className="font-medium text-slate-200">{data.genre}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">إجمالي التنزيلات:</span>
              <span className="font-bold text-cyan-300 font-mono">{data.downloadsRaw}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">التقييم:</span>
              <span className="font-bold text-amber-300 font-mono flex items-center gap-1">
                ⭐ {data.rating} / 5 ({data.reviews.toLocaleString()} مراجعة)
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">الحجم:</span>
              <span className="font-mono text-slate-300">{data.size}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="mt-12 bg-gradient-to-br from-[#0c1324] via-[#080d19] to-[#060913] rounded-3xl border border-cyan-500/30 p-5 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>لوحة المؤشرات والبيانات التفاعلية Recharts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>إحصائيات الألعاب الأكثر تحميلاً وتقييماً في GM S.F</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            رسم بياني حي يرصد حجم الإقبال، معدلات التقييم، وتوزيع الألعاب حسب الهواتف والكمبيوتر والكونسول.
          </p>
        </div>

        {/* Metric Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMetric('downloads')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              metric === 'downloads'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>الأكثر تحميلاً (بالمليون)</span>
          </button>

          <button
            onClick={() => setMetric('rating')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              metric === 'rating'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>الأعلى تقييماً (⭐)</span>
          </button>

          <button
            onClick={() => setMetric('devices')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              metric === 'devices'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>توزيع الأجهزة</span>
          </button>

          {/* Chart visual style toggle (bar / area) */}
          {metric !== 'devices' && (
            <div className="hidden sm:flex items-center gap-1 mr-2 pl-2 border-r border-slate-700">
              <button
                onClick={() => setChartView('bar')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  chartView === 'bar' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-500 hover:text-white'
                }`}
                title="مخطط أعمدة"
              >
                أعمدة
              </button>
              <button
                onClick={() => setChartView('area')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  chartView === 'area' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-500 hover:text-white'
                }`}
                title="مخطط مساحي"
              >
                منحنى
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Highlights Quick Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6 relative z-10">
        <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">الرقم القياسي للتنزيلات</span>
          <div className="text-xl font-black text-cyan-400 font-mono">+1.5 مليار</div>
          <span className="text-[10px] text-slate-500">صبواي سيرفرز (Subway Surfers)</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">أعلى تقييم كامل</span>
          <div className="text-xl font-black text-amber-400 font-mono">5.0 / 5.0</div>
          <span className="text-[10px] text-slate-500">God of War: Ragnarök</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">دعم ألعاب الهواتف</span>
          <div className="text-xl font-black text-emerald-400 font-mono">75%</div>
          <span className="text-[10px] text-slate-500">متوافقة مع شاشات اللمس</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">ألعاب مجانية بدون تكلفة</span>
          <div className="text-xl font-black text-rose-400 font-mono">100%</div>
          <span className="text-[10px] text-slate-500">0$ بدون أي رسوم خفية</span>
        </div>
      </div>

      {/* Main Interactive Recharts Area */}
      <div className="relative z-10 w-full h-80 sm:h-96 pt-2 select-none">
        {metric === 'devices' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={65}
                paddingAngle={4}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={3} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c1222',
                  borderColor: '#06b6d4',
                  borderRadius: '12px',
                  color: '#fff',
                  textAlign: 'right',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-slate-300 font-medium px-2">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : chartView === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 20, right: 10, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={metric === 'rating' ? [4.0, 5.0] : ['auto', 'auto']}
                unit={metric === 'downloads' ? 'M' : '⭐'}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.08)' }} />
              <Bar
                dataKey={metric === 'downloads' ? 'downloadsMillion' : 'rating'}
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              >
                {sortedData.map((_, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={metric === 'rating' ? '#f59e0b' : barColors[index % barColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sortedData} margin={{ top: 20, right: 10, left: 10, bottom: 40 }}>
              <defs>
                <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={metric === 'rating' ? [4.0, 5.0] : ['auto', 'auto']}
                unit={metric === 'downloads' ? 'M' : '⭐'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric === 'downloads' ? 'downloadsMillion' : 'rating'}
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#cyberAreaGrad)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="relative z-10 mt-2 text-center text-[11px] text-slate-500 font-mono">
        💡 يمكنك تمرير مؤشر الفأرة أو لمس الأعمدة والنقاط لعرض كافة تفاصيل اللعبة ومعدل التقييم بدقة.
      </div>
    </section>
  );
};
