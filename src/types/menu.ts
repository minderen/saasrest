export type MenuItemKind = "product" | "menu";

export type CartLine = {
  key: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  image_url: string | null;
  product_id: string | null;
  menu_id: string | null;
};

/** Product feature rows drive card chips, bullet lists and icon rows. */
export type ProductFeature = {
  id: string;
  label: string;
  value: string | null;
  icon: string | null;
  show_on_card: boolean;
  sort_order: number;
};

export type ProductOption = {
  id: string;
  group_label: string;
  name: string;
  price_delta: number;
  is_default: boolean;
};

export type MenuCategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

export type ProductView = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  badges: unknown;
  is_special: boolean;
  product_features?: ProductFeature[] | null;
  product_options?: ProductOption[] | null;
};

export type MenuPackageItem = {
  quantity: number;
  sort_order: number;
  products: { id: string; name: string; image_url: string | null; price: number } | null;
};

export type MenuPackageView = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  badges: unknown;
  is_special: boolean;
  menu_products?: MenuPackageItem[] | null;
};

export type PlacedOrder = {
  id: string;
  code: string;
  total: number;
  currency: string;
};
