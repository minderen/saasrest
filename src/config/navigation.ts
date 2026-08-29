import {
  Bell,
  Building2,
  CalendarClock,
  CreditCard,
  FileText,
  Gauge,
  Globe2,
  Images,
  Languages,
  LayoutDashboard,
  ListTree,
  MapPin,
  MessageSquare,
  Megaphone,
  Newspaper,
  Palette,
  Puzzle,
  ReceiptText,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  UserCog,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/** Public landing in-page navigation (rendered by the landing theme). */
export const landingNav = [
  { href: "#what", key: "nav.about", label: "Platform" },
  { href: "#features", key: "nav.features", label: "Özellikler" },
  { href: "#how", key: "nav.how", label: "Nasıl çalışır" },
  { href: "#plans", key: "nav.plans", label: "Planlar" },
  { href: "#faq", key: "nav.faq", label: "SSS" },
  { href: "#contact", key: "nav.contact", label: "İletişim" },
] as const;

/** Who may see a panel entry. Actual authorization stays in the database (RLS). */
export type PanelScope = "all" | "super" | "staff" | "tenant";

export type PanelNavItem = {
  to:
    | "/panel"
    | "/panel/users"
    | "/panel/roles"
    | "/panel/permissions"
    | "/panel/agents"
    | "/panel/tenants"
    | "/panel/plans"
    | "/panel/subscriptions"
    | "/panel/usage"
    | "/panel/landing"
    | "/panel/announcements"
    | "/panel/features"
    | "/panel/faqs"
    | "/panel/themes"
    | "/panel/plugins"
    | "/panel/languages"
    | "/panel/translations"
    | "/panel/website"
    | "/panel/menu"
    | "/panel/menus"
    | "/panel/categories"
    | "/panel/branches"
    | "/panel/campaigns"
    | "/panel/posts"
    | "/panel/media"
    | "/panel/orders"
    | "/panel/seo"
    | "/panel/settings"
    | "/panel/notifications"
    | "/panel/audit"
    | "/panel/logs"
    | "/panel/leads";
  label: string;
  icon: LucideIcon;
  scope: PanelScope;
  group: PanelGroup;
};

export type PanelGroup = "overview" | "access" | "saas" | "landing" | "system" | "tenant" | "logs";

export const panelGroups: { key: PanelGroup; label: string }[] = [
  { key: "overview", label: "Genel" },
  { key: "access", label: "Kullanıcı ve yetki" },
  { key: "saas", label: "SaaS yönetimi" },
  { key: "landing", label: "Satış sitesi" },
  { key: "tenant", label: "Marka yönetimi" },
  { key: "system", label: "Sistem" },
  { key: "logs", label: "Kayıtlar" },
];

export const panelNav: PanelNavItem[] = [
  { to: "/panel", label: "Genel bakış", icon: LayoutDashboard, scope: "all", group: "overview" },

  { to: "/panel/users", label: "Kullanıcılar", icon: Users, scope: "super", group: "access" },
  { to: "/panel/roles", label: "Roller", icon: UserCog, scope: "super", group: "access" },
  {
    to: "/panel/permissions",
    label: "Yetkiler",
    icon: ShieldCheck,
    scope: "super",
    group: "access",
  },

  { to: "/panel/agents", label: "Acenteler", icon: Building2, scope: "staff", group: "saas" },
  { to: "/panel/tenants", label: "Markalar", icon: Building2, scope: "staff", group: "saas" },
  { to: "/panel/plans", label: "Planlar", icon: CreditCard, scope: "super", group: "saas" },
  {
    to: "/panel/subscriptions",
    label: "Abonelikler",
    icon: ReceiptText,
    scope: "super",
    group: "saas",
  },
  { to: "/panel/usage", label: "Kota / kullanım", icon: Gauge, scope: "tenant", group: "saas" },
  { to: "/panel/leads", label: "Talepler", icon: MessageSquare, scope: "super", group: "saas" },

  {
    to: "/panel/landing",
    label: "Satış sayfası",
    icon: Sparkles,
    scope: "super",
    group: "landing",
  },
  {
    to: "/panel/announcements",
    label: "Topbar duyuruları",
    icon: Megaphone,
    scope: "super",
    group: "landing",
  },
  { to: "/panel/features", label: "Özellikler", icon: ListTree, scope: "super", group: "landing" },
  { to: "/panel/faqs", label: "SSS", icon: FileText, scope: "super", group: "landing" },

  {
    to: "/panel/website",
    label: "Website yönetimi",
    icon: Globe2,
    scope: "tenant",
    group: "tenant",
  },
  { to: "/panel/menu", label: "Ürünler", icon: UtensilsCrossed, scope: "tenant", group: "tenant" },
  { to: "/panel/menus", label: "Menüler", icon: UtensilsCrossed, scope: "tenant", group: "tenant" },
  { to: "/panel/categories", label: "Kategoriler", icon: Tags, scope: "tenant", group: "tenant" },
  { to: "/panel/branches", label: "Şubeler", icon: MapPin, scope: "tenant", group: "tenant" },
  {
    to: "/panel/campaigns",
    label: "Kampanyalar",
    icon: CalendarClock,
    scope: "tenant",
    group: "tenant",
  },
  { to: "/panel/posts", label: "Haberler", icon: Newspaper, scope: "tenant", group: "tenant" },
  { to: "/panel/media", label: "Medya", icon: Images, scope: "tenant", group: "tenant" },
  { to: "/panel/orders", label: "Siparişler", icon: ReceiptText, scope: "tenant", group: "tenant" },
  { to: "/panel/seo", label: "SEO", icon: Search, scope: "tenant", group: "tenant" },

  { to: "/panel/themes", label: "Temalar", icon: Palette, scope: "super", group: "system" },
  { to: "/panel/plugins", label: "Eklentiler", icon: Puzzle, scope: "super", group: "system" },
  { to: "/panel/languages", label: "Diller", icon: Languages, scope: "super", group: "system" },
  {
    to: "/panel/translations",
    label: "Çeviriler",
    icon: Languages,
    scope: "super",
    group: "system",
  },
  {
    to: "/panel/settings",
    label: "Sistem ayarları",
    icon: Settings,
    scope: "super",
    group: "system",
  },
  { to: "/panel/notifications", label: "Bildirimler", icon: Bell, scope: "super", group: "system" },

  { to: "/panel/audit", label: "Audit log", icon: ScrollText, scope: "super", group: "logs" },
  { to: "/panel/logs", label: "Sistem logları", icon: ScrollText, scope: "super", group: "logs" },
];

export function filterPanelNav(
  items: PanelNavItem[],
  access: { isSuperAdmin: boolean; isAgent: boolean; hasTenant: boolean },
) {
  return items.filter((item) => {
    if (item.scope === "all") return true;
    if (item.scope === "super") return access.isSuperAdmin;
    if (item.scope === "staff") return access.isSuperAdmin || access.isAgent;
    return access.isSuperAdmin || access.hasTenant;
  });
}

/** Groups visible entries for sidebar rendering. */
export function groupPanelNav(items: PanelNavItem[]) {
  return panelGroups
    .map((group) => ({ ...group, items: items.filter((item) => item.group === group.key) }))
    .filter((group) => group.items.length > 0);
}
