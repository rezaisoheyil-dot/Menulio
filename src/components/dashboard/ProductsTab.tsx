import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { CafeState, MenuItem } from '../../types/cafe';
import {
  CAPPUCCINO_IMAGE,
  ESPRESSO_IMAGE,
  HERO_IMAGE,
  ICED_LATTE_IMAGE,
  PASTRY_IMAGE,
  SUBSCRIPTION_PLANS,
  formatPriceToman,
  toPersianDigits,
} from '../../data/initialData';
import { SafeImage } from '../SafeImage';

interface ProductsTabProps {
  state: CafeState;
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  initialOpenAdd?: boolean;
  onClearOpenAdd?: () => void;
}

const IMAGE_CHOICES = [
  { label: 'اسپرسو', url: ESPRESSO_IMAGE },
  { label: 'کاپوچینو و لاته', url: CAPPUCCINO_IMAGE },
  { label: 'نوشیدنی سرد', url: ICED_LATTE_IMAGE },
  { label: 'کیک و کروسان', url: PASTRY_IMAGE },
  { label: 'فضای کافه', url: HERO_IMAGE },
];

export function ProductsTab({
  state,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  initialOpenAdd = false,
  onClearOpenAdd,
}: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(initialOpenAdd);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('120000');
  const [formCategoryId, setFormCategoryId] = useState(
    state.categories[0]?.id ?? ''
  );
  const [formImage, setFormImage] = useState(CAPPUCCINO_IMAGE);
  const [formAvailable, setFormAvailable] = useState(true);
  const [formError, setFormError] = useState('');

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === state.currentPlanId);
  const reachedPlanLimit =
    currentPlan?.maxProducts !== null &&
    currentPlan?.maxProducts !== undefined &&
    state.items.length >= currentPlan.maxProducts;

  const filteredItems = useMemo(() => {
    return state.items.filter((item) => {
      const matchesCat =
        categoryFilter === 'all' || item.categoryId === categoryFilter;
      const q = searchQuery.trim();
      const matchesQuery =
        !q || item.name.includes(q) || item.description.includes(q);
      return matchesCat && matchesQuery;
    });
  }, [state.items, categoryFilter, searchQuery]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('145000');
    setFormCategoryId(state.categories[0]?.id ?? '');
    setFormImage(CAPPUCCINO_IMAGE);
    setFormAvailable(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormPrice(String(item.price));
    setFormCategoryId(item.categoryId);
    setFormImage(item.image);
    setFormAvailable(item.available);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    onClearOpenAdd?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(formPrice.replace(/,/g, ''));
    if (!formName.trim()) {
      setFormError('نام محصول الزامی است.');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setFormError('لطفاً قیمت معتبر به تومان وارد کنید.');
      return;
    }

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        name: formName.trim(),
        description: formDescription.trim(),
        price: numericPrice,
        categoryId: formCategoryId,
        image: formImage,
        available: formAvailable,
      });
    } else {
      onAddItem({
        name: formName.trim(),
        description: formDescription.trim(),
        price: numericPrice,
        categoryId: formCategoryId,
        image: formImage,
        available: formAvailable,
        featured: false,
      });
    }
    closeModal();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900">مدیریت محصولات منو</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {toPersianDigits(state.items.length)} محصول ثبت شده
            {currentPlan?.maxProducts
              ? ` · سقف پلن فعلی: ${toPersianDigits(currentPlan.maxProducts)} محصول`
              : ' · بدون محدودیت تعداد در پلن فعلی'}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={reachedPlanLimit}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E66F1E] hover:bg-[#cf5f15] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن محصول جدید</span>
        </button>
      </div>

      {reachedPlanLimit && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex items-center gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            به سقف مجاز محصولات در پلن رایگان رسیده‌اید. برای ثبت محصولات نامحدود،
            اشتراک خود را به پلن حرفه‌ای ارتقا دهید.
          </span>
        </div>
      )}

      {/* Search and Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام یا توضیحات محصول..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-[#543B6E]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-[#181722] text-white border-[#181722]'
                : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900'
            }`}
          >
            همه ({toPersianDigits(state.items.length)})
          </button>
          {state.categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat.id
                  ? 'bg-[#181722] text-white border-[#181722]'
                  : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl bg-white border border-stone-200 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-stone-600">
              محصولی مطابق با جستجو یا فیلتر انتخابی یافت نشد.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-medium"
            >
              افزودن اولین محصول
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500">
                  <th className="py-3 px-4 font-semibold">محصول</th>
                  <th className="py-3 px-4 font-semibold">دسته‌بندی</th>
                  <th className="py-3 px-4 font-semibold">قیمت</th>
                  <th className="py-3 px-4 font-semibold">وضعیت موجودی</th>
                  <th className="py-3 px-4 font-semibold text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {filteredItems.map((item) => {
                  const catName =
                    state.categories.find((c) => c.id === item.categoryId)?.name ??
                    'بدون دسته';
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <SafeImage
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 rounded-lg object-cover shrink-0 border border-stone-200"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-stone-500 truncate max-w-xs">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-stone-600 whitespace-nowrap">
                        {catName}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900 tabular-nums whitespace-nowrap">
                        {formatPriceToman(item.price)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateItem({ ...item, available: !item.available })
                          }
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            item.available ? 'text-emerald-700' : 'text-stone-400'
                          }`}
                        >
                          {item.available ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                          <span>{item.available ? 'موجود در منو' : 'ناموجود'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-left whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            title="ویرایش محصول"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item.id)}
                            className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="حذف محصول"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-stone-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">
                {editingItem ? 'ویرایش محصول' : 'افزودن محصول جدید'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-xs text-stone-500 hover:text-stone-900"
              >
                بستن
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    نام محصول
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثلاً موکا فندق"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#E66F1E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    قیمت (تومان)
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm tabular-nums focus:outline-none focus:border-[#E66F1E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  دسته‌بندی
                </label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:border-[#E66F1E]"
                >
                  {state.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  توضیحات و ترکیبات
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="توضیح کوتاه درباره طعم و ترکیبات محصول..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#E66F1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-2">
                  تصویر محصول
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {IMAGE_CHOICES.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => setFormImage(img.url)}
                      className={`rounded-lg overflow-hidden border-2 transition-all ${
                        formImage === img.url
                          ? 'border-[#E66F1E]'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <SafeImage
                        src={img.url}
                        alt={img.label}
                        className="w-full h-14 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                  className="rounded accent-[#E66F1E]"
                />
                <span>نمایش به عنوان محصول موجود در منوی آنلاین</span>
              </label>

              {formError && <p className="text-xs text-red-600">{formError}</p>}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#E66F1E] hover:bg-[#cf5f15] text-white text-sm font-semibold transition-colors"
                >
                  {editingItem ? 'ذخیره تغییرات' : 'ثبت محصول در منو'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
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
