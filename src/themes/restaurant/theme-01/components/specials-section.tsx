import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatCurrency } from "@/lib/format";
import type { Section, SpecialItem } from "../types";

function badgeList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === "string");
  return [];
}

/** Special products and menus, plus a link to the full digital menu. */
export function SpecialsSection({
  section,
  specials,
  tenantSlug,
  menuLabel,
}: {
  section?: Section | undefined;
  specials: SpecialItem[];
  tenantSlug: string;
  menuLabel: string;
}) {
  if (!section || specials.length === 0) return null;

  return (
    <section className="section-y" id="specials">
      <div className="container-page flex flex-col gap-10">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          action={
            <Button variant="secondary" size="sm" asChild>
              <Link to="/$tenant/menu" params={{ tenant: tenantSlug }}>
                {menuLabel}
              </Link>
            </Button>
          }
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {specials.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="surface-card overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="h-40 w-full object-cover"
                />
              ) : null}
              <div className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap gap-1.5">
                  {badgeList(item.badges).map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-base font-semibold">{item.name}</h3>
                {item.short_description ? (
                  <p className="text-sm text-muted-foreground">{item.short_description}</p>
                ) : null}
                <p className="mt-1 text-lg font-semibold text-primary">
                  {formatCurrency(item.price, item.currency)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
