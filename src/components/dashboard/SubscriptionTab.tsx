import { useState } from 'react';
import { Check, Crown, Copy, Code2, Receipt, Download } from 'lucide-react';
import { BillingCycle, CafeState, PlanTierId } from '../../types/cafe';
import {
  SUBSCRIPTION_PLANS,
  formatPriceToman,
  toPersianDigits,
} from '../../data/initialData';
import {
  downloadWordPressPluginZip,
  downloadWordPressThemeZip,
} from '../../utils/zipExport';

interface SubscriptionTabProps {
  state: CafeState;
  onChangePlan: (planId: PlanTierId, cycle: BillingCycle) => void;
}

export function SubscriptionTab({ state, onChangePlan }: SubscriptionTabProps) {
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(state.billingCycle);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [planNotice, setPlanNotice] = useState<string>('');

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === state.currentPlanId);

  const handleSelectPlan = (planId: PlanTierId) => {
    onChangePlan(planId, selectedCycle);
    const chosen = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    setPlanNotice(
      `اشتراک «${chosen?.name}» (${selectedCycle === 'monthly' ? 'ماهانه' : 'سالانه'}) با موفقیت فعال و فاکتور صادر شد.`
    );
    setTimeout(() => setPlanNotice(''), 3500);
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const wpShortcode = `[cafemenu_digital slug="${state.settings.slug}" theme="${state.builder.templateId}"]`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900">
            مدیریت اشتراک و حق عضویت
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            طرح فعال فعلی: <strong className="text-stone-900">{currentPlan?.name}</strong> · اعتبار تا{' '}
            <span className="tabular-nums">{state.subscriptionExpiresAt}</span>
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-stone-200 self-start">
          <button
            type="button"
            onClick={() => setSelectedCycle('monthly')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedCycle === 'monthly'
                ? 'bg-[#181722] text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            دوره ماهانه
          </button>
          <button
            type="button"
            onClick={() => setSelectedCycle('yearly')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedCycle === 'yearly'
                ? 'bg-[#181722] text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            دوره سالانه (۲۰٪ تخفیف)
          </button>
        </div>
      </div>

      {planNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs sm:text-sm font-medium text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{planNotice}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent =
            state.currentPlanId === plan.id && state.billingCycle === selectedCycle;
          const price =
            selectedCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between bg-white ${
                isCurrent ? 'border-[#543B6E] ring-2 ring-[#543B6E]/15' : 'border-stone-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-stone-900 text-lg">{plan.name}</h3>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#543B6E]">
                      <Crown className="w-3.5 h-3.5" />
                      <span>پلن فعلی</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">{plan.audience}</p>

                <div className="mt-5 pb-5 border-b border-stone-100">
                  {price === 0 ? (
                    <span className="text-2xl font-extrabold text-stone-900">رایگان</span>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-stone-900 tabular-nums">
                        {formatPriceToman(price)}
                      </span>
                      <span className="text-xs text-stone-500">
                        / {selectedCycle === 'monthly' ? 'ماهانه' : 'سالانه'}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-stone-700">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#E66F1E] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled={isCurrent}
                onClick={() => handleSelectPlan(plan.id)}
                className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-stone-100 text-stone-400 cursor-default'
                    : 'bg-[#E66F1E] hover:bg-[#cf5f15] text-white'
                }`}
              >
                {isCurrent ? 'اشتراک فعال شما' : 'انتخاب و فعال‌سازی آنی'}
              </button>
            </div>
          );
        })}
      </div>

      {/* WordPress / WooCommerce Bridge & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* WordPress Integration */}
        <div className="lg:col-span-5 rounded-xl bg-white border border-stone-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#543B6E]" />
            <h2 className="font-bold text-stone-900 text-sm">
              شورت‌کد و اتصال وردپرس
            </h2>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            برای نمایش این منو در سایت وردپرسی خود یا اتصال اشتراک به ووکامرس،
            شورت‌کد زیر را در برگه مورد نظر قرار دهید:
          </p>

          <div className="rounded-lg bg-stone-900 text-stone-100 p-3 flex items-center justify-between gap-2">
            <code className="text-xs font-mono truncate" dir="ltr">
              {wpShortcode}
            </code>
            <button
              type="button"
              onClick={() => copyText('shortcode', wpShortcode)}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0"
              title="کپی شورت‌کد"
            >
              {copiedKey === 'shortcode' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="text-xs text-stone-500 flex items-center justify-between pt-1">
            <span>وضعیت همگام‌سازی ووکامرس:</span>
            <span className="font-semibold text-emerald-700">
              {currentPlan?.wpSync ? 'متصل و فعال' : 'نیاز به پلن حرفه‌ای'}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => downloadWordPressThemeZip(JSON.stringify(state, null, 2))}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E66F1E] hover:bg-[#cf5f15] text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود پوسته وردپرس (.zip)</span>
            </button>
            <button
              type="button"
              onClick={() => downloadWordPressPluginZip(JSON.stringify(state, null, 2))}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#543B6E] hover:bg-[#432e59] text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <span>افزونه (.zip)</span>
            </button>
          </div>
        </div>

        {/* Invoice History */}
        <div className="lg:col-span-7 rounded-xl bg-white border border-stone-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#E66F1E]" />
            <h2 className="font-bold text-stone-900 text-sm">سوابق پرداخت و فاکتورها</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2.5 font-semibold">شماره فاکتور</th>
                  <th className="py-2.5 font-semibold">شرح اشتراک</th>
                  <th className="py-2.5 font-semibold">تاریخ</th>
                  <th className="py-2.5 font-semibold">مبلغ</th>
                  <th className="py-2.5 font-semibold">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {state.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 font-mono text-stone-700" dir="ltr">
                      {inv.id}
                    </td>
                    <td className="py-3 font-medium text-stone-900">{inv.planName}</td>
                    <td className="py-3 text-stone-500 tabular-nums">
                      {toPersianDigits(inv.date)}
                    </td>
                    <td className="py-3 font-bold text-stone-900 tabular-nums">
                      {inv.amount === 0 ? 'رایگان' : formatPriceToman(inv.amount)}
                    </td>
                    <td className="py-3 text-emerald-700 font-medium">
                      {inv.status === 'paid' ? 'پرداخت شده' : 'در انتظار'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
