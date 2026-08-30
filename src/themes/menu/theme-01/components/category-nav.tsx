import type { MenuCategoryView } from "@/types/menu";

export function CategoryNav({
  categories,
  activeId,
  onSelect,
  label,
}: {
  categories: MenuCategoryView[];
  activeId: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  if (!categories.length) return null;
  return (
    <nav aria-label={label} className="border-t border-border/60">
      <div className="container-page flex gap-2 overflow-x-auto py-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            aria-current={activeId === category.id ? "true" : undefined}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
              activeId === category.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
