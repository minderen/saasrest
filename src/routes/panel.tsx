import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Palette,
  Puzzle,
  QrCode,
  ReceiptText,
  UtensilsCrossed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useAuth } from "@/modules/auth";

export const Route = createFileRoute("/panel")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Yönetim paneli · QR Sofra" },
      { name: "description", content: "Marka, şube, menü, sipariş ve platform ayarlarını tek panelden yönetin." },
      { property: "og:title", content: "Yönetim paneli · QR Sofra" },
      { property: "og:description", content: "QR Sofra yönetim paneli: markalar, planlar, temalar, eklentiler ve siparişler." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PanelLayout,
});

const LINKS = [
  { to: "/panel", label: "Genel bakış", icon: LayoutDashboard, scope: "all" },
  { to: "/panel/tenants", label: "Markalar", icon: Building2, scope: "staff" },
  { to: "/panel/plans", label: "Planlar", icon: CreditCard, scope: "super" },
  { to: "/panel/themes", label: "Temalar", icon: Palette, scope: "super" },
  { to: "/panel/plugins", label: "Eklentiler", icon: Puzzle, scope: "super" },
  { to: "/panel/leads", label: "Talepler", icon: MessageSquare, scope: "super" },
  { to: "/panel/menu", label: "Menü yönetimi", icon: UtensilsCrossed, scope: "tenant" },
  { to: "/panel/orders", label: "Siparişler", icon: ReceiptText, scope: "tenant" },
] as const;

function PanelLayout() {
  const navigate = useNavigate();
  const { user, loading, isSuperAdmin, isAgent, tenantIds, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Panel yükleniyor…</p>
      </div>
    );
  }

  const visible = LINKS.filter((link) => {
    if (link.scope === "all") return true;
    if (link.scope === "super") return isSuperAdmin;
    if (link.scope === "staff") return isSuperAdmin || isAgent;
    return isSuperAdmin || tenantIds.length > 0;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border/70 bg-surface/40 p-4 lg:block">
        <Link to="/" className="flex items-center gap-2 px-2 py-3 font-semibold">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <QrCode className="size-4" aria-hidden />
          </span>
          QR Sofra
        </Link>
        <nav aria-label="Panel menüsü" className="mt-6 flex flex-col gap-1">
          {visible.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/panel" }}
              activeProps={{ className: "bg-primary/15 text-foreground" }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <link.icon className="size-4" aria-hidden />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border/70 px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto lg:hidden">
            {visible.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/panel" }}
                activeProps={{ className: "text-foreground" }}
                className="whitespace-nowrap text-sm text-muted-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                void navigate({ to: "/auth" });
              }}
            >
              <LogOut className="size-4" aria-hidden />
              Çıkış
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
