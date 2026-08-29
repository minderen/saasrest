export type TenantRecord = {
  id: string;
  name: string;
  slug: string;
  default_locale: string;
  website_theme: string;
  menu_theme: string;
  is_published: boolean;
};

/** Minimal tenant identity passed down to themes. */
export type TenantIdentity = Pick<TenantRecord, "id" | "name" | "slug">;
