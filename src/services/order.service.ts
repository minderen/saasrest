import { menuRepository } from "@/repositories/menu.repository";
import { orderSchema, type OrderInput } from "@/validators/order.validator";

/**
 * Order business rules. Totals are recalculated here (never trusted from the
 * UI) before the repository persists the order.
 */
export const orderService = {
  calculateTotal(items: OrderInput["items"]) {
    return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  },

  async place(input: OrderInput) {
    const parsed = orderSchema.parse(input);
    return menuRepository.createOrder({
      tenant_id: parsed.tenant_id,
      branch_id: parsed.branch_id ?? null,
      table_no: parsed.table_no ?? null,
      customer_name: parsed.customer_name,
      customer_phone: parsed.customer_phone,
      note: parsed.note ?? null,
      total: orderService.calculateTotal(parsed.items),
      items: parsed.items.map((item) => ({
        item_name: item.item_name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        product_id: item.product_id ?? null,
        menu_id: item.menu_id ?? null,
      })),
    });
  },
};

export type { OrderInput };
export { orderSchema };
