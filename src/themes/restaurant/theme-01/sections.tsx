import { useState } from "react";
import { Award, Clock, MapPin, Navigation, Phone, Eye } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Lightbox } from "@/components/shared/lightbox";
import { Button } from "@/components/ui/button";
import { formatDate, isOngoing } from "@/lib/format";

type Section = {
  id: string;
  key: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  config: unknown;
};

export type Branch = {
  id: string;
  name: string;
  cover_image_url: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  directions_url: string | null;
  opening_hours: unknown;
};

export function AboutSection({ section }: { section?: Section | undefined }) {
  if (!section) return null;
  const config = (section.config ?? {}) as { image?: string; stats?: Array<{ label: string; value: string }> };
  return (
    <section className="section-y" id="about">
      <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
        {config.image ? (
          <img
            src={config.image}
            alt={section.title ?? ""}
            width={1200}
            height={800}
            loading="lazy"
            className="h-full w-full rounded-2xl border border-border object-cover"
          />
        ) : null}
        <div className="flex flex-col gap-6">
          <SectionHeading align="left" eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
          {section.body ? <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p> : null}
          {config.stats ? (
            <dl className="grid grid-cols-3 gap-4">
              {config.stats.map((stat) => (
                <div key={stat.label} className="surface-card p-4 text-center">
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-primary">{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function AwardsSection({
  section,
  awards,
}: {
  section?: Section | undefined;
  awards: Array<{ id: string; title: string; description: string | null; image_url: string | null; detail_html: string | null }>;
}) {
  const [active, setActive] = useState<(typeof awards)[number] | null>(null);
  if (!section || awards.length === 0) return null;

  return (
    <section className="section-y bg-surface/40" id="awards">
      <div className="container-page flex flex-col gap-10">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {awards.map((award) => (
            <li key={award.id}>
              <button
                type="button"
                onClick={() => setActive(award)}
                className="surface-card h-full w-full p-6 text-left transition-colors hover:border-primary/40"
              >
                <Award className="size-6 text-primary" aria-hidden />
                <h3 className="mt-3 text-base font-semibold">{award.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{award.description}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Lightbox open={Boolean(active)} onOpenChange={() => setActive(null)} title={active?.title ?? null}>
        {active?.image_url ? (
          <img src={active.image_url} alt={active.title} className="w-full rounded-xl object-cover" loading="lazy" />
        ) : null}
        {active?.detail_html ? (
          <div className="mt-4 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: active.detail_html }} />
        ) : null}
      </Lightbox>
    </section>
  );
}

export function BranchesSection({ section, branches }: { section?: Section | undefined; branches: Branch[] }) {
  if (!section || branches.length === 0) return null;

  return (
    <section className="section-y" id="branches">
      <div className="container-page flex flex-col gap-10">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <ul className="grid gap-6 md:grid-cols-2">
          {branches.map((branch) => {
            const hours = (branch.opening_hours ?? {}) as Record<string, string>;
            return (
              <li key={branch.id} className="surface-card overflow-hidden">
                {branch.cover_image_url ? (
                  <img
                    src={branch.cover_image_url}
                    alt={branch.name}
                    width={1200}
                    height={700}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />
                ) : null}
                <div className="flex flex-col gap-3 p-6">
                  <h3 className="text-lg font-semibold">{branch.name}</h3>
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {branch.address}
                    {branch.city ? `, ${branch.city}` : ""}
                  </p>
                  {Object.keys(hours).length ? (
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {Object.entries(hours)
                        .map(([day, value]) => `${day}: ${value}`)
                        .join(" · ")}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {branch.phone ? (
                      <Button size="sm" variant="secondary" asChild>
                        <a href={`tel:${branch.phone.replace(/\s/g, "")}`}>
                          <Phone className="size-4" aria-hidden />
                          Ara
                        </a>
                      </Button>
                    ) : null}
                    {branch.directions_url ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={branch.directions_url} target="_blank" rel="noreferrer noopener">
                          <Navigation className="size-4" aria-hidden />
                          Yol tarifi
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function CampaignsSection({
  section,
  campaigns,
}: {
  section?: Section | undefined;
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
}) {
  const [active, setActive] = useState<(typeof campaigns)[number] | null>(null);
  if (!section || campaigns.length === 0) return null;

  return (
    <section className="section-y bg-surface/40" id="campaigns">
      <div className="container-page flex flex-col gap-10">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <ul className="grid gap-5 md:grid-cols-3">
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <button
                type="button"
                onClick={() => setActive(campaign)}
                className="surface-card h-full w-full overflow-hidden text-left transition-colors hover:border-primary/40"
              >
                <div className="relative">
                  {campaign.image_url ? (
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      width={900}
                      height={600}
                      loading="lazy"
                      className="h-44 w-full object-cover"
                    />
                  ) : null}
                  {campaign.badge ? (
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {campaign.badge}
                    </span>
                  ) : null}
                  {!isOngoing(campaign.starts_at, campaign.ends_at) ? (
                    <span className="absolute right-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                      Süresi doldu
                    </span>
                  ) : null}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold">{campaign.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{campaign.excerpt}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Lightbox open={Boolean(active)} onOpenChange={() => setActive(null)} title={active?.title ?? null} size="xl">
        {active?.image_url ? (
          <img src={active.image_url} alt={active.title} className="w-full rounded-xl object-cover" loading="lazy" />
        ) : null}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{active?.description ?? active?.excerpt}</p>
        {active?.ends_at ? (
          <p className="mt-3 text-xs text-muted-foreground">Bitiş: {formatDate(active.ends_at)}</p>
        ) : null}
      </Lightbox>
    </section>
  );
}

export function PostsSection({
  section,
  posts,
  onOpen,
}: {
  section?: Section | undefined;
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
  onOpen: (postId: string) => void;
}) {
  const [active, setActive] = useState<(typeof posts)[number] | null>(null);
  if (!section || posts.length === 0) return null;

  return (
    <section className="section-y" id="posts">
      <div className="container-page flex flex-col gap-10">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <ul className="grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <button
                type="button"
                onClick={() => {
                  setActive(post);
                  onOpen(post.id);
                }}
                className="surface-card h-full w-full overflow-hidden text-left transition-colors hover:border-primary/40"
              >
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    width={900}
                    height={600}
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                ) : null}
                <div className="p-5">
                  <h3 className="text-base font-semibold">{post.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  <p className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDate(post.published_at)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="size-3.5" aria-hidden />
                      {post.view_count}
                    </span>
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Lightbox open={Boolean(active)} onOpenChange={() => setActive(null)} title={active?.title ?? null} size="xl">
        {active?.image_url ? (
          <img src={active.image_url} alt={active.title} className="w-full rounded-xl object-cover" loading="lazy" />
        ) : null}
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{active?.content}</p>
      </Lightbox>
    </section>
  );
}
