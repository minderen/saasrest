import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut, QrCode } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { appConfig } from "@/config/app.config";
import { filterPanelNav, groupPanelNav, panelNav } from "@/config/navigation";
import { RequireAccess, useAuth } from "@/modules/auth";
import { TenantScopeProvider } from "@/modules/admin/tenant-scope";

/** Authenticated shell for every /panel/* route. Presentation only. */
export function PanelLayout() {
  return (
    <RequireAccess scope="authenticated">
      <TenantScopeProvider>
        <PanelShell />
      </TenantScopeProvider>
    </RequireAccess>
  );
}

function PanelShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isSuperAdmin, isAgent, tenantIds, signOut } = useAuth();

  const visible = filterPanelNav(panelNav, {
    isSuperAdmin,
    isAgent,
    hasTenant: tenantIds.length > 0,
  });
  const groups = groupPanelNav(visible);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border/70 bg-surface/40 p-4 lg:block">
        <Link to="/" className="flex items-center gap-2 px-2 py-3 font-semibold">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <QrCode className="size-4" aria-hidden />
          </span>
          {appConfig.name}
        </Link>
        <nav aria-label="Panel menüsü" className="mt-6 flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-1">
              <p className="px-3 text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground/70">
                {group.label}
              </p>
              {group.items.map((link) => (
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
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border/70 px-4 sm:px-6">
          <div className="flex items-center gap-3 overflow-x-auto lg:hidden">
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
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await queryClient.cancelQueries();
                queryClient.clear();
                await signOut();
                void navigate({ to: "/auth", replace: true });
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
