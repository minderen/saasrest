import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertSuperAdmin } from "@/lib/authz.server";
import {
  planEntryDeleteSchema,
  planFeatureUpsertSchema,
  planLimitUpsertSchema,
  planUpsertSchema,
  subscriptionCreateSchema,
  subscriptionStatusSchema,
} from "@/validators/plan.validator";


export const upsertPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => planUpsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase);
    const row = {
      kind: data.kind,
      slug: data.slug,
      name: data.name,
      tagline: data.tagline ?? null,
      price_monthly: data.price_monthly,
      price_yearly: data.price_yearly ?? null,
      currency: data.currency,
      is_active: data.is_active,
      is_featured: data.is_featured,
      sort_order: data.sort_order,
    };
    const query = data.id
      ? context.supabase.from("plans").update(row).eq("id", data.id).select("id").single()
      : context.supabase.from("plans").insert(row).select("id").single();
    const { data: saved, error } = await query;
    if (error) throw new Error(error.message);
    return { id: saved.id };
  });

export const setPlanActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => planEntryDeleteSchema.extend(planUpsertSchema.pick({ is_active: true }).shape).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase);
    const { error } = await context.supabase.from("plans").update({ is_active: data.is_active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertPlanFeature = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => planFeatureUpsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase);
    const { error } = await context.supabase.from("plan_features").upsert(
      {
        plan_id: data.planId,
        key: data.key,
        label: data.label,
        description: data.description ?? null,
        is_included: data.isIncluded,
        sort_order: data.sortOrder,
      },
      { onConflict: "plan_id,key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePlanFeature = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => planEntryDeleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase);
    const { error } = await context.supabase.from("plan_features").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertPlanLimit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => planLimitUpsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase);
    const { error } = await context.supabase.from("plan_limits").upsert(
      { plan_id: data.planId, key: data.key, limit_value: data.limitValue, unit: data.unit ?? null },
      { onConflict: "plan_id,key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePlanLimit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => planEntryDeleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase);
    const { error } = await context.supabase.from("plan_limits").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => subscriptionCreateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase);

    // Plan değişikliği: aynı hedefin açık aboneliği kapatılır, yenisi açılır.
    const closeQuery = context.supabase
      .from("subscriptions")
      .update({ status: "cancelled", ends_at: new Date().toISOString() })
      .eq("status", "active");
    const { error: closeError } = data.tenantId
      ? await closeQuery.eq("tenant_id", data.tenantId)
      : await closeQuery.eq("agent_id", data.agentId!);
    if (closeError) throw new Error(closeError.message);

    const { error } = await context.supabase.from("subscriptions").insert({
      plan_id: data.planId,
      tenant_id: data.tenantId ?? null,
      agent_id: data.agentId ?? null,
      status: "active",
      ends_at: data.endsAt ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setSubscriptionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => subscriptionStatusSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase);
    const { error } = await context.supabase
      .from("subscriptions")
      .update({ status: data.status, ends_at: data.endsAt ?? null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
