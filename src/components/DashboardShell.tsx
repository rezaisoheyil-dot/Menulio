import { useState } from 'react';
import {
  Coffee,
  LayoutDashboard,
  Package,
  Layers,
  PenTool,
  LayoutGrid,
  CreditCard,
  Settings,
  Headphones,
  ExternalLink,
  QrCode,
  ArrowRight,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import {
  BillingCycle,
  CafeSettings,
  CafeState,
  DashboardTab,
  MenuBuilderConfig,
  MenuCategory,
  MenuItem,
  PlanTierId,
  SupportTicket,
  TemplateId,
} from '../types/cafe';
import { OverviewTab } from './dashboard/OverviewTab';
import { ProductsTab } from './dashboard/ProductsTab';
import { CategoriesTab } from './dashboard/CategoriesTab';
import { MenuBuilderTab } from './dashboard/MenuBuilderTab';
import { TemplatesTab } from './dashboard/TemplatesTab';
import { SubscriptionTab } from './dashboard/SubscriptionTab';
import { SettingsTab, SupportTab } from './dashboard/SettingsAndSupportTabs';
import { AdminPlatformTab } from './dashboard/AdminPlatformTab';
import { QrCodeGraphic } from './QrCodeGraphic';

interface DashboardShellProps {
  state: CafeState;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onBackToLanding: () => void;
  onOpenLiveMenu: () => void;
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (cat: MenuCategory) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategories: (categories: MenuCategory[]) => void;
  onUpdateBuilder: (builder: MenuBuilderConfig) => void;
  onApplyTemplate: (templateId: TemplateId) => void;
  onChangePlan: (planId: PlanTierId, cycle: BillingCycle) => void;
  onUpdateSettings: (settings: CafeSettings) => void;
  onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  onReplyTicket: (ticketId: string, reply: string) => void;
}

const NAV_ITEMS: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'products', label: 'محصولات', icon: Package },
  { id: 'categories', label: 'دسته‌بندی‌ها', icon: Layers },
  { id: 'builder', label: 'طراحی منو', icon: PenTool },
  { id: 'templates', label: 'قالب‌ها', icon: LayoutGrid },
  { id: 'subscription', label: 'اشتراک و پرداخت', icon: CreditCard },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
  { id: 'support', label: 'پشتیبانی', icon: Headphones },
  { id: 'admin', label: 'مدیریت کل پلتفرم', icon: Shield },
];

export function DashboardShell({
  state,
  activeTab,
  onTabChange,
  onBackToLanding,
  onOpenLiveMenu,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onUpdateBuilder,
  onApplyTemplate,
  onChangePlan,
  onUpdateSettings,
  onAddTicket,
  onReplyTicket,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [openAddProductOnSwitch, setOpenAddProductOnSwitch] = useState(false);

  const activeNavLabel =
    NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? 'داشبورد';

  const handleNavClick = (tab: DashboardTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F3F6] text-stone-900 flex">
      {/* Desktop Dark Plum Sidebar (matching mockup) */}
      <aside className="hidden lg:flex lg:w-64 bg-[#181722] text-stone-200 flex-col justify-between shrink-0 border-l border-white/10">
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2.5 text-white font-bold text-lg whitespace-nowrap shrink-0"
            >
              <Coffee className="w-5 h-5 text-[#E66F1E]" />
              <span className="font-['Plus_Jakarta_Sans',sans-serif]">CafeMenu</span>
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#543B6E] text-white'
                      : 'text-stone-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#F59E0B]' : 'text-stone-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={onBackToLanding}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-white/15 text-xs font-medium text-stone-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به صفحه اصلی سایت</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-[#181722] text-stone-200 flex flex-col justify-between h-full">
            <div>
              <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
                <span className="inline-flex items-center gap-2 text-white font-bold">
                  <Coffee className="w-5 h-5 text-[#E66F1E]" />
                  <span className="font-['Plus_Jakarta_Sans',sans-serif]">CafeMenu</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-[#543B6E] text-white'
                          : 'text-stone-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t border-white/10">
              <button
                type="button"
                onClick={onBackToLanding}
                className="w-full py-2.5 rounded-xl border border-white/15 text-xs text-stone-300"
              >
                بازگشت به صفحه اصلی
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-stone-200 text-stone-700"
              aria-label="باز کردن منو"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 truncate">
              <span className="font-bold text-stone-900 truncate">
                {state.settings.cafeName}
              </span>
              <span aria-hidden="true">/</span>
              <span className="truncate">{activeNavLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors whitespace-nowrap shrink-0"
            >
              <QrCode className="w-4 h-4 text-[#543B6E]" />
              <span className="hidden sm:inline">QR کد منو</span>
            </button>
            <button
              type="button"
              onClick={onOpenLiveMenu}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E66F1E] hover:bg-[#cf5f15] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>مشاهده منوی آنلاین</span>
            </button>
          </div>
        </header>

        {/* Active Tab Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              state={state}
              onNavigateTab={onTabChange}
              onOpenLiveMenu={onOpenLiveMenu}
              onOpenQrModal={() => setQrModalOpen(true)}
              onOpenAddProduct={() => {
                setOpenAddProductOnSwitch(true);
                onTabChange('products');
              }}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              state={state}
              onAddItem={onAddItem}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              initialOpenAdd={openAddProductOnSwitch}
              onClearOpenAdd={() => setOpenAddProductOnSwitch(false)}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              state={state}
              onAddCategory={onAddCategory}
              onUpdateCategory={onUpdateCategory}
              onDeleteCategory={onDeleteCategory}
              onReorderCategories={onReorderCategories}
            />
          )}

          {activeTab === 'builder' && (
            <MenuBuilderTab
              state={state}
              onUpdateBuilder={onUpdateBuilder}
              onOpenLiveMenu={onOpenLiveMenu}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesTab
              state={state}
              onApplyTemplate={onApplyTemplate}
              onGoToBuilder={() => onTabChange('builder')}
            />
          )}

          {activeTab === 'subscription' && (
            <SubscriptionTab state={state} onChangePlan={onChangePlan} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              state={state}
              onUpdateSettings={onUpdateSettings}
              onUpdateBuilder={onUpdateBuilder}
            />
          )}

          {activeTab === 'support' && (
            <SupportTab state={state} onAddTicket={onAddTicket} />
          )}

          {activeTab === 'admin' && (
            <AdminPlatformTab
              state={state}
              onReplyTicket={onReplyTicket}
              onChangePlan={onChangePlan}
              onOpenLiveMenu={onOpenLiveMenu}
            />
          )}
        </main>
      </div>

      {/* Quick QR Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-stone-200 p-6 space-y-5 text-center">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900">
                QR کد اختصاصی {state.settings.cafeName}
              </h3>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="text-xs text-stone-500 hover:text-stone-900"
              >
                بستن
              </button>
            </div>

            <QrCodeGraphic
              value={`https://cafemenu.ir/${state.settings.slug}`}
              size={200}
              cafeName={state.settings.cafeName}
              showActions
            />

            <p className="text-xs text-stone-500 font-mono" dir="ltr">
              https://cafemenu.ir/{state.settings.slug}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
