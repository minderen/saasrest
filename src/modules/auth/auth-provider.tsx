import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { adminRepository } from "@/repositories/admin";

export type AppRole = "super_admin" | "agent" | "tenant_owner" | "tenant_staff";

type AuthValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: Array<{ role: AppRole; agent_id: string | null; tenant_id: string | null }>;
  isSuperAdmin: boolean;
  isAgent: boolean;
  tenantIds: string[];
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

  const { data: roles = [] } = useQuery({
    queryKey: ["my-roles", session?.user.id],
    queryFn: adminRepository.myRoles,
    enabled: Boolean(session?.user.id),
  });

  const value = useMemo<AuthValue>(() => {
    const typedRoles = roles as AuthValue["roles"];
    return {
      user: session?.user ?? null,
      session,
      loading,
      roles: typedRoles,
      isSuperAdmin: typedRoles.some((entry) => entry.role === "super_admin"),
      isAgent: typedRoles.some((entry) => entry.role === "agent"),
      tenantIds: typedRoles.flatMap((entry) => (entry.tenant_id ? [entry.tenant_id] : [])),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [session, loading, roles]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
