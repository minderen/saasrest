import { Sparkles } from "lucide-react";

import { badgeList } from "../types";

export function ItemBadges({
  badges,
  isSpecial,
  kind,
  labels,
}: {
  badges: unknown;
  isSpecial: boolean;
  kind: "product" | "menu";
  labels: { menu: string; special: string };
}) {
  const list = badgeList(badges);
  if (!list.length && !isSpecial && kind !== "menu") return null;

  return (
    <div className="flex flex-wrap gap-2">
      {kind === "menu" ? (
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
          {labels.menu}
        </span>
      ) : null}
      {list.map((badge) => (
        <span
          key={badge}
          className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
        >
          {badge}
        </span>
      ))}
      {isSpecial ? (
        <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
          <Sparkles className="size-3" aria-hidden /> {labels.special}
        </span>
      ) : null}
    </div>
  );
}
