import {
  Award,
  Beef,
  Coffee,
  Croissant,
  Drumstick,
  Flame,
  IceCream,
  Leaf,
  Milk,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Sparkles,
  Star,
  Timer,
  Utensils,
  Wheat,
  Wine,
  type LucideIcon,
} from "lucide-react";

/** Curated icon set that tenants can reference by name from the panel. */
const ICONS: Record<string, LucideIcon> = {
  award: Award,
  beef: Beef,
  coffee: Coffee,
  croissant: Croissant,
  drumstick: Drumstick,
  flame: Flame,
  "ice-cream": IceCream,
  leaf: Leaf,
  milk: Milk,
  pizza: Pizza,
  salad: Salad,
  sandwich: Sandwich,
  soup: Soup,
  sparkles: Sparkles,
  star: Star,
  timer: Timer,
  utensils: Utensils,
  wheat: Wheat,
  wine: Wine,
};

export const dynamicIconNames = Object.keys(ICONS);

export function DynamicIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = name ? ICONS[name.trim().toLowerCase()] : undefined;
  if (!Icon) return null;
  return <Icon className={className} aria-hidden />;
}
