import { Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { menuRepository, tenantRepository } from "@/repositories/tenant";
import { CartProvider } from "@/modules/cart/cart-context";
import { menuThemes, resolveTheme } from "@/themes/registry";
import type { MenuThemeProps } from "@/themes/menu/theme-01/index";

/** QR URLs stay stable: /{tenant}/menu?branch=<uuid>&table=<no> */
const searchSchema = z.object({
  branch: z.string().uuid().optional(),
  table: z.string().max(24).optional(),
});

export const Route = createFileRoute("/$tenant/menu")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Dijital QR Menü · QR Sofra" },
      {
        name: "description",
        content: "Kategoriler, ürün detayları, menü paketleri ve masadan sipariş — mobil öncelikli dijital QR menü.",
      },
      { property: "og:title", content: "Dijital QR Menü · QR Sofra" },
      { property: "og:description", content: "Masanızdan menüyü inceleyin, sepete ekleyin ve siparişinizi gönderin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TenantMenu,
});

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Menü yükleniyor…</p>
    </div>
  );
}

function TenantMenu() {
  const { tenant: slug } = Route.useParams();
  const search = Route.useSearch();
  const { data: tenant, isPending } = useQuery({
    queryKey: ["tenant", slug],
    queryFn: () => tenantRepository.bySlug(slug),
  });

  const tenantId = tenant?.id ?? "";
  const enabled = Boolean(tenantId);
  const results = useQueries({
    queries: [
      { queryKey: ["menu", tenantId, "categories"], queryFn: () => menuRepository.categories(tenantId), enabled },
      { queryKey: ["menu", tenantId, "products"], queryFn: () => menuRepository.products(tenantId), enabled },
      { queryKey: ["menu", tenantId, "menus"], queryFn: () => menuRepository.menus(tenantId), enabled },
    ],
  });

  if (isPending) return <Loading />;
  if (!tenant || !tenant.is_published) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Menü bulunamadı</h1>
          <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }
  if (results.some((result) => result.isPending)) return <Loading />;

  const [categories, products, menus] = results;
  const Theme = resolveTheme<MenuThemeProps>(menuThemes, tenant.menu_theme);

  return (
    <CartProvider>
      <Suspense fallback={<Loading />}>
        <Theme
          tenant={{ id: tenant.id, name: tenant.name, slug: tenant.slug }}
          branchId={search.branch ?? null}
          tableNo={search.table ?? null}
          categories={(categories.data as MenuThemeProps["categories"]) ?? []}
          products={(products.data as MenuThemeProps["products"]) ?? []}
          menus={(menus.data as MenuThemeProps["menus"]) ?? []}
        />
      </Suspense>
    </CartProvider>
  );
}
