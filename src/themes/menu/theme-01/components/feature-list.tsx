import { DynamicIcon } from "@/components/shared/dynamic-icon";
import type { ProductFeature } from "@/types/menu";

/** Compact chips shown on the card (only features flagged `show_on_card`). */
export function FeatureChips({ features }: { features: ProductFeature[] }) {
  const visible = features.filter((feature) => feature.show_on_card);
  if (!visible.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {visible.map((feature) => (
        <li
          key={feature.id}
          className="flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground"
        >
          <DynamicIcon name={feature.icon} className="size-3.5 text-primary" />
          <span>{feature.value ? `${feature.label}: ${feature.value}` : feature.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Full feature list used in the detail view: icon rows plus label/value bullets. */
export function FeatureDetailList({
  features,
  title,
}: {
  features: ProductFeature[];
  title: string;
}) {
  if (!features.length) return null;
  const withIcon = features.filter((feature) => feature.icon);
  const rest = features.filter((feature) => !feature.icon);

  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {withIcon.length ? (
        <ul className="mt-3 flex flex-wrap gap-3">
          {withIcon.map((feature) => (
            <li key={feature.id} className="surface-card flex items-center gap-2 px-3 py-2 text-sm">
              <DynamicIcon name={feature.icon} className="size-4 text-primary" />
              <span className="font-medium">{feature.label}</span>
              {feature.value ? <span className="text-muted-foreground">{feature.value}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {rest.length ? (
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {rest.map((feature) => (
            <div key={feature.id} className="surface-card flex items-center justify-between gap-3 p-3 text-sm">
              <dt className="text-muted-foreground">{feature.label}</dt>
              <dd className="font-medium">{feature.value ?? "✓"}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
