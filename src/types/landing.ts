export type LandingSection = {
  id: string;
  key: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  media_url: string | null;
  config: Record<string, unknown>;
  sort_order: number;
};

export type LandingAnnouncement = {
  id: string;
  message: string;
  link_label: string | null;
  link_href: string | null;
};

export type LandingFeature = {
  id: string;
  icon: string | null;
  title: string;
  description: string | null;
  detail_html: string | null;
};

export type LandingFaq = { id: string; question: string; answer: string };

export type PlanSummary = {
  id: string;
  kind: string;
  slug: string;
  name: string;
  tagline: string | null;
  price_monthly: number;
  currency: string;
  features: unknown;
  is_featured: boolean;
};
