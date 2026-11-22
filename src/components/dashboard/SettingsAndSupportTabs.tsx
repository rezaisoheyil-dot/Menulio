import { useRef, useState } from 'react';
import {
  Check,
  Copy,
  Send,
  MessageSquare,
  Smartphone,
  ArrowDown,
  ArrowUp,
  Palette,
} from 'lucide-react';
import {
  CafeSettings,
  CafeState,
  MenuBuilderConfig,
  SupportTicket,
} from '../../types/cafe';
import { TEMPLATE_PRESETS } from '../../data/initialData';
import { MenuPreviewRenderer } from '../MenuPreviewRenderer';

interface SettingsTabProps {
  state: CafeState;
  onUpdateSettings: (settings: CafeSettings) => void;
  onUpdateBuilder?: (builder: MenuBuilderConfig) => void;
}

const ACCENT_OPTIONS = ['#E66F1E', '#B45309', '#C9A227', '#7C4D63', '#0F766E', '#4F46E5'];

export function SettingsTab({
  state,
  onUpdateSettings,
  onUpdateBuilder,
}: SettingsTabProps) {
  const [form, setForm] = useState<CafeSettings>(state.settings);
  const [builderDraft, setBuilderDraft] = useState<MenuBuilderConfig>(state.builder);
  const [saved, setSaved] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const syncedBuilder: MenuBuilderConfig = {
      ...builderDraft,
      headerTitle:
        builderDraft.headerTitle === state.settings.cafeName
          ? form.cafeName
          : builderDraft.headerTitle,
      headerSubtitle:
        builderDraft.headerSubtitle === state.settings.tagline
          ? form.tagline
          : builderDraft.headerSubtitle,
    };
    onUpdateSettings(form);
    onUpdateBuilder?.(syncedBuilder);
    setBuilderDraft(syncedBuilder);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopySecret = () => {
    navigator.clipboard?.writeText(form.wpWebhookSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const scrollPreviewTo = (position: 'top' | 'bottom') => {
    const el = previewScrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: position === 'top' ? 0 : el.scrollHeight,
      behavior: 'smooth',
    });
  };

  // Reflect unsaved cafeName/tagline and appearance changes instantly in the preview
  const livePreviewBuilder: MenuBuilderConfig = {
    ...builderDraft,
    headerTitle:
      builderDraft.headerTitle === state.settings.cafeName
        ? form.cafeName
        : builderDraft.headerTitle,
    headerSubtitle:
      builderDraft.headerSubtitle === state.settings.tagline
        ? form.tagline
        : builderDraft.headerSubtitle,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900">تنظیمات منو، کافه و وردپرس</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            تغییرات اطلاعات کافه و ظاهر منو را هم‌زمان در پنل پیش‌نمایش موبایل مشاهده و ذخیره کنید.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E66F1E] hover:bg-[#cf5f15] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Check className="w-4 h-4" />
          <span>ذخیره تنظیمات</span>
        </button>
      </div>

      {saved && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-800">
          تنظیمات کافه و ظاهر منو با موفقیت ذخیره و در منوی آنلاین اعمال شد.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Right Column: Settings Forms */}
        <div className="xl:col-span-7 space-y-6">
          {/* Cafe Info */}
          <div className="rounded-xl bg-white border border-stone-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="sm:col-span-2 pb-1 border-b border-stone-100">
              <h2 className="font-bold text-stone-900 text-sm">مشخصات کافه و اطلاعات تماس</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                نام کافه / رستوران
              </label>
              <input
                type="text"
                value={form.cafeName}
                onChange={(e) => setForm({ ...form, cafeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#543B6E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                نامک اختصاصی لینک منو (Slug)
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-mono text-xs focus:outline-none focus:border-[#543B6E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                معرفی کوتاه (شعار زیر نام کافه)
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#543B6E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                شماره تماس
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 tabular-nums focus:outline-none focus:border-[#543B6E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                ساعات کاری
              </label>
              <input
                type="text"
                value={form.workingHours}
                onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#543B6E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                آدرس شعبه
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#543B6E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                نام شبکه Wi-Fi مشتریان
              </label>
              <input
                type="text"
                value={form.wifiName}
                onChange={(e) => setForm({ ...form, wifiName: e.target.value })}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-mono text-xs focus:outline-none focus:border-[#543B6E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                رمز عبور Wi-Fi
              </label>
              <input
                type="text"
                value={form.wifiPassword}
                onChange={(e) => setForm({ ...form, wifiPassword: e.target.value })}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-mono text-xs focus:outline-none focus:border-[#543B6E]"
              />
            </div>
          </div>

          {/* Menu Visual & Display Settings */}
          <div className="rounded-xl bg-white border border-stone-200 p-6 space-y-5 text-sm">
            <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
              <Palette className="w-4 h-4 text-[#543B6E]" />
              <h2 className="font-bold text-stone-900 text-sm">تنظیمات ظاهر و نمایش منو</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  قالب رنگی منو
                </label>
                <select
                  value={builderDraft.templateId}
                  onChange={(e) => {
                    const tpl = TEMPLATE_PRESETS.find((t) => t.id === e.target.value);
                    setBuilderDraft({
                      ...builderDraft,
                      templateId: e.target.value as MenuBuilderConfig['templateId'],
                      accentColor: tpl?.accentColor ?? builderDraft.accentColor,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:border-[#543B6E]"
                >
                  {TEMPLATE_PRESETS.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.styleLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  رنگ تاکیدی دکمه‌ها و قیمت
                </label>
                <div className="flex items-center gap-2 pt-1.5">
                  {ACCENT_OPTIONS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() =>
                        setBuilderDraft({ ...builderDraft, accentColor: hex })
                      }
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        builderDraft.accentColor === hex
                          ? 'border-stone-900 scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: hex }}
                      aria-label={`رنگ ${hex}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                متن بنر اطلاع‌رسانی / تخفیف بالای منو
              </label>
              <input
                type="text"
                value={builderDraft.bannerText}
                onChange={(e) =>
                  setBuilderDraft({ ...builderDraft, bannerText: e.target.value })
                }
                placeholder="مثلاً ۲۰٪ تخفیف صبحانه..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#543B6E]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-stone-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={builderDraft.showImages}
                  onChange={(e) =>
                    setBuilderDraft({ ...builderDraft, showImages: e.target.checked })
                  }
                  className="accent-[#543B6E]"
                />
                <span>نمایش تصویر محصولات</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={builderDraft.showDescriptions}
                  onChange={(e) =>
                    setBuilderDraft({
                      ...builderDraft,
                      showDescriptions: e.target.checked,
                    })
                  }
                  className="accent-[#543B6E]"
                />
                <span>نمایش توضیحات</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={builderDraft.showPrices}
                  onChange={(e) =>
                    setBuilderDraft({ ...builderDraft, showPrices: e.target.checked })
                  }
                  className="accent-[#543B6E]"
                />
                <span>نمایش قیمت</span>
              </label>
            </div>
          </div>

          {/* WordPress API Integration Settings */}
          <div className="rounded-xl bg-white border border-stone-200 p-6 space-y-4">
            <h2 className="font-bold text-stone-900 text-sm">
              پیکربندی افزونه وردپرس و ووکامرس (WordPress SaaS Bridge)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  آدرس سایت وردپرس متصل
                </label>
                <input
                  type="url"
                  value={form.wpSiteUrl}
                  onChange={(e) => setForm({ ...form, wpSiteUrl: e.target.value })}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-mono text-xs focus:outline-none focus:border-[#543B6E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  کلید امنیتی وب‌هوک (Webhook Secret)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={form.wpWebhookSecret}
                    dir="ltr"
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50 font-mono text-xs text-stone-600"
                  />
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-2.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700"
                    title="کپی کلید"
                  >
                    {copiedSecret ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Column: Real-Time Mobile Live Preview Panel */}
        <aside className="xl:col-span-5 xl:sticky xl:top-24 rounded-2xl bg-white border border-stone-200 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#E66F1E]" />
              <h2 className="font-bold text-stone-900 text-sm">
                پیش‌نمایش در لحظه (نمای موبایل)
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollPreviewTo('top')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 text-[11px] font-medium text-stone-600 hover:bg-stone-50 whitespace-nowrap shrink-0"
                title="مشاهده سربرگ"
              >
                <ArrowUp className="w-3 h-3" />
                <span>سربرگ</span>
              </button>
              <button
                type="button"
                onClick={() => scrollPreviewTo('bottom')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 text-[11px] font-medium text-stone-600 hover:bg-stone-50 whitespace-nowrap shrink-0"
                title="مشاهده پاورقی و اطلاعات تماس"
              >
                <ArrowDown className="w-3 h-3" />
                <span>اطلاعات تماس</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-[#EAE7E2] p-4 flex flex-col items-center">
            {/* Mobile Device Frame */}
            <div className="w-full max-w-[330px] rounded-[2.2rem] border-[6px] border-[#1F1C1A] bg-[#161311] shadow-xl overflow-hidden">
              {/* Mobile Status / URL Bar */}
              <div className="bg-[#1F1C1A] px-4 pt-2 pb-2.5 flex flex-col items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-stone-700" />
                <div
                  className="w-full rounded-lg bg-black/40 px-3 py-1 text-center font-mono text-[10px] text-stone-300 truncate"
                  dir="ltr"
                >
                  cafemenu.ir/{form.slug || 'my-cafe'}
                </div>
              </div>

              {/* Scrollable Live Menu Viewport */}
              <div
                ref={previewScrollRef}
                className="h-[520px] overflow-y-auto"
              >
                <MenuPreviewRenderer
                  settings={form}
                  categories={state.categories}
                  items={state.items}
                  builder={livePreviewBuilder}
                  interactiveSearch={false}
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 text-center">
            هر تغییری در فرم تنظیمات یا ظاهر منو، بدون نیاز به بارگذاری مجدد در گوشی شبیه‌سازی می‌شود.
          </p>
        </aside>
      </div>
    </form>
  );
}

interface SupportTabProps {
  state: CafeState;
  onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
}

export function SupportTab({ state, onAddTicket }: SupportTabProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('اتصال وردپرس');
  const [message, setMessage] = useState('');
  const [sentNotice, setSentNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    onAddTicket({
      subject: subject.trim(),
      category,
      message: message.trim(),
    });
    setSubject('');
    setMessage('');
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold text-stone-900">پشتیبانی و راهنمای راه‌اندازی</h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          سوالات فنی درباره منوساز، QR کد یا اتصال افزونه وردپرس را با تیم ما در میان بگذارید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 rounded-xl bg-white border border-stone-200 p-5 space-y-4"
        >
          <h2 className="font-bold text-stone-900 text-sm">ارسال تیکت جدید</h2>

          {sentNotice && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
              تیکت شما ثبت شد و به زودی پاسخ داده می‌شود.
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              موضوع تیکت
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثلاً اتصال دامنه اختصاصی"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#543B6E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              بخش مربوطه
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none"
            >
              <option value="اتصال وردپرس">اتصال وردپرس و ووکامرس</option>
              <option value="اشتراک و مالی">اشتراک و امور مالی</option>
              <option value="طراحی منو">طراحی منو و QR کد</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              متن پیام
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="توضیحات خود را بنویسید..."
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#543B6E]"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#543B6E] hover:bg-[#432e59] text-white text-xs font-semibold transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ثبت و ارسال تیکت</span>
          </button>
        </form>

        <div className="lg:col-span-7 space-y-3">
          {state.tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl bg-white border border-stone-200 p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#543B6E]" />
                    <span>{ticket.subject}</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {ticket.category} · {ticket.createdAt}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    ticket.status === 'answered'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {ticket.status === 'answered' ? 'پاسخ داده شده' : 'در انتظار بررسی'}
                </span>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                {ticket.message}
              </p>

              {ticket.reply && (
                <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 text-xs text-stone-700 leading-relaxed">
                  <strong className="text-[#543B6E]">پاسخ پشتیبانی: </strong>
                  {ticket.reply}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
