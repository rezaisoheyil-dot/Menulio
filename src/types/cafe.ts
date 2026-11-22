export type AppView = 'landing' | 'dashboard' | 'live-menu';

export type DashboardTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'builder'
  | 'templates'
  | 'subscription'
  | 'settings'
  | 'support'
  | 'admin';

export type BillingCycle = 'monthly' | 'yearly';

export type PlanTierId = 'free' | 'pro' | 'enterprise';

export type TemplateId = 'roka-dark' | 'arti-minimal' | 'naderi-classic' | 'luna-botanical';

export type MenuLayerId = 'header' | 'banner' | 'categories' | 'products' | 'footer';

export interface MenuLayer {
  id: MenuLayerId;
  label: string;
  visible: boolean;
}

export interface MenuBuilderConfig {
  templateId: TemplateId;
  accentColor: string;
  layoutMode: 'list' | 'grid';
  cardRadius: 'sm' | 'md' | 'lg';
  showImages: boolean;
  showDescriptions: boolean;
  showPrices: boolean;
  headerTitle: string;
  headerSubtitle: string;
  bannerText: string;
  footerNote: string;
  layers: MenuLayer[];
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  visible: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  featured: boolean;
}

export interface SubscriptionPlan {
  id: PlanTierId;
  name: string;
  audience: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxProducts: number | null;
  maxCategories: number | null;
  maxBranches: number;
  customDomain: boolean;
  wpSync: boolean;
  analyticsDays: number;
  highlights: string[];
}

export interface InvoiceRecord {
  id: string;
  date: string;
  planName: string;
  cycle: BillingCycle;
  amount: number;
  status: 'paid' | 'pending';
}

export interface CafeSettings {
  cafeName: string;
  slug: string;
  tagline: string;
  phone: string;
  address: string;
  workingHours: string;
  wifiName: string;
  wifiPassword: string;
  instagram: string;
  wpSiteUrl: string;
  wpWebhookSecret: string;
}

export interface TemplatePreset {
  id: TemplateId;
  name: string;
  styleLabel: string;
  description: string;
  accentColor: string;
  surfaceBg: string;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  isDark: boolean;
  previewImage: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'answered';
  createdAt: string;
  message: string;
  reply?: string;
}

export interface CafeState {
  isAuthenticated: boolean;
  currentPlanId: PlanTierId;
  billingCycle: BillingCycle;
  subscriptionExpiresAt: string;
  settings: CafeSettings;
  categories: MenuCategory[];
  items: MenuItem[];
  builder: MenuBuilderConfig;
  invoices: InvoiceRecord[];
  tickets: SupportTicket[];
  dailyViews: { day: string; views: number }[];
}
