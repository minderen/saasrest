import { useQuery } from "@tanstack/react-query";

import { Lightbox } from "@/components/shared/lightbox";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { menuRepository } from "@/repositories/menu.repository";
import type { ProductFeature } from "@/types/menu";

import { FeatureDetailList } from "./feature-list";
import { ItemBadges } from "./item-badges";
import { isProduct, type MenuEntry } from "../types";

export type ItemDetailLabels = {
  menu: string;
  special: string;
  features: string;
  contents: string;
  options: string;
  inMenus: string;
  takeWithMenu: string;
  addToCart: string;
};

export function ItemDetail({
  tenantId,
  entry,
  labels,
  onClose,
  onAdd,
}: {
  tenantId: string;
  entry: MenuEntry | null;
  labels: ItemDetailLabels;
  onClose: () => void;
  onAdd: (entry: MenuEntry) => void;
}) {
  const item = entry?.item ?? null;
  const productId = entry?.kind === "product" ? entry.item.id : null;

  const relatedMenus = useQuery({
    queryKey: ["menu", "product-menus", tenantId, productId],
    enabled: Boolean(productId),
    queryFn: () => menuRepository.menusForProduct(tenantId, productId as string),
  });

  const features: ProductFeature[] = item && isProduct(item) ? (item.product_features ?? []) : [];
  const options = item && isProduct(item) ? (item.product_options ?? []) : [];
  const packageItems = entry?.kind === "menu" ? (entry.item.menu_products ?? []) : [];

  return (
    <Lightbox
      open={Boolean(entry)}
      onOpenChange={onClose}
      title={item?.name ?? null}
      description={item?.short_description ?? null}
      size="xl"
    >
      {item && entry ? (
        <>
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full rounded-xl object-cover" loading="lazy" />
          ) : null}
          <div className="mt-4">
            <ItemBadges badges={item.badges} isSpecial={item.is_special} kind={entry.kind} labels={labels} />
          </div>
          {item.description ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          ) : null}

          <FeatureDetailList features={features} title={labels.features} />

          {options.length ? (
            <section className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.options}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {options.map((option) => (
                  <li key={option.id} className="surface-card flex items-center justify-between p-3 text-sm">
                    <span>
                      <span className="text-muted-foreground">{option.group_label} · </span>
                      {option.name}
                    </span>
                    {option.price_delta ? (
                      <span className="font-medium">+{formatMoney(option.price_delta, item.currency)}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {packageItems.length ? (
            <section className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.contents}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {packageItems.map((row) => (
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
            </section>
          ) : null}

          {productId && (relatedMenus.data?.length ?? 0) > 0 ? (
            <section className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.inMenus}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {relatedMenus.data?.map((menu) => (
                  <li key={menu.id} className="surface-card flex items-center gap-3 p-3">
                    {menu.image_url ? (
                      <img
                        src={menu.image_url}
                        alt={menu.name}
                        width={48}
                        height={48}
                        loading="lazy"
                        className="size-12 rounded-lg object-cover"
                      />
                    ) : null}
                    <span className="flex-1 text-sm font-medium">{menu.name}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        onAdd({
                          kind: "menu",
                          item: {
                            id: menu.id,
                            category_id: null,
                            name: menu.name,
                            slug: menu.slug,
                            short_description: null,
                            description: null,
                            price: menu.price,
                            currency: menu.currency,
                            image_url: menu.image_url,
                            badges: [],
                            is_special: false,
                          },
                        });
                      }}
                    >
                      {labels.takeWithMenu} · {formatMoney(menu.price, menu.currency)}
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <Button className="mt-6 w-full" onClick={() => onAdd(entry)}>
            {labels.addToCart} · {formatMoney(item.price, item.currency)}
          </Button>
        </>
      ) : null}
    </Lightbox>
  );
}
