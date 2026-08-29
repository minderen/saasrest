import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Lightbox } from "@/components/shared/lightbox";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/modules/cart/cart-context";
import { orderService } from "@/services/order-service";

type Category = { id: string; name: string; slug: string; description: string | null; image_url: string | null };

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  badges: unknown;
  is_special: boolean;
  product_features?: Array<{ id: string; label: string; value: string | null; show_on_card: boolean }>;
};

type Menu = {
  id: string;
  category_id: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  badges: unknown;
  is_special: boolean;
  menu_products?: Array<{ quantity: number; products: { id: string; name: string; image_url: string | null } | null }>;
};

export type MenuThemeProps = {
  tenant: { id: string; name: string; slug: string };
  branchId: string | null;
  tableNo: string | null;
  categories: Category[];
  products: Product[];
  menus: Menu[];
};

/** Badges may be stored as plain strings or as `{ label, color }` objects. */
function badgeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (entry && typeof entry === "object" && "label" in entry) return [String((entry as { label: unknown }).label)];
    return [];
  });
}

export default function MenuTheme01({ tenant, branchId, tableNo, categories, products, menus }: MenuThemeProps) {
  const cart = useCart();
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? "");
  const [detail, setDetail] = useState<{ kind: "product" | "menu"; id: string } | null>(null);
  const [pending, setPending] = useState(false);

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, Array<{ kind: "product" | "menu"; item: Product | Menu }>>();
    for (const category of categories) map.set(category.id, []);
    for (const product of products)
      if (product.category_id) map.get(product.category_id)?.push({ kind: "product", item: product });
    for (const menu of menus) if (menu.category_id) map.get(menu.category_id)?.push({ kind: "menu", item: menu });
    return map;
  }, [categories, products, menus]);

  const detailItem = useMemo(() => {
    if (!detail) return null;
    return detail.kind === "product"
      ? (products.find((product) => product.id === detail.id) ?? null)
      : (menus.find((menu) => menu.id === detail.id) ?? null);
  }, [detail, products, menus]);

  const currency = products[0]?.currency ?? menus[0]?.currency ?? "TRY";

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    try {
      const order = await orderService.place({
        tenant_id: tenant.id,
        branch_id: branchId,
        table_no: tableNo,
        customer_name: String(formData.get("name") ?? ""),
        customer_phone: String(formData.get("phone") ?? ""),
        note: String(formData.get("note") ?? "") || null,
        items: cart.lines.map((line) => ({
          item_name: line.item_name,
          unit_price: line.unit_price,
          quantity: line.quantity,
          product_id: line.product_id,
          menu_id: line.menu_id,
        })),
      });
      cart.clear();
      toast.success(`Siparişiniz alındı · ${order.code}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sipariş gönderilemedi");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <div>
            <Link to="/$tenant" params={{ tenant: tenant.slug }} className="text-sm text-muted-foreground hover:text-foreground">
              {tenant.name}
            </Link>
            <p className="text-base font-semibold">Dijital Menü{tableNo ? ` · Masa ${tableNo}` : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" className="relative">
                  <ShoppingBag className="size-4" aria-hidden />
                  Sepet
                  {cart.count > 0 ? (
                    <span className="ml-1 rounded-full bg-primary-foreground px-2 text-xs font-semibold text-primary">
                      {cart.count}
                    </span>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Sepetiniz</SheetTitle>
                </SheetHeader>
                {cart.lines.length === 0 ? (
                  <p className="px-4 text-sm text-muted-foreground">Sepetiniz henüz boş.</p>
                ) : (
                  <>
                    <ul className="flex flex-col gap-3 px-4">
                      {cart.lines.map((line) => (
                        <li key={line.key} className="surface-card flex items-center gap-3 p-3">
                          {line.image_url ? (
                            <img
                              src={line.image_url}
                              alt={line.item_name}
                              width={64}
                              height={64}
                              loading="lazy"
                              className="size-16 rounded-lg object-cover"
                            />
                          ) : null}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{line.item_name}</p>
                            <p className="text-sm text-muted-foreground">{formatMoney(line.unit_price, currency)}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="secondary"
                                className="size-7"
                                aria-label="Azalt"
                                onClick={() => cart.setQuantity(line.key, line.quantity - 1)}
                              >
                                −
                              </Button>
                              <span className="w-6 text-center text-sm">{line.quantity}</span>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="size-7"
                                aria-label="Arttır"
                                onClick={() => cart.setQuantity(line.key, line.quantity + 1)}
                              >
                                +
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7"
                                aria-label="Kaldır"
                                onClick={() => cart.remove(line.key)}
                              >
                                <Trash2 className="size-4" aria-hidden />
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <form onSubmit={submitOrder} className="flex flex-col gap-3 px-4">
                      <div className="grid gap-2">
                        <Label htmlFor="order-name">Ad Soyad</Label>
                        <Input id="order-name" name="name" required autoComplete="name" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="order-phone">Telefon</Label>
                        <Input id="order-phone" name="phone" required autoComplete="tel" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="order-note">Not</Label>
                        <Textarea id="order-note" name="note" rows={3} />
                      </div>
                      <p className="flex items-center justify-between text-base font-semibold">
                        <span>Toplam</span>
                        <span>{formatMoney(cart.total, currency)}</span>
                      </p>
                      <Button type="submit" disabled={pending}>
                        Siparişi gönder
                      </Button>
                    </form>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <nav aria-label="Kategoriler" className="border-t border-border/60">
          <div className="container-page flex gap-2 overflow-x-auto py-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
                  activeCategory === category.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="container-page py-8">
        {categories
          .filter((category) => category.id === activeCategory)
          .map((category) => (
            <section key={category.id} className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-semibold">{category.name}</h1>
                {category.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                ) : null}
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(itemsByCategory.get(category.id) ?? []).map(({ kind, item }) => (
                  <li key={`${kind}-${item.id}`} className="surface-card flex flex-col overflow-hidden">
                    <button type="button" className="text-left" onClick={() => setDetail({ kind, id: item.id })}>
                      <div className="relative">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            width={800}
                            height={600}
                            loading="lazy"
                            className="h-44 w-full object-cover"
                          />
                        ) : null}
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          {kind === "menu" ? (
                            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                              Menü
                            </span>
                          ) : null}
                          {badgeList(item.badges).map((badge) => (
                            <span
                              key={badge}
                              className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
                            >
                              {badge}
                            </span>
                          ))}
                          {item.is_special ? (
                            <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
                              <Sparkles className="size-3" aria-hidden /> Özel
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="p-4">
                        <h2 className="text-base font-semibold">{item.name}</h2>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.short_description}</p>
                      </div>
                    </button>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 p-4">
                      <span className="text-lg font-semibold">{formatMoney(item.price, item.currency)}</span>
                      <Button
                        size="sm"
                        onClick={() =>
                          cart.add({
                            key: `${kind}-${item.id}`,
                            item_name: item.name,
                            unit_price: Number(item.price),
                            image_url: item.image_url,
                            product_id: kind === "product" ? item.id : null,
                            menu_id: kind === "menu" ? item.id : null,
                          })
                        }
                      >
                        <Plus className="size-4" aria-hidden />
                        Ekle
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </main>

      <Lightbox
        open={Boolean(detailItem)}
        onOpenChange={() => setDetail(null)}
        title={detailItem?.name ?? null}
        description={detailItem?.short_description ?? null}
        size="xl"
      >
        {detailItem?.image_url ? (
          <img
            src={detailItem.image_url}
            alt={detailItem.name}
            className="w-full rounded-xl object-cover"
            loading="lazy"
          />
        ) : null}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{detailItem?.description}</p>
        {"product_features" in (detailItem ?? {}) && (detailItem as Product)?.product_features?.length ? (
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            {(detailItem as Product).product_features?.map((feature) => (
              <div key={feature.id} className="surface-card flex items-center justify-between p-3 text-sm">
                <dt className="text-muted-foreground">{feature.label}</dt>
                <dd className="font-medium">{feature.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {"menu_products" in (detailItem ?? {}) && (detailItem as Menu)?.menu_products?.length ? (
          <ul className="mt-4 flex flex-col gap-2">
            {(detailItem as Menu).menu_products?.map((row) => (
              <li key={row.products?.id} className="surface-card flex items-center gap-3 p-3 text-sm">
                {row.products?.image_url ? (
                  <img
                    src={row.products.image_url}
                    alt={row.products.name}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="size-12 rounded-lg object-cover"
                  />
                ) : null}
                <span>
                  {row.products?.name} × {row.quantity}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {detailItem ? (
          <Button
            className="mt-6 w-full"
            onClick={() => {
              const kind = detail?.kind ?? "product";
              cart.add({
                key: `${kind}-${detailItem.id}`,
                item_name: detailItem.name,
                unit_price: Number(detailItem.price),
                image_url: detailItem.image_url,
                product_id: kind === "product" ? detailItem.id : null,
                menu_id: kind === "menu" ? detailItem.id : null,
              });
              setDetail(null);
            }}
          >
            Sepete ekle · {formatMoney(detailItem.price, detailItem.currency)}
          </Button>
        ) : null}
      </Lightbox>
    </div>
  );
}
