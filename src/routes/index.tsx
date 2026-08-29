import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { LoadingScreen } from "@/components/shared/state-screens";
import { useI18n } from "@/i18n";
import { useLandingContent } from "@/modules/landing/use-landing-content";
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

function LandingPage() {
  const { locale } = useI18n();
  const { isPending, content } = useLandingContent(locale);

  if (isPending) return <LoadingScreen />;

  const Theme = resolveTheme<LandingThemeProps>(landingThemes, "theme-01");

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Theme {...content} />
    </Suspense>
  );
}
