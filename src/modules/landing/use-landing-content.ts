import { useQueries } from "@tanstack/react-query";

import { appConfig } from "@/config/app.config";
import { landingRepository } from "@/repositories/landing.repository";
import type { LandingThemeProps } from "@/themes/superadmin/theme-01/index";

/** Data access for the public SaaS landing page — kept out of the route file. */
export function useLandingContent(locale: string) {
  const results = useQueries({
    queries: [
      { queryKey: ["landing", "announcement", locale], queryFn: () => landingRepository.announcement(locale) },
      { queryKey: ["landing", "sections", locale], queryFn: () => landingRepository.sections(locale) },
      { queryKey: ["landing", "features", locale], queryFn: () => landingRepository.features(locale) },
      { queryKey: ["landing", "faqs", locale], queryFn: () => landingRepository.faqs(locale) },
      { queryKey: ["landing", "plans"], queryFn: () => landingRepository.plans() },
      { queryKey: ["landing", "brand"], queryFn: () => landingRepository.settings("brand") },
      { queryKey: ["landing", "demo"], queryFn: () => landingRepository.settings("demo") },
    ],
  });

  const [announcement, sections, features, faqs, plans, brand, demo] = results;
  const isPending = results.some((result) => result.isPending);

  const content: LandingThemeProps = {
    announcement: (announcement?.data as LandingThemeProps["announcement"]) ?? null,
    sections: (sections?.data as LandingThemeProps["sections"]) ?? [],
    features: (features?.data as LandingThemeProps["features"]) ?? [],
    faqs: (faqs?.data as LandingThemeProps["faqs"]) ?? [],
    plans: (plans?.data as LandingThemeProps["plans"]) ?? [],
    brand: (brand?.data as Record<string, string>) ?? {},
    demoSlug:
      ((demo?.data as Record<string, string>) ?? {})["tenant_slug"] ?? appConfig.defaultDemoTenantSlug,
  };

  return { isPending, content };
}
