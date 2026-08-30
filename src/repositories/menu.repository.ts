import { supabase } from "@/integrations/supabase/client";
import type { MenuCategoryView, MenuPackageView, PlacedOrder, ProductView } from "@/types/menu";

export const menuRepository = {
  async categories(tenantId: string): Promise<MenuCategoryView[]> {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("id, name, slug, description, image_url, color, sort_order")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as MenuCategoryView[];
  },

  async products(tenantId: string): Promise<ProductView[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, category_id, name, slug, short_description, description, price, currency, image_url, badges, is_special, sort_order, product_features(id, label, value, icon, show_on_card, sort_order), product_options(id, group_label, name, price_delta, is_default, is_active, sort_order)",
      )
      .eq("tenant_id", tenantId)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((row) => ({
      ...row,
      product_features: [...row.product_features].sort((a, b) => a.sort_order - b.sort_order),
      product_options: row.product_options
        .filter((option) => option.is_active)
        .sort((a, b) => a.sort_order - b.sort_order),
    })) as ProductView[];
  },

  async menus(tenantId: string): Promise<MenuPackageView[]> {
    const { data, error } = await supabase
      .from("menus")
      .select(
        "id, category_id, name, slug, short_description, description, price, currency, image_url, badges, is_special, sort_order, menu_products(quantity, sort_order, products(id, name, image_url, price))",
      )
      .eq("tenant_id", tenantId)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((row) => ({
      ...row,
      menu_products: [...row.menu_products].sort((a, b) => a.sort_order - b.sort_order),
    })) as MenuPackageView[];
  },

  async menusForProduct(tenantId: string, productId: string) {
    const { data, error } = await supabase
      .from("menu_products")
      .select("menus(id, name, slug, price, currency, image_url, status)")
      .eq("tenant_id", tenantId)
      .eq("product_id", productId);
    if (error) throw error;
    return (data ?? []).flatMap((row) => (row.menus && row.menus.status === "published" ? [row.menus] : []));
  },

  /**
   * Orders go through the `place_order` database function: it reprices every
   * line from the database, enforces the plan's order feature and writes the
   * order, its items and the first status history row in one transaction.
   */
  async placeOrder(input: {
    tenant_id: string;
    branch_id?: string | null | undefined;
    table_no?: string | null | undefined;
    customer_name: string;
    customer_phone: string;
    note?: string | null | undefined;
    items: Array<{
      product_id?: string | null | undefined;
      menu_id?: string | null | undefined;
      quantity: number;
      note?: string | null | undefined;
    }>;
  }): Promise<PlacedOrder> {
    const { data, error } = await supabase.rpc("place_order", {
      _tenant_id: input.tenant_id,
      _items: input.items.map((item) => ({
        product_id: item.product_id ?? null,
        menu_id: item.menu_id ?? null,
        quantity: item.quantity,
        note: item.note ?? null,
      })),
      _customer_name: input.customer_name,
      _customer_phone: input.customer_phone,
      ...(input.branch_id ? { _branch_id: input.branch_id } : {}),
      ...(input.table_no ? { _table_no: input.table_no } : {}),
      ...(input.note ? { _note: input.note } : {}),
    });
    if (error) throw error;
    const order = Array.isArray(data) ? data[0] : data;
    if (!order) throw new Error("Sipariş oluşturulamadı");
    return order as PlacedOrder;
  },

  async orderWithHistory(tenantId: string, orderId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, code, status, total, currency, table_no, customer_name, customer_phone, note, created_at, order_items(id, item_name, unit_price, quantity, note), order_status_history(id, status, created_at)",
      )
      .eq("tenant_id", tenantId)
      .eq("id", orderId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
