import { z } from "zod";

import { appConfig } from "@/config/app.config";

export const orderItemSchema = z.object({
  item_name: z.string().trim().min(1).max(160),
  unit_price: z.number().nonnegative(),
  quantity: z.number().int().min(1).max(appConfig.limits.maxCartLineQuantity),
  product_id: z.string().uuid().nullable().optional(),
  menu_id: z.string().uuid().nullable().optional(),
});

export const orderSchema = z.object({
  tenant_id: z.string().uuid(),
  branch_id: z.string().uuid().nullable().optional(),
  table_no: z.string().trim().max(24).nullable().optional(),
  customer_name: z.string().trim().min(2, "İsim en az 2 karakter olmalı").max(120),
  customer_phone: z.string().trim().min(7, "Geçerli bir telefon girin").max(24),
  note: z.string().trim().max(600).nullable().optional(),
  items: z.array(orderItemSchema).min(1, "Sepet boş"),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
