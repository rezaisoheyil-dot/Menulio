import { useState } from 'react';
import { ArrowRight, QrCode, Smartphone, Monitor, LayoutDashboard } from 'lucide-react';
import { CafeState } from '../types/cafe';
import { MenuPreviewRenderer } from './MenuPreviewRenderer';
import { QrCodeGraphic } from './QrCodeGraphic';
import { toPersianDigits } from '../data/initialData';

interface LiveMenuPageProps {
  state: CafeState;
  onBackToDashboard: () => void;
  onBackToLanding: () => void;
}

export function LiveMenuPage({
  state,
  onBackToDashboard,
  onBackToLanding,
}: LiveMenuPageProps) {
  const [viewMode, setViewMode] = useState<'menu' | 'qr-stand'>('menu');
  const [previewWidth, setPreviewWidth] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedTable, setSelectedTable] = useState<string>('1');

  const menuUrl = `https://cafemenu.ir/${state.settings.slug}?table=${selectedTable}`;

  return (
    <div className="min-h-screen bg-[#EFECE8] text-stone-900 flex flex-col">
      {/* Clean Top Utility Bar */}
      <header className="bg-white border-b border-stone-200 px-4 sm:px-8 h-16 flex items-center justify-between gap-4 sticky top-0 z-30 no-print">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-700 whitespace-nowrap shrink-0"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#543B6E]" />
            <span>بازگشت به پنل مدیریت</span>
          </button>
          <button
            type="button"
            onClick={onBackToLanding}
            className="hidden sm:inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 whitespace-nowrap shrink-0"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>صفحه اصلی</span>
          </button>
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200">
          <button
            type="button"
            onClick={() => setViewMode('menu')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'menu'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            پیش‌نمایش منوی مشتری
          </button>
          <button
            type="button"
            onClick={() => setViewMode('qr-stand')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'qr-stand'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#E66F1E]" />
            <span>استند QR کد میزها</span>
          </button>
        </div>

        {viewMode === 'menu' && (
          <div className="hidden md:flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200">
            <button
              type="button"
              onClick={() => setPreviewWidth('mobile')}
              className={`p-1.5 rounded-md transition-colors ${
                previewWidth === 'mobile'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="نمای موبایل"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewWidth('desktop')}
              className={`p-1.5 rounded-md transition-colors ${
                previewWidth === 'desktop'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="نمای تمام‌صفحه"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center p-4 sm:p-8">
        {viewMode === 'menu' ? (
          <div
            className={`w-full transition-all duration-200 overflow-hidden border border-stone-300 shadow-xl ${
              previewWidth === 'mobile'
                ? 'max-w-[420px] rounded-[2rem]'
                : 'max-w-4xl rounded-2xl'
            }`}
          >
            <MenuPreviewRenderer
              settings={state.settings}
              categories={state.categories}
              items={state.items}
              builder={state.builder}
              interactiveSearch
            />
          </div>
        ) : (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Printable Table Stand */}
            <div className="md:col-span-7 bg-white rounded-2xl border border-stone-200 p-8 flex flex-col items-center text-center shadow-sm">
              <div className="w-full max-w-xs rounded-2xl border-2 border-stone-800 p-6 bg-[#FAF8F5] space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-stone-500">
                    منوی دیجیتال اختصاصی
                  </p>
                  <h2 className="text-2xl font-extrabold text-stone-900">
                    {state.settings.cafeName}
                  </h2>
                </div>

                <QrCodeGraphic
                  value={menuUrl}
                  size={190}
                  cafeName={state.settings.cafeName}
                  tableNumber={selectedTable}
                  showActions
                />

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                  <span>میز شماره {toPersianDigits(selectedTable)}</span>
                  <span>برای مشاهده منو اسکن کنید</span>
                </div>
              </div>
            </div>

            {/* Stand Controls */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 space-y-5 no-print">
              <div>
                <h3 className="font-bold text-stone-900">تنظیمات QR کد میز</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  برای هر میز یک QR کد یکتا تولید کنید تا هنگام اسکن، شماره میز
                  در آدرس منو ثبت شود.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-2">
                  انتخاب شماره میز
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedTable(num)}
                      className={`py-2 rounded-lg text-xs font-semibold tabular-nums border transition-colors ${
                        selectedTable === num
                          ? 'bg-[#181722] text-white border-[#181722]'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {toPersianDigits(num)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-stone-50 border border-stone-200 p-3.5 space-y-1.5">
                <p className="text-xs font-medium text-stone-600">لینک مستقیم میز:</p>
                <p
                  className="text-xs font-mono text-stone-800 break-all"
                  dir="ltr"
                >
                  {menuUrl}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('menu')}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50 transition-colors"
              >
                تست باز شدن منوی این میز
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
