import { useMemo } from "react";

import { useT } from "@/i18n";
import { tenantRepository } from "@/repositories";
import {
  normalizeHeaderButtons,
  normalizeSocials,
  normalizeTopbar,
} from "@/modules/tenant-site/site-content";

import { SiteTopbar } from "./components/topbar";
import { SiteHeader } from "./components/site-header";
import { HeroSlider } from "./components/hero-slider";
import { SpecialsSection } from "./components/specials-section";
import { ContactSection } from "./components/contact-section";
import { SiteFooter } from "./components/site-footer";
import {
  AboutSection,
  AwardsSection,
  BranchesSection,
  CampaignsSection,
  PostsSection,
} from "./sections";
import type { RestaurantThemeProps } from "./types";

export type { RestaurantThemeProps } from "./types";

/**
 * Anadolu (theme-01): one-page restaurant website composed of small section
 * components. Every piece of copy comes from the tenant's database records.
 */
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
  specials,
}: RestaurantThemeProps) {
  const t = useT();
  const byKey = useMemo(
    () => new Map(sections.map((section) => [section.key, section])),
    [sections],
  );

  const topbar = useMemo(() => normalizeTopbar(settings?.["topbar"]), [settings]);
  const headerActions = useMemo(
    () => normalizeHeaderButtons(settings?.["header_buttons"]),
    [settings],
  );
  const socials = useMemo(() => normalizeSocials(settings?.["socials"]), [settings]);

  const str = (key: string) => (typeof settings?.[key] === "string" ? (settings[key] as string) : null);
  const menuLabel = t("site.menu", "Menü");

  return (
    <div className="min-h-screen bg-background">
      <SiteTopbar topbar={topbar} />
      <SiteHeader
        tenant={tenant}
        logoUrl={str("logo_url")}
        navigation={navigation}
        actions={headerActions}
        menuLabel={menuLabel}
      />

      <main>
        <HeroSlider
          slides={slides}
          fallbackTitle={tenant.name}
          prevLabel={t("site.slider.prev", "Önceki görsel")}
          nextLabel={t("site.slider.next", "Sonraki görsel")}
        />

        <AboutSection section={byKey.get("about")} />
        <AwardsSection section={byKey.get("awards")} awards={awards} />
        <SpecialsSection
          section={byKey.get("specials")}
          specials={specials}
          tenantSlug={tenant.slug}
          menuLabel={menuLabel}
        />
        <CampaignsSection section={byKey.get("campaigns")} campaigns={campaigns} />
        <PostsSection
          section={byKey.get("posts")}
          posts={posts}
          onOpen={(postId) => {
            void tenantRepository.registerPostView(postId).catch(() => undefined);
          }}
        />
        <BranchesSection section={byKey.get("branches")} branches={branches} />
        <ContactSection
          section={byKey.get("contact")}
          mapTitle={tenant.name}
          details={{
            phone: str("contact_phone"),
            whatsapp: str("whatsapp"),
            email: str("contact_email"),
            address: str("address"),
            mapEmbedUrl: str("map_embed_url"),
            socials,
          }}
        />
      </main>

      <SiteFooter
        tenant={tenant}
        navigation={navigation}
        socials={socials}
        address={str("address")}
        phone={str("contact_phone")}
        menuLabel={menuLabel}
      />
    </div>
  );
}
