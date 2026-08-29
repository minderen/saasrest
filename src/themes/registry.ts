import { lazy, type ComponentType } from "react";

/**
 * Theme registry — themes are pluggable. A tenant stores a theme key in the
 * database (`tenants.website_theme` / `tenants.menu_theme`); the registry maps
 * that key to a lazily loaded component. Adding a theme = adding a folder plus
 * one entry here, no other file changes.
 */
type ThemeEntry<P> = { name: string; component: ComponentType<P> };

export const landingThemes: Record<string, ThemeEntry<never>> = {
  "theme-01": {
    name: "Saffron",
    component: lazy(() => import("./superadmin/theme-01/index")) as unknown as ComponentType<never>,
  },
};

export const websiteThemes: Record<string, ThemeEntry<never>> = {
  "theme-01": {
    name: "Anadolu",
    component: lazy(() => import("./restaurant/theme-01/index")) as unknown as ComponentType<never>,
  },
};

export const menuThemes: Record<string, ThemeEntry<never>> = {
  "theme-01": {
    name: "Sofra",
    component: lazy(() => import("./menu/theme-01/index")) as unknown as ComponentType<never>,
  },
};

export function resolveTheme<P>(registry: Record<string, ThemeEntry<never>>, key: string | null | undefined) {
  const entry = registry[key ?? ""] ?? registry["theme-01"];
  return entry?.component as unknown as ComponentType<P>;
}
