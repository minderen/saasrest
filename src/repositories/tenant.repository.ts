import { supabase } from "@/integrations/supabase/client";

export type TenantRecord = {
  id: string;
  name: string;
  slug: string;
  default_locale: string;
  website_theme: string;
  menu_theme: string;
  is_published: boolean;
};

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
      .select("id, image_url, eyebrow, title, description, button_label, button_href, button_target, sort_order")
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
      .select("id, branch_id, title, slug, excerpt, description, image_url, badge, category, starts_at, ends_at, sort_order")
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async posts(tenantId: string) {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, slug, excerpt, content, image_url, badge, badge_position, view_count, published_at, category_id")
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

export type MenuItemKind = "product" | "menu";

export const menuRepository = {
  async categories(tenantId: string) {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("id, name, slug, description, image_url, color, sort_order")
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async products(tenantId: string) {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, category_id, name, slug, short_description, description, price, currency, image_url, badges, is_special, sort_order, product_features(id, label, value, icon, show_on_card, sort_order)",
      )
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async menus(tenantId: string) {
    const { data, error } = await supabase
      .from("menus")
      .select(
        "id, category_id, name, slug, short_description, description, price, currency, image_url, badges, is_special, sort_order, menu_products(quantity, sort_order, products(id, name, image_url, price))",
      )
      .eq("tenant_id", tenantId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async menusForProduct(tenantId: string, productId: string) {
    const { data, error } = await supabase
      .from("menu_products")
      .select("menus(id, name, slug, price, currency, image_url)")
      .eq("tenant_id", tenantId)
      .eq("product_id", productId);
    if (error) throw error;
    return (data ?? []).flatMap((row) => (row.menus ? [row.menus] : []));
  },

  async createOrder(input: {
    tenant_id: string;
    branch_id?: string | null;
    table_no?: string | null;
    customer_name: string;
    customer_phone: string;
    note?: string | null;
    total: number;
    items: Array<{
      item_name: string;
      unit_price: number;
      quantity: number;
      product_id?: string | null;
      menu_id?: string | null;
    }>;
  }) {
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        tenant_id: input.tenant_id,
        branch_id: input.branch_id ?? null,
        table_no: input.table_no ?? null,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        note: input.note ?? null,
        total: input.total,
      })
      .select("id, code")
      .single();
    if (error) throw error;

    const { error: itemsError } = await supabase.from("order_items").insert(
      input.items.map((item) => ({
        order_id: order.id,
        tenant_id: input.tenant_id,
        item_name: item.item_name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        product_id: item.product_id ?? null,
        menu_id: item.menu_id ?? null,
      })),
    );
    if (itemsError) throw itemsError;

    return order;
  },
};
