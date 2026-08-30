import { ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/format";
import type { CartLine } from "@/types/menu";

export type CartSheetLabels = {
  cart: string;
  yourCart: string;
  empty: string;
  name: string;
  phone: string;
  note: string;
  total: string;
  submit: string;
  decrease: string;
  increase: string;
  remove: string;
  priceNotice: string;
};

export function CartSheet({
  lines,
  count,
  total,
  currency,
  pending,
  labels,
  onQuantityChange,
  onRemove,
  onSubmit,
}: {
  lines: CartLine[];
  count: number;
  total: number;
  currency: string;
  pending: boolean;
  labels: CartSheetLabels;
  onQuantityChange: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="relative">
          <ShoppingBag className="size-4" aria-hidden />
          {labels.cart}
          {count > 0 ? (
            <span className="ml-1 rounded-full bg-primary-foreground px-2 text-xs font-semibold text-primary">
              {count}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{labels.yourCart}</SheetTitle>
        </SheetHeader>
        {lines.length === 0 ? (
          <p className="px-4 text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <>
            <ul className="flex flex-col gap-3 px-4">
              {lines.map((line) => (
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
                        aria-label={labels.decrease}
                        onClick={() => onQuantityChange(line.key, line.quantity - 1)}
                      >
                        −
                      </Button>
                      <span className="w-6 text-center text-sm">{line.quantity}</span>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="size-7"
                        aria-label={labels.increase}
                        onClick={() => onQuantityChange(line.key, line.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        aria-label={labels.remove}
                        onClick={() => onRemove(line.key)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <form onSubmit={onSubmit} className="flex flex-col gap-3 px-4 pb-6">
              <div className="grid gap-2">
                <Label htmlFor="order-name">{labels.name}</Label>
                <Input id="order-name" name="name" required autoComplete="name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order-phone">{labels.phone}</Label>
                <Input id="order-phone" name="phone" required autoComplete="tel" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order-note">{labels.note}</Label>
                <Textarea id="order-note" name="note" rows={3} />
              </div>
              <p className="flex items-center justify-between text-base font-semibold">
                <span>{labels.total}</span>
                <span>{formatMoney(total, currency)}</span>
              </p>
              <p className="text-xs text-muted-foreground">{labels.priceNotice}</p>
              <Button type="submit" disabled={pending}>
                {labels.submit}
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
