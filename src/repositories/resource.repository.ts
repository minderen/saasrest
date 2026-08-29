import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

/**
 * Generic table access for the admin panel. Deliberately untyped at the table
 * level so a single repository can serve every declarative resource; RLS in the
 * database remains the only authorization boundary.
 */
const db = supabase as unknown as SupabaseClient;

export type ResourceRow = Record<string, unknown>;

export type ResourceListSpec = {
  table: string;
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  filter?: Record<string, unknown>;
  tenantId?: string | null;
  softDelete?: boolean;
  limit?: number;
};

export const resourceRepository = {
  async list(spec: ResourceListSpec): Promise<ResourceRow[]> {
    let query = db.from(spec.table).select(spec.select ?? "*");
    if (spec.tenantId) query = query.eq("tenant_id", spec.tenantId);
    for (const [column, value] of Object.entries(spec.filter ?? {})) {
      if (value === undefined || value === null || value === "") continue;
      query = query.eq(column, value);
    }
    if (spec.softDelete) query = query.is("deleted_at", null);
    if (spec.orderBy) query = query.order(spec.orderBy, { ascending: spec.ascending ?? true });
    const { data, error } = await query.limit(spec.limit ?? 300);
    if (error) throw error;
    return (data ?? []) as ResourceRow[];
  },

  async insert(table: string, values: ResourceRow) {
    const { error } = await db.from(table).insert(values);
    if (error) throw error;
  },

  async update(table: string, primaryKey: string, id: unknown, values: ResourceRow) {
    const { error } = await db.from(table).update(values).eq(primaryKey, id);
    if (error) throw error;
  },

  async remove(table: string, primaryKey: string, id: unknown) {
    const { error } = await db.from(table).delete().eq(primaryKey, id);
    if (error) throw error;
  },

  async softDelete(table: string, primaryKey: string, id: unknown) {
    const { error } = await db
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq(primaryKey, id);
    if (error) throw error;
  },

  async count(table: string, filter?: Record<string, unknown>) {
    let query = db.from(table).select("*", { count: "exact", head: true });
    for (const [column, value] of Object.entries(filter ?? {})) query = query.eq(column, value);
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  },
};
