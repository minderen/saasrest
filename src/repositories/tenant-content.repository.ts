import { supabase } from "@/integrations/supabase/client";

export const tenantContentRepository = {
  async settings(tenantId: string) {
    const { data, error } = await supabase.from("site_settings").select("*").eq("tenant_id", tenantId).maybeSingle();
    if (error) throw error;
    return data;
  },

  async saveSettings(tenantId: string, patch: Record<string, unknown>) {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ tenant_id: tenantId, ...patch } as never, { onConflict: "tenant_id" });
    if (error) throw error;
  },

  async categories(tenantId: string) {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("id, name, slug, sort_order, is_active")
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async products(tenantId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, category_id, price, currency, status, is_special, image_url, short_description, sort_order")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async saveProduct(tenantId: string, input: Record<string, unknown> & { id?: string }) {
    const payload = { ...input, tenant_id: tenantId } as never;
    const { error } = input.id
      ? await supabase.from("products").update(payload).eq("id", input.id)
      : await supabase.from("products").insert(payload);
    if (error) throw error;
  },

  async softDeleteProduct(id: string) {
    const { error } = await supabase.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },

  async campaigns(tenantId: string) {
    const { data, error } = await supabase
      .from("campaigns")
      .select("id, title, slug, excerpt, image_url, badge, category, starts_at, ends_at, status, sort_order")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async saveCampaign(tenantId: string, input: Record<string, unknown> & { id?: string }) {
    const payload = { ...input, tenant_id: tenantId } as never;
    const { error } = input.id
      ? await supabase.from("campaigns").update(payload).eq("id", input.id)
      : await supabase.from("campaigns").insert(payload);
    if (error) throw error;
  },

  async posts(tenantId: string) {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, slug, excerpt, content, image_url, badge, status, published_at, view_count")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async savePost(tenantId: string, input: Record<string, unknown> & { id?: string }) {
    const payload = { ...input, tenant_id: tenantId } as never;
    const { error } = input.id
      ? await supabase.from("posts").update(payload).eq("id", input.id)
      : await supabase.from("posts").insert(payload);
    if (error) throw error;
  },

  async setContentStatus(table: "products" | "campaigns" | "posts", id: string, status: string) {
    const patch: Record<string, unknown> = { status };
    if (table === "posts" && status === "published") patch["published_at"] = new Date().toISOString();
    const { error } = await supabase.from(table).update(patch as never).eq("id", id);
    if (error) throw error;
  },
};
