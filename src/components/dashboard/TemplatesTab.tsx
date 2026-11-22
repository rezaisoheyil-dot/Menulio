import { Check } from 'lucide-react';
import { CafeState, TemplateId } from '../../types/cafe';
import { TEMPLATE_PRESETS } from '../../data/initialData';
import { SafeImage } from '../SafeImage';

interface TemplatesTabProps {
  state: CafeState;
  onApplyTemplate: (templateId: TemplateId) => void;
  onGoToBuilder: () => void;
}

export function TemplatesTab({
  state,
  onApplyTemplate,
  onGoToBuilder,
}: TemplatesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900">قالب‌های آماده منو</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            با یک کلیک قالب منوی {state.settings.cafeName} را تغییر دهید و در منوساز شخصی‌سازی کنید.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToBuilder}
          className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          شخصی‌سازی در منوساز
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TEMPLATE_PRESETS.map((tpl) => {
          const isActive = state.builder.templateId === tpl.id;
          return (
            <div
              key={tpl.id}
              className={`rounded-2xl border overflow-hidden flex flex-col bg-white transition-all ${
                isActive ? 'border-[#E66F1E] ring-2 ring-[#E66F1E]/20' : 'border-stone-200'
              }`}
            >
              <div
                className="p-4 h-52 flex flex-col justify-between"
                style={{ backgroundColor: tpl.surfaceBg, color: tpl.textColor }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base">{tpl.name}</h3>
                    <p className="text-xs opacity-75">{tpl.styleLabel}</p>
                  </div>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E66F1E]">
                      <Check className="w-3.5 h-3.5" />
                      <span>فعال</span>
                    </span>
                  )}
                </div>

                <div
                  className="rounded-xl p-2.5 border flex items-center gap-2.5"
                  style={{
                    backgroundColor: tpl.cardBg,
                    borderColor: tpl.isDark ? 'rgba(255,255,255,0.1)' : '#E5E0D8',
                  }}
                >
                  <SafeImage
                    src={tpl.previewImage}
                    alt={tpl.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">اسپرسو دبل</p>
                    <p
                      className="text-[11px] font-bold mt-1 tabular-nums"
                      style={{ color: tpl.accentColor }}
                    >
                      ۹۵,۰۰۰ تومان
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  {tpl.description}
                </p>
                <button
                  type="button"
                  onClick={() => onApplyTemplate(tpl.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#181722] text-white'
                      : 'bg-stone-100 hover:bg-[#E66F1E] hover:text-white text-stone-800'
                  }`}
                >
                  {isActive ? 'قالب فعال فعلی' : 'اعمال این قالب روی منو'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
