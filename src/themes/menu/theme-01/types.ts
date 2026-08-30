import type { MenuCategoryView, MenuPackageView, ProductView } from "@/types/menu";

export type MenuThemeProps = {
  tenant: { id: string; name: string; slug: string };
  branchId: string | null;
  tableNo: string | null;
  categories: MenuCategoryView[];
  products: ProductView[];
  menus: MenuPackageView[];
};

export type MenuEntry =
  | { kind: "product"; item: ProductView }
  | { kind: "menu"; item: MenuPackageView };

export type MenuItemLike = ProductView | MenuPackageView;

/** Badges may be stored as plain strings or as `{ label }` objects. */
export function badgeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (entry && typeof entry === "object" && "label" in entry) {
      return [String((entry as { label: unknown }).label)];
    }
    return [];
  });
}

export function isProduct(item: MenuItemLike): item is ProductView {
  return "product_features" in item || !("menu_products" in item);
}
