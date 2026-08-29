import { supabase } from "@/integrations/supabase/client";
import type { UserRoleAssignment } from "@/types/auth";

/**
 * Read-only access to the authorization graph:
 * Supabase Auth -> profile -> roles -> agent/tenant relation -> permissions.
 * Every call is still filtered by RLS; the frontend only mirrors what the DB allows.
 */
export const authzRepository = {
  async myRoles(): Promise<UserRoleAssignment[]> {
    const { data, error } = await supabase.from("user_roles").select("role, agent_id, tenant_id");
    if (error) throw error;
    return (data ?? []) as UserRoleAssignment[];
  },

  async myTenantMemberships() {
    const { data, error } = await supabase
      .from("tenant_users")
      .select("tenant_id, role, is_active")
      .eq("is_active", true);
    if (error) throw error;
    return data ?? [];
  },

  async myTenantIds(): Promise<string[]> {
    const { data, error } = await supabase.rpc("my_tenant_ids");
    if (error) throw error;
    return (data ?? []) as string[];
  },

  async myPermissions(): Promise<string[]> {
    const { data, error } = await supabase.rpc("my_permissions");
    if (error) throw error;
    return (data ?? []) as string[];
  },

  async canManageTenant(tenantId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc("can_manage_tenant", { _tenant_id: tenantId });
    if (error) throw error;
    return Boolean(data);
  },
};
