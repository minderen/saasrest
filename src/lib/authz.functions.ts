import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const tenantRoleSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["tenant_owner", "tenant_staff"]),
});

const publishSchema = z.object({ tenantId: z.string().uuid(), isPublished: z.boolean() });

/**
 * Critical operations run server-side and re-check authorization through the
 * caller's own Supabase client, so RLS + can_manage_tenant() decide the outcome.
 */
export const grantTenantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => tenantRoleSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: canManage, error: checkError } = await context.supabase.rpc("can_manage_tenant", {
      _tenant_id: data.tenantId,
    });
    if (checkError) throw new Error(checkError.message);
    if (!canManage) throw new Error("Forbidden: bu marka için yetkiniz yok");

    const { error } = await context.supabase
      .from("user_roles")
      .insert({ user_id: data.userId, tenant_id: data.tenantId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const revokeTenantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => tenantRoleSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setTenantPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => publishSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: canManage, error: checkError } = await context.supabase.rpc("can_manage_tenant", {
      _tenant_id: data.tenantId,
    });
    if (checkError) throw new Error(checkError.message);
    if (!canManage) throw new Error("Forbidden: yayın durumunu değiştirme yetkiniz yok");

    const { error } = await context.supabase
      .from("tenants")
      .update({ is_published: data.isPublished })
      .eq("id", data.tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
