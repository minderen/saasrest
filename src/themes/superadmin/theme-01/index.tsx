import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Megaphone, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useT } from "@/lib/i18n";
import type { LandingSection } from "@/repositories/landing";

import { Hero } from "./Hero";
import { Features, HowItWorks, WhatSection } from "./Features";
import { Plans } from "./Plans";
import { ContactSection, Faq } from "./FaqContact";

export type LandingThemeProps = {
  announcement: { id: string; message: string; link_label: string | null; link_href: string | null } | null;
  sections: LandingSection[];
  features: Array<{ id: string; icon: string | null; title: string; description: string | null; detail_html: string | null }>;
  faqs: Array<{ id: string; question: string; answer: string }>;
  plans: Array<{
    id: string;
    kind: string;
    slug: string;
    name: string;
    tagline: string | null;
    price_monthly: number;
    currency: string;
    features: unknown;
    is_featured: boolean;
  }>;
  brand: Record<string, string>;
  demoSlug: string;
};

const NAV = [
  { href: "#what", key: "nav.about", label: "Platform" },
  { href: "#features", key: "nav.features", label: "Özellikler" },
  { href: "#how", key: "nav.how", label: "Nasıl çalışır" },
  { href: "#plans", key: "nav.plans", label: "Planlar" },
  { href: "#faq", key: "nav.faq", label: "SSS" },
  { href: "#contact", key: "nav.contact", label: "İletişim" },
];

export default function LandingTheme01({
  announcement,
  sections,
  features,
  faqs,
  plans,
  brand,
  demoSlug,
}: LandingThemeProps) {
  const t = useT();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const byKey = useMemo(() => {
    const map = new Map<string, LandingSection>();
    for (const section of sections) map.set(section.key, section);
    return map;
  }, [sections]);

  function selectPlan(slug: string) {
    setSelectedPlan(slug);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background">
      {announcement ? (
        <div className="bg-primary/12 text-center text-sm text-foreground">
          <div className="container-page flex flex-wrap items-center justify-center gap-2 py-2.5">
            <Megaphone className="size-4 text-primary" aria-hidden />
            <span>{announcement.message}</span>
            {announcement.link_href && announcement.link_label ? (
              <a href={announcement.link_href} className="font-semibold text-primary underline-offset-4 hover:underline">
                {announcement.link_label}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <a href="#hero" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <QrCode className="size-5" aria-hidden />
            </span>
            {brand["site_name"] ?? "QR Sofra"}
          </a>
          <nav aria-label="Ana menü" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                {t(item.key, item.label)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">{t("action.login", "Giriş")}</Link>
            </Button>
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <a href="#contact">{t("action.contact", "İletişim")}</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Hero section={byKey.get("hero")} demoSlug={demoSlug} />
        <WhatSection section={byKey.get("what")} />
        <Features section={byKey.get("features")} features={features} />
        <HowItWorks section={byKey.get("how")} />
        <Plans section={byKey.get("plans")} plans={plans} onSelect={selectPlan} />
        <Faq section={byKey.get("faq")} faqs={faqs} />
        <ContactSection section={byKey.get("contact")} selectedPlan={selectedPlan} />
      </main>

      <footer className="border-t border-border/70 py-10">
        <div className="container-page flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand["site_name"] ?? "QR Sofra"}
          </p>
          <p>{brand["tagline"] ?? ""}</p>
        </div>
      </footer>
    </div>
  );
}
