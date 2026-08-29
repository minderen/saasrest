import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";

import { landingRepository } from "@/repositories/landing";
import { useI18n } from "@/lib/i18n";
import { landingThemes, resolveTheme } from "@/themes/registry";
import type { LandingThemeProps } from "@/themes/superadmin/theme-01/index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QR Sofra — Restoranlar için QR menü ve web sitesi platformu" },
      {
        name: "description",
        content:
          "QR Sofra ile restoranınızın web sitesini, dijital QR menüsünü ve şube yönetimini tek panelden kurun. Çok dilli, tema ve eklenti destekli.",
      },
      { property: "og:title", content: "QR Sofra — QR menü ve restoran web sitesi platformu" },
      {
        property: "og:description",
        content: "Marka, şube, menü ve sipariş yönetimini tek panelde birleştiren çok kiracılı QR menü platformu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function Skeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Yükleniyor…</p>
    </div>
  );
}

function LandingPage() {
  const { locale } = useI18n();
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

  if (results.some((result) => result.isPending)) return <Skeleton />;

  const [announcement, sections, features, faqs, plans, brand, demo] = results;
  const Theme = resolveTheme<LandingThemeProps>(landingThemes, "theme-01");

  return (
    <Suspense fallback={<Skeleton />}>
      <Theme
        announcement={(announcement.data as LandingThemeProps["announcement"]) ?? null}
        sections={(sections.data as LandingThemeProps["sections"]) ?? []}
        features={(features.data as LandingThemeProps["features"]) ?? []}
        faqs={(faqs.data as LandingThemeProps["faqs"]) ?? []}
        plans={(plans.data as LandingThemeProps["plans"]) ?? []}
        brand={(brand.data as Record<string, string>) ?? {}}
        demoSlug={((demo.data as Record<string, string>) ?? {})["tenant_slug"] ?? "anatolia"}
      />
    </Suspense>
  );
}
