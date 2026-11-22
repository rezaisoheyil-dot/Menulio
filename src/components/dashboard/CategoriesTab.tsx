import { useState } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  Check,
  Pencil,
} from 'lucide-react';
import { CafeState, MenuCategory } from '../../types/cafe';
import { SUBSCRIPTION_PLANS, toPersianDigits } from '../../data/initialData';

interface CategoriesTabProps {
  state: CafeState;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (cat: MenuCategory) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategories: (categories: MenuCategory[]) => void;
}

export function CategoriesTab({
  state,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
}: CategoriesTabProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const sortedCategories = [...state.categories].sort((a, b) => a.order - b.order);
  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === state.currentPlanId);
  const reachedLimit =
    currentPlan?.maxCategories !== null &&
    currentPlan?.maxCategories !== undefined &&
    state.categories.length >= currentPlan.maxCategories;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || reachedLimit) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sortedCategories.length) return;
    const copy = [...sortedCategories];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    const updated = copy.map((c, idx) => ({ ...c, order: idx + 1 }));
    onReorderCategories(updated);
  };

  const startEdit = (cat: MenuCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const saveEdit = (cat: MenuCategory) => {
    if (!editingName.trim()) return;
    onUpdateCategory({ ...cat, name: editingName.trim() });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-stone-900">مدیریت دسته‌بندی‌های منو</h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          ترتیب نمایش دسته‌ها در منوی آنلاین را تنظیم کنید یا دسته‌بندی جدید بسازید.
        </p>
      </div>

      {/* Add Category Bar */}
      <form
        onSubmit={handleCreate}
        className="rounded-xl bg-white border border-stone-200 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="نام دسته‌بندی جدید (مثلاً شیک و بستنی)"
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-[#543B6E]"
        />
        <button
          type="submit"
          disabled={!newCategoryName.trim() || reachedLimit}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#543B6E] hover:bg-[#432e59] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن دسته‌بندی</span>
        </button>
      </form>

      {/* Categories List */}
      <div className="rounded-xl bg-white border border-stone-200 divide-y divide-stone-100">
        {sortedCategories.map((cat, idx) => {
          const itemCount = state.items.filter((i) => i.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center tabular-nums shrink-0">
                  {toPersianDigits(idx + 1)}
                </span>

                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(cat)}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{cat.name}</p>
                    <p className="text-xs text-stone-500 tabular-nums mt-0.5">
                      {toPersianDigits(itemCount)} محصول
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      {cat.visible ? 'قابل مشاهده در منو' : 'مخفی'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveCategory(idx, -1)}
                  disabled={idx === 0}
                  className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                  title="انتقال به بالا"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveCategory(idx, 1)}
                  disabled={idx === sortedCategories.length - 1}
                  className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                  title="انتقال به پایین"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCategory({ ...cat, visible: !cat.visible })
                  }
                  className="p-2 rounded-lg text-stone-500 hover:bg-stone-100"
                  title={cat.visible ? 'مخفی کردن' : 'نمایش دادن'}
                >
                  {cat.visible ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-stone-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(cat)}
                  className="p-2 rounded-lg text-stone-500 hover:bg-stone-100"
                  title="تغییر نام"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(cat.id)}
                  disabled={sortedCategories.length <= 1}
                  className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                  title="حذف دسته‌بندی"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
