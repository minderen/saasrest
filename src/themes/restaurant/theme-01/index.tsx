import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, QrCode, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { tenantRepository } from "@/repositories/tenant";

import { AboutSection, AwardsSection, BranchesSection, CampaignsSection, PostsSection, type Branch } from "./sections";

type Section = {
  id: string;
  key: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  config: unknown;
};

export type RestaurantThemeProps = {
  tenant: { id: string; name: string; slug: string };
  settings: Record<string, unknown> | null;
  sections: Section[];
  navigation: Array<{ id: string; label: string; href: string; target: string | null }>;
  slides: Array<{
    id: string;
    image_url: string;
    eyebrow: string | null;
    title: string | null;
    description: string | null;
    button_label: string | null;
    button_href: string | null;
  }>;
  awards: Array<{ id: string; title: string; description: string | null; image_url: string | null; detail_html: string | null }>;
  branches: Branch[];
  campaigns: Array<{
    id: string;
    title: string;
    excerpt: string | null;
    description: string | null;
    image_url: string | null;
    badge: string | null;
    starts_at: string | null;
    ends_at: string | null;
  }>;
  posts: Array<{
    id: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    image_url: string | null;
    badge: string | null;
    published_at: string | null;
    view_count: number;
  }>;
};

export default function RestaurantTheme01({
  tenant,
  settings,
  sections,
  navigation,
  slides,
  awards,
  branches,
  campaigns,
  posts,
}: RestaurantThemeProps) {
  const [slide, setSlide] = useState(0);
  const byKey = useMemo(() => new Map(sections.map((section) => [section.key, section])), [sections]);
  const logoUrl = (settings?.["logo_url"] as string | undefined) ?? null;

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const current = slides[slide];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/$tenant" params={{ tenant: tenant.slug }} className="flex items-center gap-2 font-semibold">
            {logoUrl ? (
              <img src={logoUrl} alt={tenant.name} width={36} height={36} className="size-9 rounded-lg object-cover" />
            ) : (
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <UtensilsCrossed className="size-5" aria-hidden />
              </span>
            )}
            {tenant.name}
          </Link>
          <nav aria-label="Site menüsü" className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target={item.target ?? undefined}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button size="sm" asChild>
              <Link to="/$tenant/menu" params={{ tenant: tenant.slug }}>
                <QrCode className="size-4" aria-hidden />
                Menü
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {current ? (
          <section className="relative" id="home">
            <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
              <img
                src={current.image_url}
                alt={current.title ?? tenant.name}
                className="h-full w-full object-cover"
                width={1920}
                height={1080}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
              <div className="container-page absolute inset-x-0 bottom-14">
                <div className="max-w-2xl">
                  {current.eyebrow ? <span className="eyebrow">{current.eyebrow}</span> : null}
                  <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{current.title}</h1>
                  <p className="mt-4 text-base text-muted-foreground">{current.description}</p>
                  {current.button_label && current.button_href ? (
                    <Button size="lg" className="mt-6" asChild>
                      <a href={current.button_href}>{current.button_label}</a>
                    </Button>
                  ) : null}
                </div>
              </div>
              {slides.length > 1 ? (
                <div className="absolute bottom-5 right-5 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="Önceki görsel"
                    onClick={() => setSlide((slide - 1 + slides.length) % slides.length)}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="Sonraki görsel"
                    onClick={() => setSlide((slide + 1) % slides.length)}
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <AboutSection section={byKey.get("about")} />
        <AwardsSection section={byKey.get("awards")} awards={awards} />
        <CampaignsSection section={byKey.get("campaigns")} campaigns={campaigns} />
        <PostsSection
          section={byKey.get("posts")}
          posts={posts}
          onOpen={(postId) => {
            void tenantRepository.registerPostView(postId).catch(() => undefined);
          }}
        />
        <BranchesSection section={byKey.get("branches")} branches={branches} />
      </main>

      <footer className="border-t border-border/70 py-10">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {tenant.name}
          </p>
          <Link to="/$tenant/menu" params={{ tenant: tenant.slug }} className="hover:text-foreground">
            QR Menü
          </Link>
        </div>
      </footer>
    </div>
  );
}
