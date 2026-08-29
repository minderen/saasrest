import { useQueries } from "@tanstack/react-query";

import { menuRepository } from "@/repositories/menu.repository";
import type { MenuThemeProps } from "@/themes/menu/theme-01/index";

/** Loads categories, products and menu packages for a tenant's QR menu. */
export function useTenantMenu(tenantId: string) {
  const enabled = Boolean(tenantId);
  const results = useQueries({
    queries: [
      { queryKey: ["menu", tenantId, "categories"], queryFn: () => menuRepository.categories(tenantId), enabled },
      { queryKey: ["menu", tenantId, "products"], queryFn: () => menuRepository.products(tenantId), enabled },
      { queryKey: ["menu", tenantId, "menus"], queryFn: () => menuRepository.menus(tenantId), enabled },
    ],
  });

  const [categories, products, menus] = results;

  return {
    isPending: results.some((result) => result.isPending),
    content: {
      categories: (categories?.data as MenuThemeProps["categories"]) ?? [],
      products: (products?.data as MenuThemeProps["products"]) ?? [],
      menus: (menus?.data as MenuThemeProps["menus"]) ?? [],
    },
  };
}
