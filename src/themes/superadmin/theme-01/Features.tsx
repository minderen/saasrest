import { useState } from "react";
import {
  Layers,
  Shield,
  QrCode,
  Palette,
  Puzzle,
  Languages,
  Store,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Lightbox } from "@/components/shared/lightbox";
import type { LandingSection } from "@/repositories/landing";

const ICONS: Record<string, LucideIcon> = {
  layers: Layers,
  shield: Shield,
  "qr-code": QrCode,
  palette: Palette,
  puzzle: Puzzle,
  languages: Languages,
  store: Store,
  search: Search,
};

type Feature = {
  id: string;
  icon: string | null;
  title: string;
  description: string | null;
  detail_html: string | null;
};

export function WhatSection({ section }: { section?: LandingSection }) {
  if (!section) return null;
  const badges = ((section.config as { badges?: string[] }).badges ?? []) as string[];

  return (
    <section className="section-y" id="what">
      <div className="container-page flex flex-col items-center gap-8">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <ul className="flex flex-wrap justify-center gap-3">
          {badges.map((badge) => (
            <li
              key={badge}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted-foreground"
            >
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              {badge}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Features({ section, features }: { section?: LandingSection | undefined; features: Feature[] }) {
  const [active, setActive] = useState<Feature | null>(null);
  if (!section) return null;

  return (
    <section className="section-y" id="features">
      <div className="container-page flex flex-col gap-12">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = ICONS[feature.icon ?? ""] ?? Sparkles;
            return (
              <li key={feature.id}>
                <button
                  type="button"
                  onClick={() => (feature.detail_html ? setActive(feature) : undefined)}
                  className="surface-card h-full w-full p-6 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Lightbox open={Boolean(active)} onOpenChange={() => setActive(null)} title={active?.title ?? null}>
        {active?.detail_html ? (
          <div
            className="prose-sm text-muted-foreground"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: active.detail_html }}
          />
        ) : null}
      </Lightbox>
    </section>
  );
}

export function HowItWorks({ section }: { section?: LandingSection }) {
  if (!section) return null;
  const steps = ((section.config as { steps?: Array<{ title: string; text: string }> }).steps ?? []) as Array<{
    title: string;
    text: string;
  }>;

  return (
    <section className="section-y bg-surface/40" id="how">
      <div className="container-page flex flex-col gap-12">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="surface-card relative p-6">
              <span className="text-4xl font-semibold text-primary/30">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
