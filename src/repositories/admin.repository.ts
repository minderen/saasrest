import { supabase } from "@/integrations/supabase/client";

export const adminRepository = {
  async myRoles() {
    const { data, error } = await supabase.from("user_roles").select("role, agent_id, tenant_id");
    if (error) throw error;
    return data ?? [];
  },

  async tenants() {
    const { data, error } = await supabase
      .from("tenants")
      .select("id, name, slug, status, is_published, default_locale, website_theme, menu_theme, agent_id, plan_id, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async agents() {
    const { data, error } = await supabase
      .from("agents")
      .select("id, name, slug, contact_email, tenant_quota, status, plan_id, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async plans() {
    const { data, error } = await supabase
      .from("plans")
      .select("id, kind, slug, name, tagline, price_monthly, currency, features, limits, is_active, is_featured, sort_order")
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async themes() {
    const { data, error } = await supabase
      .from("themes")
      .select("id, scope, slug, name, description, version, is_active, is_default")
      .order("scope");
    if (error) throw error;
    return data ?? [];
  },

  async plugins() {
    const { data, error } = await supabase
      .from("plugins")
      .select("id, scope, slug, name, description, version, is_active")
      .order("scope");
    if (error) throw error;
    return data ?? [];
  },

  async leads() {
    const { data, error } = await supabase
      .from("leads")
      .select("id, name, email, phone, company, message, plan_slug, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data ?? [];
  },

  async orders(tenantId?: string) {
    let query = supabase
      .from("orders")
      .select("id, tenant_id, code, table_no, customer_name, customer_phone, total, currency, status, created_at, order_items(item_name, quantity, unit_price)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (tenantId) query = query.eq("tenant_id", tenantId);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async setOrderStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  },

  async setTenantPublished(id: string, isPublished: boolean) {
    const { error } = await supabase.from("tenants").update({ is_published: isPublished }).eq("id", id);
    if (error) throw error;
  },

  async setTenantTheme(id: string, patch: { website_theme?: string; menu_theme?: string }) {
    const { error } = await supabase.from("tenants").update(patch).eq("id", id);
    if (error) throw error;
  },

  async togglePlugin(id: string, isActive: boolean) {
    const { error } = await supabase.from("plugins").update({ is_active: isActive }).eq("id", id);
    if (error) throw error;
  },

  async toggleTheme(id: string, isActive: boolean) {
    const { error } = await supabase.from("themes").update({ is_active: isActive }).eq("id", id);
    if (error) throw error;
  },

  async togglePlan(id: string, isActive: boolean) {
    const { error } = await supabase.from("plans").update({ is_active: isActive }).eq("id", id);
    if (error) throw error;
  },

  async counts() {
    const tables = ["tenants", "agents", "plans", "products", "menus", "orders", "leads"] as const;
    const results = await Promise.all(
      tables.map(async (table) => {
        const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
        if (error) throw error;
        return [table, count ?? 0] as const;
      }),
    );
    return Object.fromEntries(results) as Record<(typeof tables)[number], number>;
  },
};
