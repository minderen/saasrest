import { z } from "zod";

import { menuRepository } from "@/repositories/tenant";

export const orderSchema = z.object({
  tenant_id: z.string().uuid(),
  branch_id: z.string().uuid().nullable().optional(),
  table_no: z.string().trim().max(24).nullable().optional(),
  customer_name: z.string().trim().min(2, "İsim en az 2 karakter olmalı").max(120),
  customer_phone: z.string().trim().min(7, "Geçerli bir telefon girin").max(24),
  note: z.string().trim().max(600).nullable().optional(),
  items: z
    .array(
      z.object({
        item_name: z.string().trim().min(1).max(160),
        unit_price: z.number().nonnegative(),
        quantity: z.number().int().min(1).max(50),
        product_id: z.string().uuid().nullable().optional(),
        menu_id: z.string().uuid().nullable().optional(),
      }),
    )
    .min(1, "Sepet boş"),
});

export type OrderInput = z.infer<typeof orderSchema>;

export const orderService = {
  async place(input: OrderInput) {
    const parsed = orderSchema.parse(input);
    const total = parsed.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    return menuRepository.createOrder({
      tenant_id: parsed.tenant_id,
      branch_id: parsed.branch_id ?? null,
      table_no: parsed.table_no ?? null,
      customer_name: parsed.customer_name,
      customer_phone: parsed.customer_phone,
      note: parsed.note ?? null,
      total,
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
