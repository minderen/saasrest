import { Link } from "@tanstack/react-router";

import type { SocialLink } from "@/modules/tenant-site/site-content";
import type { NavigationItem } from "../types";

/** Footer: brand, navigation mirror, socials and the QR menu shortcut. */
export function SiteFooter({
  tenant,
  navigation,
  socials,
  address,
  phone,
  menuLabel,
}: {
  tenant: { name: string; slug: string };
  navigation: NavigationItem[];
  socials: SocialLink[];
  address: string | null;
  phone: string | null;
  menuLabel: string;
}) {
  return (
    <footer className="border-t border-border/70 py-12">
      <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold">{tenant.name}</p>
          {address ? <p className="text-sm text-muted-foreground">{address}</p> : null}
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {phone}
            </a>
          ) : null}
        </div>

        {navigation.length > 0 ? (
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target={item.target ?? undefined}
                rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}

        {socials.length > 0 ? (
          <nav className="flex flex-col gap-2">
            {socials.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {social.label}
              </a>
            ))}
          </nav>
        ) : null}

        <div className="flex flex-col gap-2">
          <Link
            to="/$tenant/menu"
            params={{ tenant: tenant.slug }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {menuLabel}
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {tenant.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
