import { useState } from 'react';
import {
  Coffee,
  LayoutGrid,
  MonitorSmartphone,
  Paintbrush,
  QrCode,
  Play,
  ArrowLeft,
  Check,
  Code2,
  ShieldCheck,
  Download,
} from 'lucide-react';
import {
  downloadWordPressPluginZip,
  downloadWordPressThemeZip,
} from '../utils/zipExport';
import {
  BillingCycle,
  CafeState,
  PlanTierId,
  TemplateId,
} from '../types/cafe';
import {
  HERO_IMAGE,
  SUBSCRIPTION_PLANS,
  TEMPLATE_PRESETS,
  formatPriceToman,
  toPersianDigits,
} from '../data/initialData';
import { SafeImage } from './SafeImage';
import { MenuPreviewRenderer } from './MenuPreviewRenderer';

interface LandingPageProps {
  state: CafeState;
  onEnterDashboard: (initialTab?: 'overview' | 'builder' | 'subscription') => void;
  onOpenLiveMenu: () => void;
  onSelectTemplateAndEdit: (templateId: TemplateId) => void;
  onActivatePlan: (planId: PlanTierId, cycle: BillingCycle, cafeName?: string) => void;
}

export function LandingPage({
  state,
  onEnterDashboard,
  onOpenLiveMenu,
  onSelectTemplateAndEdit,
  onActivatePlan,
}: LandingPageProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(state.billingCycle);
  const [selectedSignupPlan, setSelectedSignupPlan] = useState<PlanTierId | null>(null);
  const [newCafeName, setNewCafeName] = useState(state.settings.cafeName);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [signupError, setSignupError] = useState('');

  const handlePlanCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSignupPlan) return;
    if (!newCafeName.trim()) {
      setSignupError('لطفاً نام کافه یا رستوران خود را وارد کنید.');
      return;
    }
    setSignupError('');
    onActivatePlan(selectedSignupPlan, billingCycle, newCafeName.trim());
    setSelectedSignupPlan(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F4] text-[#1C1917]">
      {/* Dark Hero Section with integrated 3-zone Top Bar */}
      <section className="relative bg-[#161210] text-[#F5F2EE] overflow-hidden">
        <div className="absolute inset-0 opacity-35">
          <SafeImage
            src={HERO_IMAGE}
            alt="فضای کافه تخصصی"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#161210] via-[#161210]/85 to-[#161210]/70" />
        </div>

        {/* 3-Zone Top Bar */}
        <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-8 border-b border-white/10">
          <a
            href="#top"
            className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            <Coffee className="w-6 h-6 text-[#E66F1E]" />
            <span className="font-['Plus_Jakarta_Sans',sans-serif]">CafeMenu</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-300">
            <a href="#top" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              خانه
            </a>
            <a href="#features" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              امکانات
            </a>
            <a href="#templates" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              قالب‌ها
            </a>
            <a href="#pricing" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              تعرفه‌ها
            </a>
            <a href="#wordpress" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              اتصال وردپرس
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onEnterDashboard('overview')}
              className="px-5 py-2.5 rounded-lg bg-[#E66F1E] hover:bg-[#cf5f15] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              ورود به پنل کافه
            </button>
          </div>
        </header>

        {/* Hero Split Content */}
        <div
          id="top"
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
        >
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs sm:text-sm font-medium text-[#F59E0B] tracking-wide">
              پلتفرم اشتراکی منوساز دیجیتال · سازگار با وردپرس و ووکامرس
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight text-balance text-white">
              منوی دیجیتال حرفه‌ای برای{' '}
              <span className="text-[#E66F1E]">کافه و رستوران</span> شما
            </h1>
            <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl">
              در چند دقیقه منوی آنلاین زیبا و اختصاصی کافه خود را بسازید، با QR کد
              روی میزها در اختیار مشتریان قرار دهید و از طریق پنل مدیریت، قیمت‌ها،
              موجودی و اشتراک خود را لحظه‌ای کنترل کنید.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onEnterDashboard('builder')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#E66F1E] hover:bg-[#cf5f15] text-white font-semibold text-base transition-colors whitespace-nowrap shrink-0"
              >
                <span>شروع رایگان و ساخت منو</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenLiveMenu}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-white/25 bg-white/5 hover:bg-white/10 text-white font-medium text-base transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="w-4 h-4 text-[#E66F1E]" />
                <span>مشاهده دموی منو</span>
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-stone-400">
              <span>راه‌اندازی در کمتر از ۳ دقیقه</span>
              <span aria-hidden="true">·</span>
              <span>پشتیبانی از اشتراک ماهانه و سالانه</span>
              <span aria-hidden="true">·</span>
              <span>خروجی شورت‌کد اختصاصی وردپرس</span>
            </div>
          </div>

          {/* Interactive Live Smartphone Preview */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-[300px] sm:w-[320px] rounded-[2.25rem] border-[6px] border-[#2C2521] bg-[#161311] shadow-2xl overflow-hidden">
              <div className="h-6 bg-[#1F1A17] flex items-center justify-center">
                <div className="w-16 h-1.5 rounded-full bg-stone-700" />
              </div>
              <div className="h-[460px] overflow-y-auto">
                <MenuPreviewRenderer
                  settings={state.settings}
                  categories={state.categories}
                  items={state.items}
                  builder={state.builder}
                  compact
                  interactiveSearch={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Feature Strip */}
      <section id="features" className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#543B6E]/10 text-[#543B6E] flex items-center justify-center shrink-0">
              <MonitorSmartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">مدیریت آسان</h3>
              <p className="text-sm text-stone-600 mt-1">
                تغییر قیمت و موجودی محصولات در موبایل و دسکتاپ بدون نیاز به دانش فنی
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#543B6E]/10 text-[#543B6E] flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">قالب‌های متنوع</h3>
              <p className="text-sm text-stone-600 mt-1">
                طراحی‌های اختصاصی دارک، مینیمال، کلاسیک و بوتانیکال متناسب با هویت برند شما
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#543B6E]/10 text-[#543B6E] flex items-center justify-center shrink-0">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">منوساز بصری</h3>
              <p className="text-sm text-stone-600 mt-1">
                چیدمان بخش‌ها، رنگ‌بندی، بنر تخفیف و پیش‌نمایش زنده موبایل و تبلت
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#543B6E]/10 text-[#543B6E] flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">QR کد اختصاصی</h3>
              <p className="text-sm text-stone-600 mt-1">
                تولید آنی QR کد با قابلیت دانلود باکیفیت و چاپ مستقیم استند رومیزی
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 text-balance">
            نمونه قالب‌های منوی دیجیتال
          </h2>
          <p className="text-stone-600 mt-2.5 text-sm sm:text-base">
            از بین قالب‌های آماده، طرح مورد علاقه‌تان را انتخاب و در پنل کاربری شخصی‌سازی کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATE_PRESETS.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-2xl border border-stone-200 bg-white overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1"
            >
              <div
                className="p-4 h-64 flex flex-col justify-between relative overflow-hidden"
                style={{ backgroundColor: tpl.surfaceBg, color: tpl.textColor }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-base">{tpl.name}</p>
                    <p className="text-xs opacity-75">{tpl.styleLabel}</p>
                  </div>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tpl.accentColor }}
                  />
                </div>

                <div
                  className="rounded-xl p-2.5 border flex items-center gap-3 my-auto"
                  style={{
                    backgroundColor: tpl.cardBg,
                    borderColor: tpl.isDark ? 'rgba(255,255,255,0.1)' : '#E7E2DA',
                  }}
                >
                  <SafeImage
                    src={tpl.previewImage}
                    alt={tpl.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">لاته اسپشیالتی</p>
                    <p className="text-[11px] opacity-70 truncate mt-0.5">
                      اسپرسو و شیر بخار داده شده
                    </p>
                    <p
                      className="text-xs font-bold mt-1 tabular-nums"
                      style={{ color: tpl.accentColor }}
                    >
                      ۱۲۰,۰۰۰ تومان
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] opacity-80">
                  <span>نوشیدنی گرم · دسر</span>
                  <span>QR فعال</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  {tpl.description}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectTemplateAndEdit(tpl.id)}
                  className="w-full py-2.5 px-4 rounded-lg border border-stone-300 hover:border-[#E66F1E] hover:bg-[#E66F1E] hover:text-white text-stone-800 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  انتخاب و ویرایش با این قالب
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription & Membership Plans */}
      <section id="pricing" className="bg-white border-y border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                تعرفه‌های حق عضویت و اشتراک
              </h2>
              <p className="text-stone-600 mt-2 text-sm sm:text-base">
                پلن متناسب با ابعاد کافه یا رستوران خود را انتخاب کنید؛ امکان ارتقا در هر زمان وجود دارد.
              </p>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200 self-start">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                پرداخت ماهانه
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                پرداخت سالانه (۲۰٪ تخفیف)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const price =
                billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const isPro = plan.id === 'pro';
              const isCurrent = state.currentPlanId === plan.id && state.billingCycle === billingCycle;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 sm:p-7 border flex flex-col justify-between ${
                    isPro
                      ? 'bg-[#181722] text-white border-[#543B6E]'
                      : 'bg-[#FAF9F7] text-stone-900 border-stone-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      {isPro && (
                        <span className="text-xs font-semibold text-[#F59E0B]">
                          پیشنهاد ویژه
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm mt-1.5 ${
                        isPro ? 'text-stone-300' : 'text-stone-600'
                      }`}
                    >
                      {plan.audience}
                    </p>

                    <div className="mt-6 pb-6 border-b border-current/10">
                      {price === 0 ? (
                        <div className="text-3xl font-extrabold tabular-nums">
                          رایگان
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold tabular-nums">
                            {formatPriceToman(price)}
                          </span>
                          <span
                            className={`text-xs ${
                              isPro ? 'text-stone-400' : 'text-stone-500'
                            }`}
                          >
                            / {billingCycle === 'monthly' ? 'ماهانه' : 'سالانه'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 space-y-2.5 text-xs sm:text-sm">
                      <div className="flex items-center justify-between py-1">
                        <span className={isPro ? 'text-stone-400' : 'text-stone-500'}>
                          سقف محصولات
                        </span>
                        <span className="font-semibold tabular-nums">
                          {plan.maxProducts ? `${toPersianDigits(plan.maxProducts)} محصول` : 'نامحدود'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className={isPro ? 'text-stone-400' : 'text-stone-500'}>
                          تعداد شعبه
                        </span>
                        <span className="font-semibold tabular-nums">
                          {toPersianDigits(plan.maxBranches)} شعبه
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className={isPro ? 'text-stone-400' : 'text-stone-500'}>
                          اتصال افزونه وردپرس
                        </span>
                        <span className="font-semibold">
                          {plan.wpSync ? 'دارد' : 'ندارد'}
                        </span>
                      </div>
                    </div>

                    <ul className="mt-6 space-y-3 text-sm">
                      {plan.highlights.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#E66F1E] shrink-0 mt-0.5" />
                          <span className={isPro ? 'text-stone-200' : 'text-stone-700'}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSignupPlan(plan.id)}
                    className={`mt-8 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isPro
                        ? 'bg-[#E66F1E] hover:bg-[#cf5f15] text-white'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    {isCurrent ? 'مدیریت اشتراک فعلی در پنل' : 'انتخاب پلن و ورود به پنل'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WordPress Integration Architecture Section */}
      <section id="wordpress" className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#543B6E]">
              <Code2 className="w-4 h-4" />
              <span>آماده اتصال به وردپرس و ووکامرس</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 text-balance">
              ساختار یکپارچه برای راه‌اندازی پلتفرم اشتراکی روی وردپرس
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              علاوه بر پنل اختصاصی کافه‌داران، هر کافه در سیستم یک شناسه و شورت‌کد
              وردپرس دریافت می‌کند. اشتراک‌های ماهانه و سالانه مستقیماً از طریق
              ووکامرس یا درگاه پرداخت ایرانی فعال شده و دسترسی منوساز بصری به صورت
              خودکار برای کاربر باز می‌شود.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#E66F1E] shrink-0 mt-1" />
                <span className="text-stone-700">
                  احراز هویت بر اساس نقش کاربری کافه‌دار (Cafe Owner Role)
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#E66F1E] shrink-0 mt-1" />
                <span className="text-stone-700">
                  همگام‌سازی وب‌هوک تمدید و انقضای اشتراک ووکامرس
                </span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => downloadWordPressThemeZip(JSON.stringify(state, null, 2))}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E66F1E] hover:bg-[#cf5f15] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>دانلود پوسته وردپرس (.zip)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadWordPressPluginZip(JSON.stringify(state, null, 2))}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#543B6E] hover:bg-[#432e59] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>دانلود افزونه (.zip)</span>
              </button>
              <a
                href="/wordpress/cafemenu-saas.php"
                download="cafemenu-saas.php"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <span>فایل PHP</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl bg-[#181722] text-stone-100 p-5 font-mono text-xs space-y-3" dir="ltr">
            <div className="text-stone-400">WordPress Shortcode & REST Bridge</div>
            <div className="p-3 rounded-lg bg-black/35 border border-white/10 text-[#F59E0B] overflow-x-auto">
              [cafemenu_platform] &nbsp;|&nbsp; [cafemenu_digital slug="{state.settings.slug}"]
            </div>
            <div className="p-3 rounded-lg bg-black/35 border border-white/10 text-stone-300 space-y-1">
              <div>POST /wp-json/cafemenu/v1/cafe</div>
              <div className="text-emerald-400">200 OK · plan: "{state.currentPlanId}" ({state.billingCycle})</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Plum CTA Banner (matching mockup) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="rounded-2xl bg-gradient-to-l from-[#4A3463] to-[#634782] text-white px-6 sm:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold">
                همین حالا منوی دیجیتال کافه خود را بسازید
              </h2>
              <p className="text-stone-200 text-sm mt-1">
                ثبت‌نام رایگان و راه‌اندازی پنل اختصاصی در کمتر از ۳ دقیقه
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEnterDashboard('overview')}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#E66F1E] hover:bg-[#cf5f15] text-white font-semibold text-sm sm:text-base transition-colors whitespace-nowrap shrink-0"
          >
            <span>شروع ثبت‌نام رایگان</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-stone-500">
          <div className="flex items-center gap-2 font-semibold text-stone-800">
            <Coffee className="w-4 h-4 text-[#E66F1E]" />
            <span>CafeMenu · پلتفرم منوساز دیجیتال کافه و رستوران</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => onEnterDashboard('overview')}
              className="hover:text-stone-900 transition-colors"
            >
              پنل مدیریت
            </button>
            <button
              type="button"
              onClick={onOpenLiveMenu}
              className="hover:text-stone-900 transition-colors"
            >
              منوی دمو
            </button>
            <span>© ۱۴۰۵ تمامی حقوق محفوظ است</span>
          </div>
        </div>
      </footer>

      {/* Quick Plan Activation Modal */}
      {selectedSignupPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-stone-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">
                فعال‌سازی اشتراک و ورود به پنل
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSignupPlan(null)}
                className="text-xs text-stone-500 hover:text-stone-900"
              >
                بستن
              </button>
            </div>

            <form onSubmit={handlePlanCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  نام کافه یا رستوران
                </label>
                <input
                  type="text"
                  value={newCafeName}
                  onChange={(e) => setNewCafeName(e.target.value)}
                  placeholder="مثلاً کافه روکا"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#E66F1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  ایمیل مدیر مجموعه (اختیاری)
                </label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="manager@rokacafe.ir"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#E66F1E]"
                />
              </div>

              <div className="rounded-xl bg-stone-50 border border-stone-200 p-3.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">طرح انتخابی:</span>
                  <span className="font-bold text-stone-900">
                    {SUBSCRIPTION_PLANS.find((p) => p.id === selectedSignupPlan)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">دوره پرداخت:</span>
                  <span className="font-semibold text-stone-900">
                    {billingCycle === 'monthly' ? 'ماهانه' : 'سالانه (۲۰٪ تخفیف)'}
                  </span>
                </div>
              </div>

              {signupError && (
                <p className="text-xs text-red-600">{signupError}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#E66F1E] hover:bg-[#cf5f15] text-white text-sm font-semibold transition-colors"
                >
                  تایید و ورود به پنل کافه
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSignupPlan(null)}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
