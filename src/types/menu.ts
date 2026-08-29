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
