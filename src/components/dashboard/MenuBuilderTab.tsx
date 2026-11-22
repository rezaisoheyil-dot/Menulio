import { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Check,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Type,
  LayoutGrid,
  List,
} from 'lucide-react';
import {
  CafeState,
  MenuBuilderConfig,
  MenuLayerId,
} from '../../types/cafe';
import { TEMPLATE_PRESETS } from '../../data/initialData';
import { MenuPreviewRenderer } from '../MenuPreviewRenderer';

interface MenuBuilderTabProps {
  state: CafeState;
  onUpdateBuilder: (next: MenuBuilderConfig) => void;
  onOpenLiveMenu: () => void;
}

const ACCENT_SWATCHES = [
  '#E66F1E',
  '#B45309',
  '#C9A227',
  '#7C4D63',
  '#0F766E',
  '#4F46E5',
];

export function MenuBuilderTab({
  state,
  onUpdateBuilder,
  onOpenLiveMenu,
}: MenuBuilderTabProps) {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [inspectorTab, setInspectorTab] = useState<'elements' | 'styles'>('elements');
  const [selectedLayer, setSelectedLayer] = useState<MenuLayerId>('header');
  const [history, setHistory] = useState<MenuBuilderConfig[]>([]);
  const [future, setFuture] = useState<MenuBuilderConfig[]>([]);
  const [publishedToast, setPublishedToast] = useState(false);

  const commitChange = (next: MenuBuilderConfig) => {
    setHistory((prev) => [...prev.slice(-19), state.builder]);
    setFuture([]);
    onUpdateBuilder(next);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [state.builder, ...prev]);
    onUpdateBuilder(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, state.builder]);
    onUpdateBuilder(next);
  };

  const toggleLayerVisibility = (id: MenuLayerId) => {
    commitChange({
      ...state.builder,
      layers: state.builder.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
    });
  };

  const moveLayer = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= state.builder.layers.length) return;
    const nextLayers = [...state.builder.layers];
    const tmp = nextLayers[index];
    nextLayers[index] = nextLayers[target];
    nextLayers[target] = tmp;
    commitChange({ ...state.builder, layers: nextLayers });
  };

  const handlePublish = () => {
    setPublishedToast(true);
    setTimeout(() => setPublishedToast(false), 2600);
  };

  return (
    <div className="space-y-4">
      {/* Builder Top Toolbar */}
      <div className="rounded-xl bg-white border border-stone-200 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-extrabold text-stone-900">
            طراحی منو
          </h1>
          {publishedToast && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Check className="w-3.5 h-3.5" />
              <span>تغییرات با موفقیت منتشر شد</span>
            </span>
          )}
        </div>

        {/* Device & History Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-100 border border-stone-200">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1.5 rounded-md text-stone-600 hover:bg-white disabled:opacity-35 transition-colors"
              title="بازگشت (Undo)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={future.length === 0}
              className="p-1.5 rounded-md text-stone-600 hover:bg-white disabled:opacity-35 transition-colors"
              title="انجام مجدد (Redo)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-stone-100 border border-stone-200">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'desktop'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="دسکتاپ"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'tablet'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="تبلت"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'mobile'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="موبایل"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save & Preview */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenLiveMenu}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>پیش‌نمایش</span>
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#543B6E] hover:bg-[#432e59] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span>ذخیره و انتشار</span>
          </button>
        </div>
      </div>

      {/* 3-Column Visual Builder Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Right Panel: Layers */}
        <div className="lg:col-span-3 rounded-xl bg-white border border-stone-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#543B6E]" />
              <span>لایه‌ها</span>
            </h2>
            <span className="text-[11px] text-stone-400">ترتیب و نمایش</span>
          </div>

          <div className="space-y-1.5">
            {state.builder.layers.map((layer, index) => {
              const isSelected = selectedLayer === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => {
                    setSelectedLayer(layer.id);
                    setInspectorTab('elements');
                  }}
                  className={`rounded-lg border px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#543B6E]/10 border-[#543B6E]/35 text-[#3B2652]'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-xs font-semibold truncate">
                    {layer.label}
                  </span>

                  <div
                    className="flex items-center gap-0.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => moveLayer(index, -1)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-white disabled:opacity-30"
                      title="بالا"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLayer(index, 1)}
                      disabled={index === state.builder.layers.length - 1}
                      className="p-1 rounded hover:bg-white disabled:opacity-30"
                      title="پایین"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayerVisibility(layer.id)}
                      className="p-1 rounded hover:bg-white"
                      title={layer.visible ? 'مخفی کردن' : 'نمایش'}
                    >
                      {layer.visible ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Viewport: Live Device Canvas */}
        <div className="lg:col-span-6 rounded-xl bg-[#EAE7E2] border border-stone-200 p-4 sm:p-6 flex justify-center min-h-[580px]">
          <div
            className={`w-full transition-all duration-200 overflow-hidden border border-stone-300 shadow-lg bg-white ${
              device === 'mobile'
                ? 'max-w-[360px] rounded-[2rem]'
                : device === 'tablet'
                  ? 'max-w-[540px] rounded-2xl'
                  : 'max-w-full rounded-xl'
            }`}
          >
            <div className="h-[540px] overflow-y-auto">
              <MenuPreviewRenderer
                settings={state.settings}
                categories={state.categories}
                items={state.items}
                builder={state.builder}
                interactiveSearch={false}
              />
            </div>
          </div>
        </div>

        {/* Left Panel: Elements & Styles Inspector */}
        <div className="lg:col-span-3 rounded-xl bg-white border border-stone-200 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-stone-100 border border-stone-200">
            <button
              type="button"
              onClick={() => setInspectorTab('elements')}
              className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                inspectorTab === 'elements'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              عناصر و متن
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('styles')}
              className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                inspectorTab === 'styles'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              استایل و قالب
            </button>
          </div>

          {inspectorTab === 'elements' ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="flex items-center gap-1.5 font-semibold text-stone-700 mb-1.5">
                  <Type className="w-3.5 h-3.5 text-[#543B6E]" />
                  <span>عنوان سربرگ منو</span>
                </label>
                <input
                  type="text"
                  value={state.builder.headerTitle}
                  onChange={(e) =>
                    commitChange({ ...state.builder, headerTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-[#543B6E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  زیرعنوان سربرگ
                </label>
                <input
                  type="text"
                  value={state.builder.headerSubtitle}
                  onChange={(e) =>
                    commitChange({
                      ...state.builder,
                      headerSubtitle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-[#543B6E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  متن بنر تبلیغاتی بالای منو
                </label>
                <textarea
                  rows={2}
                  value={state.builder.bannerText}
                  onChange={(e) =>
                    commitChange({ ...state.builder, bannerText: e.target.value })
                  }
                  placeholder="مثلاً ۲۰٪ تخفیف صبحانه..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-[#543B6E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  توضیح پاورقی
                </label>
                <input
                  type="text"
                  value={state.builder.footerNote}
                  onChange={(e) =>
                    commitChange({ ...state.builder, footerNote: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-[#543B6E]"
                />
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-2.5">
                <p className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#543B6E]" />
                  <span>نمایش اجزای کارت محصول</span>
                </p>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-stone-600">نمایش تصویر محصولات</span>
                  <input
                    type="checkbox"
                    checked={state.builder.showImages}
                    onChange={(e) =>
                      commitChange({
                        ...state.builder,
                        showImages: e.target.checked,
                      })
                    }
                    className="accent-[#543B6E]"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-stone-600">نمایش توضیحات و ترکیبات</span>
                  <input
                    type="checkbox"
                    checked={state.builder.showDescriptions}
                    onChange={(e) =>
                      commitChange({
                        ...state.builder,
                        showDescriptions: e.target.checked,
                      })
                    }
                    className="accent-[#543B6E]"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-stone-600">نمایش قیمت تومان</span>
                  <input
                    type="checkbox"
                    checked={state.builder.showPrices}
                    onChange={(e) =>
                      commitChange({
                        ...state.builder,
                        showPrices: e.target.checked,
                      })
                    }
                    className="accent-[#543B6E]"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <p className="font-semibold text-stone-700 mb-2">پالت قالب پایه</p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATE_PRESETS.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() =>
                        commitChange({
                          ...state.builder,
                          templateId: tpl.id,
                          accentColor: tpl.accentColor,
                        })
                      }
                      className={`p-2 rounded-lg border text-right transition-colors ${
                        state.builder.templateId === tpl.id
                          ? 'border-[#543B6E] bg-[#543B6E]/5 font-bold'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{tpl.name}</span>
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tpl.accentColor }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-stone-700 mb-2">رنگ تاکیدی منو</p>
                <div className="flex flex-wrap items-center gap-2">
                  {ACCENT_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() =>
                        commitChange({ ...state.builder, accentColor: hex })
                      }
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        state.builder.accentColor === hex
                          ? 'border-stone-900 scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: hex }}
                      aria-label={`انتخاب رنگ ${hex}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-stone-700 mb-2">چیدمان لیست محصولات</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      commitChange({ ...state.builder, layoutMode: 'list' })
                    }
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 ${
                      state.builder.layoutMode === 'list'
                        ? 'border-[#543B6E] bg-[#543B6E]/10 text-[#3B2652] font-semibold'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>لیستی</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      commitChange({ ...state.builder, layoutMode: 'grid' })
                    }
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 ${
                      state.builder.layoutMode === 'grid'
                        ? 'border-[#543B6E] bg-[#543B6E]/10 text-[#3B2652] font-semibold'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>شبکه‌ای</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="font-semibold text-stone-700 mb-2">انحنای گوشه کارت‌ها</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'sm', label: 'ملایم' },
                    { id: 'md', label: 'استاندارد' },
                    { id: 'lg', label: 'گرد' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() =>
                        commitChange({
                          ...state.builder,
                          cardRadius: r.id as 'sm' | 'md' | 'lg',
                        })
                      }
                      className={`py-1.5 rounded-lg border text-center ${
                        state.builder.cardRadius === r.id
                          ? 'border-[#543B6E] bg-[#543B6E]/10 font-semibold'
                          : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
