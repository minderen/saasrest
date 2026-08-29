import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

import { LoadingScreen } from "@/components/shared/state-screens";
import { ForbiddenScreen } from "@/components/shared/forbidden-screen";
import { useAuth } from "./auth-provider";
import type { AccessScope } from "./authorization";

/**
 * Route-level authorization gate. Purely a UX affordance:
 * every read/write is independently enforced by RLS in the database.
 */
export function RequireAccess({
  scope = "authenticated",
  permission,
  tenantId,
  children,
}: {
  scope?: AccessScope;
  permission?: string;
  tenantId?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { user, loading, accessLoading, allows, hasPermission, canAccessTenant } = useAuth();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", search: { redirect: window.location.pathname } });
  }, [loading, user, navigate]);

  if (loading || !user) return <LoadingScreen message="Oturum doğrulanıyor…" />;
  if (accessLoading) return <LoadingScreen message="Yetkiler kontrol ediliyor…" />;

  if (!allows(scope)) return <ForbiddenScreen />;
  if (permission && !hasPermission(permission)) return <ForbiddenScreen />;
  if (tenantId && !canAccessTenant(tenantId)) {
    return (
      <ForbiddenScreen description="Bu markanın verilerine erişim yetkiniz bulunmuyor. Markalar birbirinin verilerini göremez." />
    );
  }

  return <>{children}</>;
}
