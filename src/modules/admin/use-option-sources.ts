import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { resourceRepository, type ResourceRow } from "@/repositories/resource.repository";
import type { AdminField, AdminFieldOption } from "@/types/admin";

type SourceKey = NonNullable<AdminField["optionsFrom"]>;

const SOURCES: Record<
  SourceKey,
  {
    table: string;
    select: string;
    value: string;
    label: string;
    tenantScoped?: boolean;
    orderBy: string;
  }
> = {
  tenants: { table: "tenants", select: "id, name", value: "id", label: "name", orderBy: "name" },
  agents: { table: "agents", select: "id, name", value: "id", label: "name", orderBy: "name" },
  plans: {
    table: "plans",
    select: "id, name, kind",
    value: "id",
    label: "name",
    orderBy: "sort_order",
  },
  languages: {
    table: "languages",
    select: "code, name",
    value: "code",
    label: "name",
    orderBy: "sort_order",
  },
  profiles: {
    table: "profiles",
    select: "id, email",
    value: "id",
    label: "email",
    orderBy: "email",
  },
  roles: {
    table: "roles",
    select: "key, name",
    value: "key",
    label: "name",
    orderBy: "sort_order",
  },
  menuCategories: {
    table: "menu_categories",
    select: "id, name",
    value: "id",
    label: "name",
    tenantScoped: true,
    orderBy: "sort_order",
  },
};

function toOptions(source: SourceKey, rows: ResourceRow[]): AdminFieldOption[] {
  const spec = SOURCES[source];
  return rows.map((row) => ({
    value: String(row[spec.value] ?? ""),
    label: String(row[spec.label] ?? row[spec.value] ?? ""),
  }));
}

/** Loads dynamic select options declared by resource fields (`optionsFrom`). */
export function useOptionSources(fields: AdminField[], tenantId?: string | null) {
  const sources = useMemo(
    () =>
      Array.from(
        new Set(fields.flatMap((field) => (field.optionsFrom ? [field.optionsFrom] : []))),
      ),
    [fields],
  );

  const results = useQueries({
    queries: sources.map((source) => {
      const spec = SOURCES[source];
      return {
        queryKey: ["panel", "options", source, spec.tenantScoped ? tenantId : null],
        enabled: spec.tenantScoped ? Boolean(tenantId) : true,
        queryFn: () =>
          resourceRepository.list({
            table: spec.table,
            select: spec.select,
            orderBy: spec.orderBy,
            ...(spec.tenantScoped ? { tenantId: tenantId ?? null } : {}),
            limit: 500,
          }),
      };
    }),
  });

  return useMemo(() => {
    const map: Record<string, AdminFieldOption[]> = {};
    sources.forEach((source, index) => {
      map[source] = toOptions(source, results[index]?.data ?? []);
    });
    return map;
  }, [sources, results]);
}
