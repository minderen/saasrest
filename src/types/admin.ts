/** Declarative admin resource model. Shared by config, repository, service and UI. */
export type AdminFieldType = "text" | "textarea" | "number" | "boolean" | "select" | "date" | "json";

export type AdminFieldOption = { value: string; label: string };

export type AdminField = {
  name: string;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  /** Static options for select fields. */
  options?: AdminFieldOption[];
  /** Dynamic option source resolved by the UI layer. */
  optionsFrom?: "tenants" | "agents" | "plans" | "languages" | "menuCategories" | "profiles" | "roles";
  /** Slug target: auto-filled from this field when left empty. */
  slugFrom?: string;
  full?: boolean;
};

export type AdminColumn = {
  name: string;
  label: string;
  /** Cell renderer must stay string-only so config files remain plain TypeScript. */
  format?: (value: unknown, row: Record<string, unknown>) => string;
};

export type AdminResource = {
  key: string;
  title: string;
  description: string;
  table: string;
  select?: string;
  primaryKey?: string;
  orderBy?: string;
  ascending?: boolean;
  /** Rows are filtered/created against the selected tenant. */
  tenantScoped?: boolean;
  /** Table uses deleted_at instead of hard deletes. */
  softDelete?: boolean;
  /** No create/update/delete affordances (logs, generated rows). */
  readOnly?: boolean;
  /** Disable row deletion only. */
  noDelete?: boolean;
  filter?: Record<string, unknown>;
  searchColumns?: string[];
  columns: AdminColumn[];
  fields: AdminField[];
  limit?: number;
};
