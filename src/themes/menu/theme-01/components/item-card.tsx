import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import type { ProductFeature } from "@/types/menu";

import { FeatureChips } from "./feature-list";
import { ItemBadges } from "./item-badges";
import { isProduct, type MenuEntry } from "../types";

export function ItemCard({
  entry,
  labels,
  onOpenDetail,
  onAdd,
}: {
  entry: MenuEntry;
  labels: { menu: string; special: string; add: string; contains: string };
  onOpenDetail: () => void;
  onAdd: () => void;
}) {
  const { kind, item } = entry;
  const features: ProductFeature[] = isProduct(item) ? (item.product_features ?? []) : [];
  const packageItems = kind === "menu" ? (item.menu_products ?? []) : [];

  return (
    <li className="surface-card flex flex-col overflow-hidden">
      <button type="button" className="text-left" onClick={onOpenDetail}>
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
          <div className="absolute left-3 top-3">
            <ItemBadges badges={item.badges} isSpecial={item.is_special} kind={kind} labels={labels} />
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-base font-semibold">{item.name}</h2>
          {item.short_description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.short_description}</p>
          ) : null}
          <FeatureChips features={features} />
          {packageItems.length ? (
            <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
              {labels.contains}: {packageItems.map((row) => `${row.products?.name} × ${row.quantity}`).join(", ")}
            </p>
          ) : null}
        </div>
      </button>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 p-4">
        <span className="text-lg font-semibold">{formatMoney(item.price, item.currency)}</span>
        <Button size="sm" onClick={onAdd}>
          <Plus className="size-4" aria-hidden />
          {labels.add}
        </Button>
      </div>
    </li>
  );
}
