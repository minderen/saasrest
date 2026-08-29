import { useState } from "react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Lightbox } from "@/components/shared/lightbox";
import { cn } from "@/lib/utils";
import type { Topbar, TopbarItem } from "@/modules/tenant-site/site-content";

const alignClass = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
} as const;

/**
 * Database-driven topbar: up to two rows × three columns, each column holding
 * ordered items (text, link, button, modal trigger, language switcher).
 */
export function SiteTopbar({ topbar }: { topbar: Topbar }) {
  const [modal, setModal] = useState<TopbarItem | null>(null);

  if (!topbar.enabled || topbar.rows.length === 0) return null;

  return (
    <div className="border-b border-border/60 bg-surface/60 text-xs">
      <div className="container-page flex flex-col divide-y divide-border/40">
        {topbar.rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-1 items-center gap-2 py-2 sm:grid-cols-3"
          >
            {row.columns.map((column, index) => (
              <div
                key={`${row.id}-${index}`}
                className={cn("flex flex-wrap items-center gap-2", alignClass[column.align])}
              >
                {column.items.map((item) => (
                  <TopbarItemView key={item.id} item={item} onOpenModal={setModal} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <Lightbox
        open={Boolean(modal)}
        onOpenChange={() => setModal(null)}
        title={modal?.modal_title ?? modal?.label ?? null}
      >
        {modal?.modal_html ? (
          <div
            className="text-sm leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: modal.modal_html }}
          />
        ) : null}
      </Lightbox>
    </div>
  );
}

function TopbarItemView({
  item,
  onOpenModal,
}: {
  item: TopbarItem;
  onOpenModal: (item: TopbarItem) => void;
}) {
  if (item.type === "language") return <LanguageSwitcher />;

  if (item.type === "text") {
    return <span className="text-muted-foreground">{item.label}</span>;
  }

  if (item.type === "modal") {
    return (
      <Button size="sm" variant={item.variant} onClick={() => onOpenModal(item)}>
        {item.label}
      </Button>
    );
  }

  if (item.type === "link") {
    return (
      <a
        href={item.href ?? "#"}
        target={item.target}
        rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
        className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {item.label}
      </a>
    );
  }

  return (
    <Button size="sm" variant={item.variant} asChild>
      <a
        href={item.href ?? "#"}
        target={item.target}
        rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
      >
        {item.label}
      </a>
    </Button>
  );
}
