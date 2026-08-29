import { Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";

import { tenantRepository } from "@/repositories/tenant";
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

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Yükleniyor…</p>
    </div>
  );
}

function NotPublished() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Bu sayfa yayında değil</h1>
        <p className="mt-2 text-sm text-muted-foreground">Aradığınız işletme yayınlanmamış veya adres hatalı.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}

function TenantSite() {
  const { tenant: slug } = Route.useParams();
  const { data: tenant, isPending } = useQuery({
    queryKey: ["tenant", slug],
    queryFn: () => tenantRepository.bySlug(slug),
  });

  const tenantId = tenant?.id ?? "";
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
    ],
  });

  if (isPending) return <Loading />;
  if (!tenant || !tenant.is_published) return <NotPublished />;
  if (results.some((result) => result.isPending)) return <Loading />;

  const [settings, sections, navigation, slides, awards, branches, campaigns, posts] = results;
  const Theme = resolveTheme<RestaurantThemeProps>(websiteThemes, tenant.website_theme);

  return (
    <Suspense fallback={<Loading />}>
      <Theme
        tenant={{ id: tenant.id, name: tenant.name, slug: tenant.slug }}
        settings={(settings.data as Record<string, unknown> | null) ?? null}
        sections={(sections.data as RestaurantThemeProps["sections"]) ?? []}
        navigation={(navigation.data as RestaurantThemeProps["navigation"]) ?? []}
        slides={(slides.data as RestaurantThemeProps["slides"]) ?? []}
        awards={(awards.data as RestaurantThemeProps["awards"]) ?? []}
        branches={(branches.data as RestaurantThemeProps["branches"]) ?? []}
        campaigns={(campaigns.data as RestaurantThemeProps["campaigns"]) ?? []}
        posts={(posts.data as RestaurantThemeProps["posts"]) ?? []}
      />
    </Suspense>
  );
}
