import { useState } from 'react';
import {
  Crown,
  Layers,
  Package,
  Eye,
  PenLine,
  Plus,
  ExternalLink,
  QrCode,
  ArrowUpLeft,
} from 'lucide-react';
import { CafeState, DashboardTab } from '../../types/cafe';
import { SUBSCRIPTION_PLANS, toPersianDigits } from '../../data/initialData';

interface OverviewTabProps {
  state: CafeState;
  onNavigateTab: (tab: DashboardTab) => void;
  onOpenLiveMenu: () => void;
  onOpenQrModal: () => void;
  onOpenAddProduct: () => void;
}

export function OverviewTab({
  state,
  onNavigateTab,
  onOpenLiveMenu,
  onOpenQrModal,
  onOpenAddProduct,
}: OverviewTabProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === state.currentPlanId);

  const totalViews = state.dailyViews.reduce((acc, d) => acc + d.views, 0) + 1126;
  const maxViews = Math.max(...state.dailyViews.map((d) => d.views), 150);

  // Build SVG path for 30-day analytics chart
  const chartWidth = 640;
  const chartHeight = 190;
  const padX = 20;
  const padY = 20;
  const points = state.dailyViews.map((d, i) => {
    const x =
      padX +
      (i / Math.max(state.dailyViews.length - 1, 1)) * (chartWidth - padX * 2);
    const y =
      chartHeight -
      padY -
      (d.views / maxViews) * (chartHeight - padY * 2);
    return { x, y, ...d };
  });

  const linePath = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${chartHeight - padY} L ${points[0].x.toFixed(1)} ${chartHeight - padY} Z`;

  return (
    <div className="space-y-6">
      {/* Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
            سلام، به پنل {state.settings.cafeName} خوش آمدید
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            خلاصه وضعیت منوی دیجیتال، بازدیدهای مشتریان و دسترسی سریع به ابزارها
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('builder')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#543B6E] hover:bg-[#432e59] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <PenLine className="w-4 h-4" />
          <span>ورود به منوساز بصری</span>
        </button>
      </div>

      {/* 4 KPI Cards (Flat, single-level elevation, tabular numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-stone-200 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-stone-500">وضعیت اشتراک</p>
            <p className="text-lg font-extrabold text-stone-900 mt-1">
              فعال
            </p>
            <p className="text-xs text-emerald-700 mt-0.5 font-medium">
              {currentPlan?.name} · {state.billingCycle === 'yearly' ? 'سالانه' : 'ماهانه'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl bg-white border border-stone-200 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-stone-500">دسته‌بندی‌ها</p>
            <p className="text-2xl font-extrabold text-stone-900 mt-1 tabular-nums">
              {toPersianDigits(state.categories.length)}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {toPersianDigits(state.categories.filter((c) => c.visible).length)} دسته فعال
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#543B6E]/10 text-[#543B6E] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl bg-white border border-stone-200 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-stone-500">محصولات</p>
            <p className="text-2xl font-extrabold text-stone-900 mt-1 tabular-nums">
              {toPersianDigits(state.items.length)}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5 font-medium tabular-nums">
              {toPersianDigits(state.items.filter((i) => i.available).length)} مورد موجود
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#E66F1E]/10 text-[#E66F1E] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl bg-white border border-stone-200 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-stone-500">بازدید منو</p>
            <p className="text-2xl font-extrabold text-stone-900 mt-1 tabular-nums">
              {toPersianDigits(new Intl.NumberFormat('en-US').format(totalViews))}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5 font-medium tabular-nums">
              +۱۲٪ نسبت به ماه قبل
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 30-Day Views Chart */}
        <div className="lg:col-span-8 rounded-xl bg-white border border-stone-200 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-bold text-stone-900">بازدید منو (۳۰ روز اخیر)</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                تعداد اسکن QR کد و باز شدن منوی {state.settings.cafeName}
              </p>
            </div>
            {hoveredIdx !== null && points[hoveredIdx] && (
              <div className="text-xs font-semibold text-[#543B6E] tabular-nums">
                روز {toPersianDigits(points[hoveredIdx].day)}: {toPersianDigits(points[hoveredIdx].views)} بازدید
              </div>
            )}
          </div>

          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-52 overflow-visible"
              role="img"
              aria-label="نمودار بازدید ۳۰ روز اخیر منوی کافه"
            >
              <defs>
                <linearGradient id="cafeChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D4AFF" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#6D4AFF" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75].map((ratio) => {
                const y = padY + ratio * (chartHeight - padY * 2);
                return (
                  <line
                    key={ratio}
                    x1={padX}
                    x2={chartWidth - padX}
                    y1={y}
                    y2={y}
                    stroke="#E7E5E4"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              <path d={areaPath} fill="url(#cafeChartGrad)" />
              <path
                d={linePath}
                fill="none"
                stroke="#6D4AFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((pt, idx) => (
                <g key={pt.day}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIdx === idx ? 5.5 : 3.5}
                    fill={hoveredIdx === idx ? '#E66F1E' : '#6D4AFF'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                  <text
                    x={pt.x}
                    y={chartHeight - 2}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#78716C"
                  >
                    {toPersianDigits(pt.day)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Quick Access */}
        <div className="lg:col-span-4 rounded-xl bg-white border border-stone-200 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-stone-900 mb-4">دسترسی سریع</h2>
            <div className="divide-y divide-stone-100">
              <button
                type="button"
                onClick={() => onNavigateTab('builder')}
                className="w-full py-3 flex items-center justify-between text-sm text-stone-700 hover:text-[#E66F1E] transition-colors"
              >
                <span className="flex items-center gap-3 font-medium">
                  <PenLine className="w-4 h-4 text-stone-400" />
                  <span>ویرایش طراحی منو</span>
                </span>
                <ArrowUpLeft className="w-4 h-4 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={onOpenAddProduct}
                className="w-full py-3 flex items-center justify-between text-sm text-stone-700 hover:text-[#E66F1E] transition-colors"
              >
                <span className="flex items-center gap-3 font-medium">
                  <Plus className="w-4 h-4 text-stone-400" />
                  <span>افزودن محصول جدید</span>
                </span>
                <ArrowUpLeft className="w-4 h-4 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={onOpenLiveMenu}
                className="w-full py-3 flex items-center justify-between text-sm text-stone-700 hover:text-[#E66F1E] transition-colors"
              >
                <span className="flex items-center gap-3 font-medium">
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                  <span>مشاهده منوی آنلاین</span>
                </span>
                <ArrowUpLeft className="w-4 h-4 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={onOpenQrModal}
                className="w-full py-3 flex items-center justify-between text-sm text-stone-700 hover:text-[#E66F1E] transition-colors"
              >
                <span className="flex items-center gap-3 font-medium">
                  <QrCode className="w-4 h-4 text-stone-400" />
                  <span>دانلود و چاپ QR کد</span>
                </span>
                <ArrowUpLeft className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>تاریخ تمدید اشتراک</span>
            <span className="font-semibold text-stone-800 tabular-nums">
              {state.subscriptionExpiresAt}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
