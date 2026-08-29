import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import type { LandingSection } from "@/repositories/landing.repository";

export function Hero({ section, demoSlug }: { section?: LandingSection | undefined; demoSlug: string }) {
  const t = useT();
  if (!section) return null;
  const config = section.config as { primaryCta?: string };

  return (
    <section className="relative overflow-hidden bg-hero pt-16 pb-24" id="hero">
      <div className="container-page grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="flex flex-col gap-6">
          <span className="eyebrow">{section.eyebrow}</span>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            {section.title}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{section.subtitle}</p>
          {section.body ? <p className="max-w-xl text-sm text-muted-foreground/80">{section.body}</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <a href={config.primaryCta ?? "#plans"}>
                {t("action.getStarted")}
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/$tenant" params={{ tenant: demoSlug }}>
                <PlayCircle className="size-4" aria-hidden />
                {t("action.viewDemo")}
              </Link>
            </Button>
          </div>
        </div>

        {section.media_url ? (
          <div className="relative">
            <div className="surface-card overflow-hidden p-2">
              <img
                src={section.media_url}
                alt={section.title ?? ""}
                width={1600}
                height={912}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 right-6 surface-card grid grid-cols-3 gap-4 p-4 text-center">
              {[
                { label: "Marka", value: "∞" },
                { label: "Şube", value: "∞" },
                { label: "Dil", value: "∞" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold text-primary">{stat.value}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
