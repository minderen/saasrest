import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueries } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { authzRepository } from "@/repositories/authz.repository";
import type { AppRole, UserRoleAssignment } from "@/types/auth";
import {
  allowsScope,
  canAccessTenant,
  emptyAccess,
  hasAnyPermission,
  hasPermission,
  hasRole,
  isAgent as isAgentOf,
  isSuperAdmin as isSuperAdminOf,
  type AccessScope,
  type AccessSnapshot,
} from "./authorization";

export type { AppRole };

type AuthValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** True while the authorization graph (roles/permissions/tenants) is still loading. */
  accessLoading: boolean;
  access: AccessSnapshot;
  roles: UserRoleAssignment[];
  permissions: string[];
  tenantIds: string[];
  agentIds: string[];
  isSuperAdmin: boolean;
  isAgent: boolean;
  hasRole: (role: AppRole) => boolean;
  hasPermission: (key: string) => boolean;
  hasAnyPermission: (keys: string[]) => boolean;
  canAccessTenant: (tenantId: string | null | undefined) => boolean;
  allows: (scope: AccessScope) => boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  const enabled = Boolean(userId);

  const [rolesQuery, permissionsQuery, tenantIdsQuery] = useQueries({
    queries: [
      { queryKey: ["authz", "roles", userId], queryFn: authzRepository.myRoles, enabled },
      { queryKey: ["authz", "permissions", userId], queryFn: authzRepository.myPermissions, enabled },
      { queryKey: ["authz", "tenants", userId], queryFn: authzRepository.myTenantIds, enabled },
    ],
  });

  const value = useMemo<AuthValue>(() => {
    const roles = rolesQuery.data ?? [];
    const access: AccessSnapshot = enabled
      ? {
          roles,
          permissions: permissionsQuery.data ?? [],
          tenantIds: tenantIdsQuery.data ?? [],
          agentIds: roles.flatMap((entry) => (entry.agent_id ? [entry.agent_id] : [])),
        }
      : emptyAccess;

    return {
      user: session?.user ?? null,
      session,
      loading,
      accessLoading: enabled && (rolesQuery.isPending || permissionsQuery.isPending || tenantIdsQuery.isPending),
      access,
      roles: access.roles,
      permissions: access.permissions,
      tenantIds: access.tenantIds,
      agentIds: access.agentIds,
      isSuperAdmin: isSuperAdminOf(access),
      isAgent: isAgentOf(access),
      hasRole: (role) => hasRole(access, role),
      hasPermission: (key) => hasPermission(access, key),
      hasAnyPermission: (keys) => hasAnyPermission(access, keys),
      canAccessTenant: (tenantId) => canAccessTenant(access, tenantId),
      allows: (scope) => allowsScope(access, scope),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [
    session,
    loading,
    enabled,
    rolesQuery.data,
    rolesQuery.isPending,
    permissionsQuery.data,
    permissionsQuery.isPending,
    tenantIdsQuery.data,
    tenantIdsQuery.isPending,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
