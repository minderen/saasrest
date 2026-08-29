import { supabase } from "@/integrations/supabase/client";

/**
 * Agent-scoped reads/writes. Every statement runs under RLS, so an agent can
 * only ever reach the tenants attached to its own agency.
 */
export const agentRepository = {
  async myAgents() {
    const { data, error } = await supabase
      .from("agents")
      .select("id, name, slug, tenant_quota, plan_id, status, contact_email")
      .is("deleted_at", null)
      .order("name");
    if (error) throw error;
    return data ?? [];
  },

  async tenants(agentId: string) {
    const { data, error } = await supabase
      .from("tenants")
      .select(
        "id, agent_id, name, slug, status, is_published, default_locale, website_theme, menu_theme, plan_id, created_at",
      )
      .eq("agent_id", agentId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async tenantById(id: string) {
    const { data, error } = await supabase
      .from("tenants")
      .select(
        "id, agent_id, name, slug, status, is_published, default_locale, website_theme, menu_theme, plan_id, created_at",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createTenant(input: {
    agent_id: string;
    name: string;
    slug: string;
    default_locale: string;
    website_theme: string;
    menu_theme: string;
  }) {
    const { data, error } = await supabase.from("tenants").insert(input).select("id").single();
    if (error) throw error;
    return data.id;
  },

  async updateTenant(
    id: string,
    patch: { name: string; default_locale: string; website_theme: string; menu_theme: string },
  ) {
    const { error } = await supabase.from("tenants").update(patch).eq("id", id);
    if (error) throw error;
  },

  async archiveTenant(id: string) {
    const { error } = await supabase
      .from("tenants")
      .update({ deleted_at: new Date().toISOString(), is_published: false })
      .eq("id", id);
    if (error) throw error;
  },

  async themes(scope: "restaurant" | "menu") {
    const { data, error } = await supabase
      .from("themes")
      .select("slug, name, is_default")
      .eq("scope", scope)
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return data ?? [];
  },

  async tenantMembers(tenantId: string) {
    const { data, error } = await supabase
      .from("tenant_users")
      .select("id, user_id, role, title, is_active, created_at, profiles:user_id(email, full_name)")
      .eq("tenant_id", tenantId)
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  },

  /** Aggregate content counts for the tenants of one agent (single query per table). */
  async tenantContentCounts(tenantIds: string[]) {
    if (tenantIds.length === 0) return { products: 0, menus: 0, branches: 0, campaigns: 0, posts: 0, orders: 0 };
    const tables = ["products", "menus", "branches", "campaigns", "posts", "orders"] as const;
    const entries = await Promise.all(
      tables.map(async (table) => {
        const { count, error } = await supabase
          .from(table)
          .select("id", { count: "exact", head: true })
          .in("tenant_id", tenantIds);
        if (error) throw error;
        return [table, count ?? 0] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<(typeof tables)[number], number>;
  },
};
