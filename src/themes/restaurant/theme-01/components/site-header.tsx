import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Lightbox } from "@/components/shared/lightbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { HeaderButton } from "@/modules/tenant-site/site-content";
import type { NavigationItem } from "../types";

/** Logo + navigation + up to two database-defined action buttons. */
export function SiteHeader({
  tenant,
  logoUrl,
  navigation,
  actions,
  menuLabel,
}: {
  tenant: { name: string; slug: string };
  logoUrl: string | null;
  navigation: NavigationItem[];
  actions: HeaderButton[];
  menuLabel: string;
}) {
  const [modal, setModal] = useState<HeaderButton | null>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          to="/$tenant"
          params={{ tenant: tenant.slug }}
          className="flex items-center gap-2 font-semibold"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={tenant.name}
              width={36}
              height={36}
              className="size-9 rounded-lg object-cover"
            />
          ) : (
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <UtensilsCrossed className="size-5" aria-hidden />
            </span>
          )}
          {tenant.name}
        </Link>

        <nav aria-label={tenant.name} className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target={item.target ?? undefined}
              rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {actions.length === 0 ? (
            <Button size="sm" asChild>
              <Link to="/$tenant/menu" params={{ tenant: tenant.slug }}>
                {menuLabel}
              </Link>
            </Button>
          ) : (
            actions.map((action) =>
              action.type === "modal" ? (
                <Button
                  key={action.id}
                  size="sm"
                  variant={action.variant}
                  className="hidden sm:inline-flex"
                  onClick={() => setModal(action)}
                >
                  {action.label}
                </Button>
              ) : (
                <Button
                  key={action.id}
                  size="sm"
                  variant={action.variant}
                  className="hidden sm:inline-flex"
                  asChild
                >
                  <a
                    href={action.href ?? "#"}
                    target={action.target}
                    rel={action.target === "_blank" ? "noreferrer noopener" : undefined}
                  >
                    {action.label}
                  </a>
                </Button>
              ),
            )
          )}

          {navigation.length > 0 ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="lg:hidden" aria-label={tenant.name}>
                  <Menu className="size-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>{tenant.name}</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {navigation.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      target={item.target ?? undefined}
                      rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
                      className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  ))}
                  {actions.map((action) => (
                    <a
                      key={action.id}
                      href={action.href ?? "#"}
                      target={action.target}
                      rel={action.target === "_blank" ? "noreferrer noopener" : undefined}
                      className="rounded-md px-3 py-2 text-sm font-medium text-foreground"
                    >
                      {action.label}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
      </div>

      <Lightbox
        open={Boolean(modal)}
        onOpenChange={() => setModal(null)}
        title={modal?.modal_title ?? null}
      >
        {modal?.modal_html ? (
          <div
            className="text-sm leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: modal.modal_html }}
          />
        ) : null}
      </Lightbox>
    </header>
  );
}
