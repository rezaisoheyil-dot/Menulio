import { useMemo, useState } from 'react';
import { Coffee, Clock, MapPin, Phone, Wifi, Search, Sparkles } from 'lucide-react';
import {
  CafeSettings,
  MenuBuilderConfig,
  MenuCategory,
  MenuItem,
} from '../types/cafe';
import { formatPriceToman, TEMPLATE_PRESETS } from '../data/initialData';
import { SafeImage } from './SafeImage';
import { HERO_IMAGE } from '../data/initialData';

interface MenuPreviewRendererProps {
  settings: CafeSettings;
  categories: MenuCategory[];
  items: MenuItem[];
  builder: MenuBuilderConfig;
  compact?: boolean;
  interactiveSearch?: boolean;
}

export function MenuPreviewRenderer({
  settings,
  categories,
  items,
  builder,
  compact = false,
  interactiveSearch = true,
}: MenuPreviewRendererProps) {
  const preset = useMemo(
    () =>
      TEMPLATE_PRESETS.find((t) => t.id === builder.templateId) ??
      TEMPLATE_PRESETS[0],
    [builder.templateId]
  );

  const visibleCategories = useMemo(
    () =>
      [...categories]
        .filter((c) => c.visible)
        .sort((a, b) => a.order - b.order),
    [categories]
  );

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.available && compact) return false;
      const matchesCat =
        activeCategoryId === 'all' || item.categoryId === activeCategoryId;
      const q = searchQuery.trim();
      const matchesSearch =
        !q ||
        item.name.includes(q) ||
        item.description.includes(q);
      return matchesCat && matchesSearch;
    });
  }, [items, activeCategoryId, searchQuery, compact]);

  const radiusClass =
    builder.cardRadius === 'sm'
      ? 'rounded-lg'
      : builder.cardRadius === 'lg'
        ? 'rounded-2xl'
        : 'rounded-xl';

  const borderSubtle = preset.isDark
    ? 'border-white/10'
    : 'border-stone-200';

  const accent = builder.accentColor || preset.accentColor;

  const renderLayer = (layerId: string) => {
    switch (layerId) {
      case 'header':
        return (
          <div key="header" className="relative overflow-hidden">
            <div className={compact ? 'h-32 relative' : 'h-48 sm:h-56 relative'}>
              <SafeImage
                src={HERO_IMAGE}
                alt={builder.headerTitle || settings.cafeName}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: preset.isDark
                    ? 'linear-gradient(to top, rgba(22,19,17,0.96) 10%, rgba(22,19,17,0.55) 60%, rgba(22,19,17,0.35) 100%)'
                    : 'linear-gradient(to top, rgba(246,243,238,0.98) 12%, rgba(246,243,238,0.6) 65%, rgba(0,0,0,0.25) 100%)',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex flex-col items-center text-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2 border"
                  style={{
                    backgroundColor: `${accent}22`,
                    borderColor: `${accent}55`,
                    color: accent,
                  }}
                >
                  <Coffee className="w-5 h-5" />
                </div>
                <h2
                  className={`font-bold tracking-tight ${compact ? 'text-lg' : 'text-2xl sm:text-3xl'}`}
                  style={{ color: preset.textColor }}
                >
                  {builder.headerTitle || settings.cafeName}
                </h2>
                <p
                  className={`mt-1 ${compact ? 'text-xs' : 'text-sm'}`}
                  style={{ color: preset.mutedColor }}
                >
                  {builder.headerSubtitle || settings.tagline}
                </p>
              </div>
            </div>
          </div>
        );

      case 'banner':
        if (!builder.bannerText.trim()) return null;
        return (
          <div key="banner" className={compact ? 'px-3 pt-2' : 'px-4 sm:px-6 pt-4'}>
            <div
              className={`${radiusClass} px-3.5 py-2.5 flex items-center gap-2.5 border text-xs sm:text-sm`}
              style={{
                backgroundColor: `${accent}16`,
                borderColor: `${accent}40`,
                color: preset.textColor,
              }}
            >
              <Sparkles className="w-4 h-4 shrink-0" style={{ color: accent }} />
              <span className="leading-relaxed">{builder.bannerText}</span>
            </div>
          </div>
        );

      case 'categories':
        return (
          <div
            key="categories"
            className={`${compact ? 'px-3 pt-3' : 'px-4 sm:px-6 pt-5'} space-y-3`}
          >
            {interactiveSearch && !compact && (
              <div className="relative">
                <Search
                  className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: preset.mutedColor }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در منو (مثلاً لاته، اسپرسو، کروسان...)"
                  className={`w-full pr-10 pl-4 py-2.5 text-sm border ${radiusClass} focus:outline-none transition-colors`}
                  style={{
                    backgroundColor: preset.cardBg,
                    borderColor: preset.isDark ? 'rgba(255,255,255,0.12)' : '#E5E0D8',
                    color: preset.textColor,
                  }}
                />
              </div>
            )}

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveCategoryId('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 border`}
                style={{
                  backgroundColor: activeCategoryId === 'all' ? accent : preset.cardBg,
                  borderColor:
                    activeCategoryId === 'all'
                      ? accent
                      : preset.isDark
                        ? 'rgba(255,255,255,0.12)'
                        : '#E5E0D8',
                  color: activeCategoryId === 'all' ? '#FFFFFF' : preset.textColor,
                }}
              >
                همه موارد
              </button>
              {visibleCategories.map((cat) => {
                const isActive = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 border"
                    style={{
                      backgroundColor: isActive ? accent : preset.cardBg,
                      borderColor: isActive
                        ? accent
                        : preset.isDark
                          ? 'rgba(255,255,255,0.12)'
                          : '#E5E0D8',
                      color: isActive ? '#FFFFFF' : preset.textColor,
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'products':
        return (
          <div
            key="products"
            className={compact ? 'p-3 space-y-2.5' : 'p-4 sm:p-6 space-y-3'}
          >
            {filteredItems.length === 0 ? (
              <div
                className={`${radiusClass} border ${borderSubtle} p-8 text-center`}
                style={{ backgroundColor: preset.cardBg, color: preset.mutedColor }}
              >
                <p className="text-sm">موردی در این دسته‌بندی یافت نشد.</p>
              </div>
            ) : (
              <div
                className={
                  builder.layoutMode === 'grid' && !compact
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5'
                    : 'flex flex-col gap-3'
                }
              >
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${radiusClass} border ${borderSubtle} overflow-hidden transition-colors flex ${
                      builder.layoutMode === 'grid' && !compact
                        ? 'flex-col'
                        : 'flex-row items-center gap-3 p-2.5 sm:p-3'
                    } ${!item.available ? 'opacity-60' : ''}`}
                    style={{ backgroundColor: preset.cardBg }}
                  >
                    {builder.showImages && (
                      <div
                        className={
                          builder.layoutMode === 'grid' && !compact
                            ? 'w-full h-40 overflow-hidden'
                            : compact
                              ? 'w-14 h-14 rounded-lg overflow-hidden shrink-0'
                              : 'w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0'
                        }
                      >
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={`flex-1 min-w-0 ${
                        builder.layoutMode === 'grid' && !compact ? 'p-3.5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-semibold truncate ${
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          }`}
                          style={{ color: preset.textColor }}
                        >
                          {item.name}
                        </h3>
                        {!item.available && (
                          <span
                            className="text-[11px] font-medium shrink-0"
                            style={{ color: accent }}
                          >
                            ناموجود
                          </span>
                        )}
                      </div>

                      {builder.showDescriptions && (
                        <p
                          className={`mt-1 leading-relaxed line-clamp-2 ${
                            compact ? 'text-[11px]' : 'text-xs sm:text-sm'
                          }`}
                          style={{ color: preset.mutedColor }}
                        >
                          {item.description}
                        </p>
                      )}

                      {builder.showPrices && (
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`font-bold tabular-nums ${
                              compact ? 'text-xs' : 'text-sm'
                            }`}
                            style={{ color: accent }}
                          >
                            {formatPriceToman(item.price)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'footer':
        if (compact) return null;
        return (
          <footer
            key="footer"
            className="mx-4 sm:mx-6 mb-6 mt-2 pt-5 border-t space-y-3 text-xs"
            style={{ borderColor: preset.isDark ? 'rgba(255,255,255,0.1)' : '#E5E0D8', color: preset.mutedColor }}
          >
            {builder.footerNote && (
              <p className="leading-relaxed">{builder.footerNote}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                <span>{settings.workingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                <span className="tabular-nums">{settings.phone}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                <span>{settings.address}</span>
              </div>
              {settings.wifiName && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Wifi className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                  <span className="font-mono text-[11px]" dir="ltr">
                    Wi-Fi: {settings.wifiName} / Pass: {settings.wifiPassword}
                  </span>
                </div>
              )}
            </div>
          </footer>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="w-full min-h-full transition-colors duration-200"
      style={{
        backgroundColor: preset.surfaceBg,
        color: preset.textColor,
      }}
    >
      {builder.layers
        .filter((l) => l.visible)
        .map((layer) => renderLayer(layer.id))}
    </div>
  );
}
