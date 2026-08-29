import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(2, "Slug en az 2 karakter olmalı")
  .max(48, "Slug en fazla 48 karakter olabilir")
  .regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, sayı ve tire içerebilir");

export const tenantCreateSchema = z.object({
  agent_id: z.string().uuid("Acente seçin"),
  name: z.string().trim().min(2, "Marka adı en az 2 karakter"),
  slug,
  default_locale: z.string().trim().min(2).max(8).default("tr"),
  website_theme: z.string().trim().min(1, "Website teması seçin"),
  menu_theme: z.string().trim().min(1, "Menü teması seçin"),
});

export const tenantUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2, "Marka adı en az 2 karakter"),
  default_locale: z.string().trim().min(2).max(8),
  website_theme: z.string().trim().min(1),
  menu_theme: z.string().trim().min(1),
});

export const tenantMemberSchema = z.object({
  tenantId: z.string().uuid(),
  email: z.string().trim().email("Geçerli bir e-posta girin"),
  role: z.enum(["tenant_owner", "tenant_staff"]),
  title: z.string().trim().max(80).optional(),
});

export const tenantMemberRemoveSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type TenantCreateInput = z.infer<typeof tenantCreateSchema>;
export type TenantUpdateInput = z.infer<typeof tenantUpdateSchema>;
