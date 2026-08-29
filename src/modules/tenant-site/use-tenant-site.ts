import { useQueries, useQuery } from "@tanstack/react-query";

import { tenantRepository } from "@/repositories/tenant.repository";
import type { RestaurantThemeProps } from "@/themes/restaurant/theme-01/index";

/** Loads the public tenant record by slug (shared by site + menu routes). */
export function useTenantBySlug(slug: string) {
  return useQuery({ queryKey: ["tenant", slug], queryFn: () => tenantRepository.bySlug(slug) });
}

/** Loads all published content needed by a restaurant website theme. */
export function useTenantSiteContent(tenantId: string) {
  const enabled = Boolean(tenantId);
  const results = useQueries({
    queries: [
      { queryKey: ["tenant", tenantId, "settings"], queryFn: () => tenantRepository.settings(tenantId), enabled },
      { queryKey: ["tenant", tenantId, "sections"], queryFn: () => tenantRepository.sections(tenantId), enabled },
      { queryKey: ["tenant", tenantId, "navigation"], queryFn: () => tenantRepository.navigation(tenantId), enabled },
      { queryKey: ["tenant", tenantId, "slides"], queryFn: () => tenantRepository.slides(tenantId), enabled },
      { queryKey: ["tenant", tenantId, "awards"], queryFn: () => tenantRepository.awards(tenantId), enabled },
      { queryKey: ["tenant", tenantId, "branches"], queryFn: () => tenantRepository.branches(tenantId), enabled },
      { queryKey: ["tenant", tenantId, "campaigns"], queryFn: () => tenantRepository.campaigns(tenantId), enabled },
      { queryKey: ["tenant", tenantId, "posts"], queryFn: () => tenantRepository.posts(tenantId), enabled },
      { queryKey: ["tenant", tenantId, "specials"], queryFn: () => tenantRepository.specials(tenantId), enabled },
    ],
  });

  const [settings, sections, navigation, slides, awards, branches, campaigns, posts, specials] = results;

  return {
    isPending: results.some((result) => result.isPending),
    content: {
      settings: (settings?.data as Record<string, unknown> | null) ?? null,
      sections: (sections?.data as RestaurantThemeProps["sections"]) ?? [],
      navigation: (navigation?.data as RestaurantThemeProps["navigation"]) ?? [],
      slides: (slides?.data as RestaurantThemeProps["slides"]) ?? [],
      awards: (awards?.data as RestaurantThemeProps["awards"]) ?? [],
      branches: (branches?.data as RestaurantThemeProps["branches"]) ?? [],
      campaigns: (campaigns?.data as RestaurantThemeProps["campaigns"]) ?? [],
      posts: (posts?.data as RestaurantThemeProps["posts"]) ?? [],
      specials: (specials?.data as RestaurantThemeProps["specials"]) ?? [],
    },
  };
}
