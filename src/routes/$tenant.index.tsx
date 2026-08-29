import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyScreen, LoadingScreen } from "@/components/shared/state-screens";
import { useTenantBySlug, useTenantSiteContent } from "@/modules/tenant-site/use-tenant-site";
import { resolveTheme, websiteThemes } from "@/themes/registry";
import type { RestaurantThemeProps } from "@/themes/restaurant/theme-01/index";

export const Route = createFileRoute("/$tenant/")({
  head: () => ({
    meta: [
      { title: "Restoran web sitesi · QR Sofra" },
      {
        name: "description",
        content: "Şubeler, kampanyalar, haberler ve dijital menü — QR Sofra altyapısıyla hazırlanan restoran web sitesi.",
      },
      { property: "og:title", content: "Restoran web sitesi · QR Sofra" },
      {
        property: "og:description",
        content: "Şube bilgileri, kampanyalar, ödüller ve QR menüye tek dokunuşla erişim.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TenantSite,
});

function TenantSite() {
  const { tenant: slug } = Route.useParams();
  const { data: tenant, isPending } = useTenantBySlug(slug);
  const { isPending: contentPending, content } = useTenantSiteContent(tenant?.id ?? "");

  if (isPending) return <LoadingScreen />;
  if (!tenant || !tenant.is_published) {
    return (
      <EmptyScreen
        title="Bu sayfa yayında değil"
        description="Aradığınız işletme yayınlanmamış veya adres hatalı."
      />
    );
  }
  if (contentPending) return <LoadingScreen />;

  const Theme = resolveTheme<RestaurantThemeProps>(websiteThemes, tenant.website_theme);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Theme tenant={{ id: tenant.id, name: tenant.name, slug: tenant.slug }} {...content} />
    </Suspense>
  );
}
