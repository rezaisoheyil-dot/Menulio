import { useState } from 'react';
import {
  Shield,
  Download,
  ExternalLink,
  Check,
  Store,
  MessageSquare,
  Send,
} from 'lucide-react';
import {
  BillingCycle,
  CafeState,
  PlanTierId,
} from '../../types/cafe';
import {
  SUBSCRIPTION_PLANS,
  formatPriceToman,
  toPersianDigits,
} from '../../data/initialData';
import { downloadWordPressThemeZip } from '../../utils/zipExport';

interface AdminPlatformTabProps {
  state: CafeState;
  onReplyTicket: (ticketId: string, reply: string) => void;
  onChangePlan: (planId: PlanTierId, cycle: BillingCycle) => void;
  onOpenLiveMenu: () => void;
}

interface DirectoryCafe {
  id: string;
  name: string;
  owner: string;
  slug: string;
  planId: PlanTierId;
  cycle: BillingCycle;
  productsCount: number;
  active: boolean;
}

export function AdminPlatformTab({
  state,
  onReplyTicket,
  onChangePlan,
  onOpenLiveMenu,
}: AdminPlatformTabProps) {
  const wp = (
    window as unknown as {
      CAFEMENU_WP?: { adminUrl?: string; isAdmin?: boolean };
    }
  ).CAFEMENU_WP;

  const [cafes, setCafes] = useState<DirectoryCafe[]>([
    {
      id: 'cafe-1',
      name: state.settings.cafeName,
      owner: 'مدیر فعلی',
      slug: state.settings.slug,
      planId: state.currentPlanId,
      cycle: state.billingCycle,
      productsCount: state.items.length,
      active: true,
    },
    {
      id: 'cafe-2',
      name: 'کافه آرتی',
      owner: 'آرش محمدی',
      slug: 'arti-bakery',
      planId: 'pro',
      cycle: 'monthly',
      productsCount: 34,
      active: true,
    },
    {
      id: 'cafe-3',
      name: 'کافه نادری کلاسیک',
      owner: 'سهراب کریمی',
      slug: 'naderi-classic',
      planId: 'enterprise',
      cycle: 'yearly',
      productsCount: 68,
      active: true,
    },
    {
      id: 'cafe-4',
      name: 'کافه لونا',
      owner: 'نگار رضایی',
      slug: 'luna-garden',
      planId: 'free',
      cycle: 'monthly',
      productsCount: 12,
      active: true,
    },
  ]);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [adminNotice, setAdminNotice] = useState('');

  const handleCafeUpdate = (
    cafeId: string,
    planId: PlanTierId,
    cycle: BillingCycle,
    active: boolean
  ) => {
    setCafes((prev) =>
      prev.map((c) =>
        c.id === cafeId ? { ...c, planId, cycle, active } : c
      )
    );
    if (cafeId === 'cafe-1') {
      onChangePlan(planId, cycle);
    }
    setAdminNotice('وضعیت اشتراک کافه با موفقیت بروزرسانی شد.');
    setTimeout(() => setAdminNotice(''), 2500);
  };

  const handleTicketReplySubmit = (ticketId: string) => {
    const reply = (replyDrafts[ticketId] ?? '').trim();
    if (!reply) return;
    onReplyTicket(ticketId, reply);
    setReplyDrafts((prev) => ({ ...prev, [ticketId]: '' }));
    setAdminNotice('پاسخ رسمی مدیریت ثبت شد.');
    setTimeout(() => setAdminNotice(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#543B6E]" />
            <span>مدیریت کل پلتفرم (ادمین وردپرس)</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            کنترل کافه‌های عضو، مدیریت اشتراک‌های ماهانه/سالانه، پاسخ به تیکت‌ها و انتقال به پیشخوان وردپرس
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {wp?.adminUrl && (
            <a
              href={wp.adminUrl}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181722] text-white text-xs font-semibold hover:bg-stone-800 whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ورود به پیشخوان وردپرس</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => downloadWordPressThemeZip(JSON.stringify(state, null, 2))}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E66F1E] hover:bg-[#cf5f15] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>دانلود پوسته کامل وردپرس (.zip)</span>
          </button>
        </div>
      </div>

      {adminNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{adminNotice}</span>
        </div>
      )}

      {/* Registered Cafes Directory */}
      <div className="rounded-xl bg-white border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#543B6E]" />
            <h2 className="font-bold text-stone-900 text-sm">
              فهرست کافه‌ها و اشتراک‌های فعال ({toPersianDigits(cafes.length)})
            </h2>
          </div>
          <span className="text-xs text-stone-500">
            ساختار آدرس عمومی در وردپرس: <code dir="ltr">/menu/slug</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-xs text-stone-500">
                <th className="py-3 px-4 font-semibold">نام کافه</th>
                <th className="py-3 px-4 font-semibold">مدیر کافه</th>
                <th className="py-3 px-4 font-semibold">لینک اختصاصی</th>
                <th className="py-3 px-4 font-semibold">محصولات</th>
                <th className="py-3 px-4 font-semibold">پلن و دوره</th>
                <th className="py-3 px-4 font-semibold">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {cafes.map((cafe) => (
                <tr key={cafe.id} className="hover:bg-stone-50/70">
                  <td className="py-3 px-4 font-bold text-stone-900">{cafe.name}</td>
                  <td className="py-3 px-4 text-xs text-stone-600">{cafe.owner}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[#543B6E]" dir="ltr">
                    <button
                      type="button"
                      onClick={onOpenLiveMenu}
                      className="hover:underline"
                    >
                      /menu/{cafe.slug}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-xs tabular-nums text-stone-700">
                    {toPersianDigits(cafe.productsCount)} مورد
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={cafe.planId}
                        onChange={(e) =>
                          handleCafeUpdate(
                            cafe.id,
                            e.target.value as PlanTierId,
                            cafe.cycle,
                            cafe.active
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                      >
                        {SUBSCRIPTION_PLANS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={cafe.cycle}
                        onChange={(e) =>
                          handleCafeUpdate(
                            cafe.id,
                            cafe.planId,
                            e.target.value as BillingCycle,
                            cafe.active
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                      >
                        <option value="monthly">ماهانه</option>
                        <option value="yearly">سالانه</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleCafeUpdate(
                          cafe.id,
                          cafe.planId,
                          cafe.cycle,
                          !cafe.active
                        )
                      }
                      className={`text-xs font-semibold ${
                        cafe.active ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {cafe.active ? 'فعال' : 'معلق'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Summary + Support Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 rounded-xl bg-white border border-stone-200 p-5 space-y-3">
          <h2 className="font-bold text-stone-900 text-sm">
            خلاصه تعرفه‌های فعال در وردپرس
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            پس از نصب پوسته روی وردپرس، از بخش <strong>مدیریت CafeMenu ← تعرفه‌ها و ووکامرس</strong> می‌توانید قیمت‌های تومان و شناسه محصولات ووکامرس را تغییر دهید.
          </p>
          <div className="divide-y divide-stone-100 text-xs pt-1">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div key={plan.id} className="py-3 flex items-center justify-between gap-2">
                <span className="font-semibold text-stone-900">{plan.name}</span>
                <span className="tabular-nums text-stone-600">
                  {plan.monthlyPrice === 0
                    ? 'رایگان'
                    : `${formatPriceToman(plan.monthlyPrice)} / ماهانه`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-xl bg-white border border-stone-200 p-5 space-y-3">
          <h2 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#543B6E]" />
            <span>پاسخ‌گویی به تیکت‌های کافه‌داران</span>
          </h2>
          <div className="space-y-3">
            {state.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-lg border border-stone-200 p-3.5 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{ticket.subject}</span>
                  <span
                    className={
                      ticket.status === 'answered'
                        ? 'text-emerald-700 font-semibold'
                        : 'text-amber-700 font-semibold'
                    }
                  >
                    {ticket.status === 'answered' ? 'پاسخ داده شده' : 'در انتظار'}
                  </span>
                </div>
                <p className="text-stone-600">{ticket.message}</p>
                {ticket.reply && (
                  <p className="text-stone-700 bg-stone-50 p-2 rounded border border-stone-200">
                    <strong>پاسخ ثبت‌شده: </strong>
                    {ticket.reply}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyDrafts[ticket.id] ?? ''}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [ticket.id]: e.target.value,
                      }))
                    }
                    placeholder="نوشتن پاسخ جدید..."
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-[#543B6E]"
                  />
                  <button
                    type="button"
                    onClick={() => handleTicketReplySubmit(ticket.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#543B6E] text-white font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
