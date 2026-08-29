/** Shared view models for the Anadolu (theme-01) restaurant website. */

export type Section = {
  id: string;
  key: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  config: unknown;
};

export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  target: string | null;
};

export type Slide = {
  id: string;
  image_url: string | null;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  button_label: string | null;
  button_href: string | null;
  button_target?: string | null;
};

export type Award = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  detail_html: string | null;
};

export type Branch = {
  id: string;
  name: string;
  cover_image_url: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  directions_url: string | null;
  map_embed_url?: string | null;
  opening_hours: unknown;
};

export type Campaign = {
  id: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  image_url: string | null;
  badge: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

export type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  badge: string | null;
  published_at: string | null;
  view_count: number;
};

export type SpecialItem = {
  id: string;
  kind: "product" | "menu";
  name: string;
  short_description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  badges: unknown;
};

export type RestaurantThemeProps = {
  tenant: { id: string; name: string; slug: string };
  settings: Record<string, unknown> | null;
  sections: Section[];
  navigation: NavigationItem[];
  slides: Slide[];
  awards: Award[];
  branches: Branch[];
  campaigns: Campaign[];
  posts: Post[];
  specials: SpecialItem[];
};
