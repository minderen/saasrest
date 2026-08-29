import {
  Building2,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Palette,
  Puzzle,
  ReceiptText,
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
    | "/panel/tenants"
    | "/panel/plans"
    | "/panel/subscriptions"
    | "/panel/themes"
    | "/panel/plugins"
    | "/panel/leads"
    | "/panel/menu"
    | "/panel/orders";
  label: string;
  icon: LucideIcon;
  scope: PanelScope;
};

export const panelNav: PanelNavItem[] = [
  { to: "/panel", label: "Genel bakış", icon: LayoutDashboard, scope: "all" },
  { to: "/panel/tenants", label: "Markalar", icon: Building2, scope: "staff" },
  { to: "/panel/plans", label: "Planlar", icon: CreditCard, scope: "super" },
  { to: "/panel/subscriptions", label: "Abonelikler", icon: ReceiptText, scope: "super" },
  { to: "/panel/themes", label: "Temalar", icon: Palette, scope: "super" },
  { to: "/panel/plugins", label: "Eklentiler", icon: Puzzle, scope: "super" },
  { to: "/panel/leads", label: "Talepler", icon: MessageSquare, scope: "super" },
  { to: "/panel/menu", label: "Menü yönetimi", icon: UtensilsCrossed, scope: "tenant" },
  { to: "/panel/orders", label: "Siparişler", icon: ReceiptText, scope: "tenant" },
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
