import { z } from "zod";

export const planKindSchema = z.enum(["agent", "tenant"]);

export const planUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  kind: planKindSchema,
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, sayı ve tire içerebilir"),
  name: z.string().min(2).max(120),
  tagline: z.string().max(200).nullable().optional(),
  price_monthly: z.number().min(0).max(1_000_000),
  price_yearly: z.number().min(0).max(10_000_000).nullable().optional(),
  currency: z.string().length(3).default("TRY"),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(999).default(0),
});
export type PlanUpsertInput = z.infer<typeof planUpsertSchema>;

export const planFeatureUpsertSchema = z.object({
  planId: z.string().uuid(),
  key: z.string().min(2).max(60),
  label: z.string().min(1).max(120),
  description: z.string().max(300).nullable().optional(),
  isIncluded: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(999).default(0),
});

export const planLimitUpsertSchema = z.object({
  planId: z.string().uuid(),
  key: z.string().min(2).max(60),
  /** -1 means unlimited. */
  limitValue: z.number().int().min(-1).max(1_000_000),
  unit: z.string().max(30).nullable().optional(),
});

export const planEntryDeleteSchema = z.object({ id: z.string().uuid() });

export const subscriptionCreateSchema = z
  .object({
    planId: z.string().uuid(),
    tenantId: z.string().uuid().nullable().optional(),
    agentId: z.string().uuid().nullable().optional(),
    endsAt: z.string().datetime().nullable().optional(),
  })
  .refine((value) => Boolean(value.tenantId) !== Boolean(value.agentId), {
    message: "Abonelik ya bir markaya ya da bir acenteye bağlanmalı",
  });

export const subscriptionStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "suspended", "pending", "cancelled"]),
  endsAt: z.string().datetime().nullable().optional(),
});
