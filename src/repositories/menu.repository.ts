import { supabase } from "@/integrations/supabase/client";

import type { MenuItemKind } from "@/types";

void (0 as unknown as MenuItemKind);

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
