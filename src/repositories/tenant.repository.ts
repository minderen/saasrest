import { supabase } from "@/integrations/supabase/client";

import type { TenantRecord } from "@/types";

export const tenantRepository = {
  async bySlug(slug: string) {
    const { data, error } = await supabase
      .from("tenants")
      .select("id, name, slug, default_locale, website_theme, menu_theme, is_published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data as TenantRecord | null;
  },

  async settings(tenantId: string) {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async sections(tenantId: string) {
    const { data, error } = await supabase
      .from("site_sections")
      .select("id, key, eyebrow, title, subtitle, body, config, sort_order")
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async navigation(tenantId: string) {
    const { data, error } = await supabase
      .from("site_navigation")
      .select("id, label, href, target, sort_order")
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async slides(tenantId: string) {
    const { data, error } = await supabase
      .from("slides")
      .select(
        "id, image_url, eyebrow, title, description, button_label, button_href, button_target, sort_order",
      )
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async awards(tenantId: string) {
    const { data, error } = await supabase
      .from("awards")
      .select("id, title, description, icon, image_url, detail_html, sort_order")
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async branches(tenantId: string) {
    const { data, error } = await supabase
      .from("branches")
      .select(
        "id, name, slug, cover_image_url, gallery, address, city, phone, whatsapp, directions_url, map_embed_url, opening_hours, socials, sort_order",
      )
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async campaigns(tenantId: string) {
    const { data, error } = await supabase
      .from("campaigns")
      .select(
        "id, branch_id, title, slug, excerpt, description, image_url, badge, category, starts_at, ends_at, sort_order",
      )
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async posts(tenantId: string) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, content, image_url, badge, badge_position, view_count, published_at, category_id",
      )
      .eq("tenant_id", tenantId)
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async registerPostView(postId: string) {
    const { error } = await supabase.rpc("increment_post_views", { _post_id: postId });
    if (error) throw error;
  },
};
