import { z } from "zod";

import { appConfig } from "@/config/app.config";

/**
 * Order items only carry references and quantities. Prices, item names and the
 * total are resolved by the database (`place_order`), never sent by the client.
 */
export const orderItemSchema = z
  .object({
    product_id: z.string().uuid().nullable().optional(),
    menu_id: z.string().uuid().nullable().optional(),
    quantity: z.number().int().min(1).max(appConfig.limits.maxCartLineQuantity),
    note: z.string().trim().max(240).nullable().optional(),
  })
  .refine((item) => Boolean(item.product_id) !== Boolean(item.menu_id), {
    message: "Her sepet kalemi tek bir ürün veya menü içermelidir",
  });

export const orderSchema = z.object({
  tenant_id: z.string().uuid(),
  branch_id: z.string().uuid().nullable().optional(),
  table_no: z.string().trim().max(24).nullable().optional(),
  customer_name: z.string().trim().min(2, "İsim en az 2 karakter olmalı").max(120),
  customer_phone: z.string().trim().min(7, "Geçerli bir telefon girin").max(24),
  note: z.string().trim().max(600).nullable().optional(),
  items: z.array(orderItemSchema).min(1, "Sepetiniz boş").max(50),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
