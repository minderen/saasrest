import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { LoadingScreen } from "@/components/shared/state-screens";
import { appConfig } from "@/config/app.config";
import { filterPanelNav, panelNav } from "@/config/navigation";
import { useAuth } from "@/modules/auth";

/** Authenticated shell for every /panel/* route. Presentation only. */
export function PanelLayout() {
  const navigate = useNavigate();
  const { user, loading, isSuperAdmin, isAgent, tenantIds, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) return <LoadingScreen message="Panel yükleniyor…" />;

  const visible = filterPanelNav(panelNav, {
    isSuperAdmin,
    isAgent,
    hasTenant: tenantIds.length > 0,
  });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border/70 bg-surface/40 p-4 lg:block">
        <Link to="/" className="flex items-center gap-2 px-2 py-3 font-semibold">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <QrCode className="size-4" aria-hidden />
          </span>
          {appConfig.name}
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
