import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { tenantMemberRemoveSchema, tenantMemberSchema } from "@/validators/tenant.validator";

/** Server-side guard: the caller must be able to manage this tenant (RLS helper). */
async function assertCanManageTenant(
  supabase: { rpc: (fn: "can_manage_tenant", args: { _tenant_id: string }) => PromiseLike<{ data: unknown; error: { message: string } | null }> },
  tenantId: string,
) {
  const { data, error } = await supabase.rpc("can_manage_tenant", { _tenant_id: tenantId });
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("Bu markanın ekibini yönetme yetkiniz bulunmuyor.");
}

export const addTenantMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => tenantMemberSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertCanManageTenant(context.supabase, data.tenantId);

    // Email → user lookup needs elevated read; the caller is already authorized above.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error: lookupError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", data.email.toLowerCase())
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (!profile) throw new Error("Bu e-posta ile kayıtlı kullanıcı bulunamadı; kullanıcı önce hesap açmalı.");

    // Writes go through the caller's client so RLS re-validates the operation.
    const { error: memberError } = await context.supabase.from("tenant_users").upsert(
      {
        tenant_id: data.tenantId,
        user_id: profile.id,
        role: data.role,
        title: data.title ?? null,
        is_active: true,
      },
      { onConflict: "tenant_id,user_id" },
    );
    if (memberError) throw new Error(memberError.message);

    const { error: roleError } = await context.supabase
      .from("user_roles")
      .insert({ user_id: profile.id, role: data.role, tenant_id: data.tenantId });
    if (roleError && roleError.code !== "23505") throw new Error(roleError.message);

    return { ok: true };
  });

export const removeTenantMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => tenantMemberRemoveSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertCanManageTenant(context.supabase, data.tenantId);

    const { error } = await context.supabase
      .from("tenant_users")
      .delete()
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);

    await context.supabase
      .from("user_roles")
      .delete()
      .eq("tenant_id", data.tenantId)
      .eq("user_id", data.userId);

    return { ok: true };
  });
