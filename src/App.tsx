import { useEffect, useState } from 'react';
import {
  AppView,
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
} from './types/cafe';
import {
  INITIAL_CAFE_STATE,
  SUBSCRIPTION_PLANS,
  TEMPLATE_PRESETS,
} from './data/initialData';
import { LandingPage } from './components/LandingPage';
import { DashboardShell } from './components/DashboardShell';
import { LiveMenuPage } from './components/LiveMenuPage';

const STORAGE_KEY = 'cafemenu_saas_platform_v1';

function loadInitialState(): CafeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CAFE_STATE;
    const parsed = JSON.parse(raw) as CafeState;
    if (!parsed || !parsed.settings || !Array.isArray(parsed.items)) {
      return INITIAL_CAFE_STATE;
    }
    return parsed;
  } catch {
    return INITIAL_CAFE_STATE;
  }
}

export default function App() {
  const [state, setState] = useState<CafeState>(loadInitialState);
  const [view, setView] = useState<AppView>('landing');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');

  // Hydrate from WordPress REST API if running inside the WordPress Theme
  useEffect(() => {
    const wp = (
      window as unknown as {
        CAFEMENU_WP?: {
          restUrl?: string;
          nonce?: string;
          isLoggedIn?: boolean;
          initialMenuSlug?: string;
        };
      }
    ).CAFEMENU_WP;

    // If visitor opened /menu/{slug} on WordPress, show that cafe's public menu directly
    if (wp?.restUrl && wp.initialMenuSlug) {
      fetch(`${wp.restUrl}public-menu/${encodeURIComponent(wp.initialMenuSlug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((publicState) => {
          if (publicState && typeof publicState === 'object') {
            setState((prev) => ({ ...prev, ...publicState }));
          }
          setView('live-menu');
        })
        .catch(() => {
          setView('live-menu');
        });
      return;
    }

    if (!wp?.restUrl || !wp.isLoggedIn) return;

    fetch(`${wp.restUrl}cafe`, {
      headers: wp.nonce ? { 'X-WP-Nonce': wp.nonce } : undefined,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setState((prev) => ({
          ...prev,
          ...(data.cafe_state && typeof data.cafe_state === 'object'
            ? data.cafe_state
            : {}),
          currentPlanId: data.subscription?.plan_id || prev.currentPlanId,
          billingCycle: data.subscription?.cycle || prev.billingCycle,
          subscriptionExpiresAt:
            data.subscription?.expires_at || prev.subscriptionExpiresAt,
        }));
      })
      .catch(() => {
        // Fallback silently to localStorage state
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues
    }

    const wp = (
      window as unknown as {
        CAFEMENU_WP?: { restUrl?: string; nonce?: string; isLoggedIn?: boolean };
      }
    ).CAFEMENU_WP;
    if (wp?.restUrl && wp.isLoggedIn) {
      fetch(`${wp.restUrl}cafe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(wp.nonce ? { 'X-WP-Nonce': wp.nonce } : {}),
        },
        body: JSON.stringify(state),
      }).catch(() => {
        // Ignore network errors while typing
      });
    }
  }, [state]);

  const handleEnterDashboard = (initialTab: DashboardTab = 'overview') => {
    setDashboardTab(initialTab);
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLiveMenu = () => {
    setView('live-menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyTemplate = (templateId: TemplateId) => {
    const preset = TEMPLATE_PRESETS.find((t) => t.id === templateId);
    setState((prev) => ({
      ...prev,
      builder: {
        ...prev.builder,
        templateId,
        accentColor: preset?.accentColor ?? prev.builder.accentColor,
      },
    }));
  };

  const handleSelectTemplateFromLanding = (templateId: TemplateId) => {
    handleApplyTemplate(templateId);
    handleEnterDashboard('builder');
  };

  const handleChangePlan = (
    planId: PlanTierId,
    cycle: BillingCycle,
    cafeNameOverride?: string
  ) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    const amount =
      cycle === 'monthly' ? (plan?.monthlyPrice ?? 0) : (plan?.yearlyPrice ?? 0);
    const newInvoice = {
      id: `INV-1405-${Math.floor(100 + Math.random() * 899)}`,
      date: '۱۴۰۵/۰۹/۰۲',
      planName: `${plan?.name ?? ''} (${cycle === 'monthly' ? 'ماهانه' : 'سالانه'})`,
      cycle,
      amount,
      status: 'paid' as const,
    };

    setState((prev) => ({
      ...prev,
      currentPlanId: planId,
      billingCycle: cycle,
      subscriptionExpiresAt: cycle === 'yearly' ? '۱۴۰۶/۰۹/۰۲' : '۱۴۰۵/۱۰/۰۲',
      settings: cafeNameOverride
        ? {
            ...prev.settings,
            cafeName: cafeNameOverride,
          }
        : prev.settings,
      builder: cafeNameOverride
        ? {
            ...prev.builder,
            headerTitle: cafeNameOverride,
          }
        : prev.builder,
      invoices: [newInvoice, ...prev.invoices],
    }));
  };

  const handleAddItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      items: [newItem, ...prev.items],
    }));
  };

  const handleUpdateItem = (updated: MenuItem) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === updated.id ? updated : it)),
    }));
  };

  const handleDeleteItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  const handleAddCategory = (name: string) => {
    const maxOrder = state.categories.reduce(
      (max, c) => Math.max(max, c.order),
      0
    );
    const newCat: MenuCategory = {
      id: `cat-${Date.now()}`,
      name,
      order: maxOrder + 1,
      visible: true,
    };
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
  };

  const handleUpdateCategory = (updated: MenuCategory) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === updated.id ? updated : c)),
    }));
  };

  const handleDeleteCategory = (id: string) => {
    setState((prev) => {
      const remaining = prev.categories.filter((c) => c.id !== id);
      const fallbackCatId = remaining[0]?.id ?? '';
      return {
        ...prev,
        categories: remaining,
        items: prev.items.map((it) =>
          it.categoryId === id ? { ...it, categoryId: fallbackCatId } : it
        ),
      };
    });
  };

  const handleReorderCategories = (categories: MenuCategory[]) => {
    setState((prev) => ({ ...prev, categories }));
  };

  const handleUpdateBuilder = (builder: MenuBuilderConfig) => {
    setState((prev) => ({ ...prev, builder }));
  };

  const handleUpdateSettings = (settings: CafeSettings) => {
    setState((prev) => ({ ...prev, settings }));
  };

  const handleAddTicket = (
    ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>
  ) => {
    const created: SupportTicket = {
      ...ticket,
      id: `TCK-${Math.floor(500 + Math.random() * 499)}`,
      createdAt: '۱۴۰۵/۰۹/۰۲',
      status: 'open',
    };
    setState((prev) => ({
      ...prev,
      tickets: [created, ...prev.tickets],
    }));

    const wp = (
      window as unknown as {
        CAFEMENU_WP?: { restUrl?: string; nonce?: string; isLoggedIn?: boolean };
      }
    ).CAFEMENU_WP;
    if (wp?.restUrl && wp.isLoggedIn) {
      fetch(`${wp.restUrl}tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(wp.nonce ? { 'X-WP-Nonce': wp.nonce } : {}),
        },
        body: JSON.stringify(created),
      }).catch(() => {});
    }
  };

  const handleReplyTicket = (ticketId: string, reply: string) => {
    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId ? { ...t, reply, status: 'answered' } : t
      ),
    }));
  };

  if (view === 'live-menu') {
    return (
      <LiveMenuPage
        state={state}
        onBackToDashboard={() => handleEnterDashboard('overview')}
        onBackToLanding={() => setView('landing')}
      />
    );
  }

  if (view === 'dashboard') {
    return (
      <DashboardShell
        state={state}
        activeTab={dashboardTab}
        onTabChange={setDashboardTab}
        onBackToLanding={() => setView('landing')}
        onOpenLiveMenu={handleOpenLiveMenu}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onReorderCategories={handleReorderCategories}
        onUpdateBuilder={handleUpdateBuilder}
        onApplyTemplate={handleApplyTemplate}
        onChangePlan={(planId, cycle) => handleChangePlan(planId, cycle)}
        onUpdateSettings={handleUpdateSettings}
        onAddTicket={handleAddTicket}
        onReplyTicket={handleReplyTicket}
      />
    );
  }

  return (
    <LandingPage
      state={state}
      onEnterDashboard={(tab) => handleEnterDashboard(tab)}
      onOpenLiveMenu={handleOpenLiveMenu}
      onSelectTemplateAndEdit={handleSelectTemplateFromLanding}
      onActivatePlan={(planId, cycle, cafeName) => {
        handleChangePlan(planId, cycle, cafeName);
        handleEnterDashboard('overview');
      }}
    />
  );
}
