import { supabase } from "@/integrations/supabase/client";
import type { PlanKind, PlanWithDetails, UsageRow } from "@/types/billing";

/**
 * Plan / abonelik / kota okumaları. Yazma işlemleri sunucu tarafındaki
 * billing.functions.ts üzerinden yapılır; buradaki okumalar RLS ile filtrelenir.
 */
export const billingRepository = {
  async plans(kind?: PlanKind): Promise<PlanWithDetails[]> {
    let query = supabase
      .from("plans")
      .select(
        "id, kind, slug, name, tagline, price_monthly, price_yearly, currency, is_active, is_featured, sort_order, plan_features(id, plan_id, key, label, description, is_included, sort_order), plan_limits(id, plan_id, key, limit_value, unit)",
      )
      .order("kind")
      .order("sort_order");
    if (kind) query = query.eq("kind", kind);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as PlanWithDetails[];
  },

  async subscriptions() {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        "id, status, started_at, ends_at, plan_id, tenant_id, agent_id, plans(name, kind, slug), tenants(name, slug), agents(name, slug)",
      )
      .order("started_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  },

  async tenantUsage(tenantId: string): Promise<UsageRow[]> {
    const { data, error } = await supabase.rpc("tenant_usage", { _tenant_id: tenantId });
    if (error) throw error;
    return (data ?? []) as UsageRow[];
  },

  async agentUsage(agentId: string): Promise<UsageRow[]> {
    const { data, error } = await supabase.rpc("agent_usage_summary", { _agent_id: agentId });
    if (error) throw error;
    return (data ?? []) as UsageRow[];
  },

  async tenantPlan(tenantId: string) {
    const { data, error } = await supabase.rpc("tenant_effective_plan_id", {
      _tenant_id: tenantId,
    });
    if (error) throw error;
    return (data as string | null) ?? null;
  },
};
