import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyScreen, LoadingScreen } from "@/components/shared/state-screens";
import { CartProvider } from "@/modules/cart";
import { useTenantMenu } from "@/modules/menu/use-tenant-menu";
import { useTenantBySlug } from "@/modules/tenant-site/use-tenant-site";
import { qrMenuSearchSchema } from "@/validators/qr-menu.validator";
import { menuThemes, resolveTheme } from "@/themes/registry";
import type { MenuThemeProps } from "@/themes/menu/theme-01/index";

export const Route = createFileRoute("/$tenant/menu")({
  validateSearch: qrMenuSearchSchema,
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

function TenantMenu() {
  const { tenant: slug } = Route.useParams();
  const search = Route.useSearch();
  const { data: tenant, isPending } = useTenantBySlug(slug);
  const { isPending: menuPending, content } = useTenantMenu(tenant?.id ?? "");

  if (isPending) return <LoadingScreen message="Menü yükleniyor…" />;
  if (!tenant || !tenant.is_published) return <EmptyScreen title="Menü bulunamadı" />;
  if (menuPending) return <LoadingScreen message="Menü yükleniyor…" />;

  const Theme = resolveTheme<MenuThemeProps>(menuThemes, tenant.menu_theme);

  return (
    <CartProvider>
      <Suspense fallback={<LoadingScreen message="Menü yükleniyor…" />}>
        <Theme
          tenant={{ id: tenant.id, name: tenant.name, slug: tenant.slug }}
          branchId={search.branch ?? null}
          tableNo={search.table ?? null}
          {...content}
        />
      </Suspense>
    </CartProvider>
  );
}
