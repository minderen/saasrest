export type PlanKind = "agent" | "tenant";

export type SubscriptionStatus = "active" | "suspended" | "pending" | "cancelled";

export type PlanFeatureRecord = {
  id: string;
  plan_id: string;
  key: string;
  label: string;
  description: string | null;
  is_included: boolean;
  sort_order: number;
};

export type PlanLimitRecord = {
  id: string;
  plan_id: string;
  key: string;
  /** -1 means unlimited, null means not defined by the plan. */
  limit_value: number | null;
  unit: string | null;
};

export type PlanRecord = {
  id: string;
  kind: PlanKind;
  slug: string;
  name: string;
  tagline: string | null;
  price_monthly: number;
  price_yearly: number | null;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type PlanWithDetails = PlanRecord & {
  plan_features: PlanFeatureRecord[];
  plan_limits: PlanLimitRecord[];
};

export type UsageRow = {
  key: string;
  used: number;
  limit_value: number | null;
};
