import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import type { SocialLink } from "@/modules/tenant-site/site-content";
import type { Section } from "../types";

export type ContactDetails = {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  mapEmbedUrl: string | null;
  socials: SocialLink[];
};

/** Contact block: phone, WhatsApp, e-mail, address, map and social links. */
export function ContactSection({
  section,
  details,
  mapTitle,
}: {
  section?: Section | undefined;
  details: ContactDetails;
  mapTitle: string;
}) {
  const hasContact =
    details.phone ||
    details.whatsapp ||
    details.email ||
    details.address ||
    details.mapEmbedUrl ||
    details.socials.length > 0;
  if (!hasContact) return null;

  return (
    <section className="section-y bg-surface/40" id="contact">
      <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <SectionHeading
            align="left"
            eyebrow={section?.eyebrow ?? null}
            title={section?.title ?? null}
            subtitle={section?.subtitle ?? null}
          />
          {section?.body ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          ) : null}

          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            {details.address ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{details.address}</span>
              </li>
            ) : null}
            {details.phone ? (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <a href={`tel:${details.phone.replace(/\s/g, "")}`} className="hover:text-foreground">
                  {details.phone}
                </a>
              </li>
            ) : null}
            {details.whatsapp ? (
              <li className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <a
                  href={`https://wa.me/${details.whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-foreground"
                >
                  {details.whatsapp}
                </a>
              </li>
            ) : null}
            {details.email ? (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <a href={`mailto:${details.email}`} className="hover:text-foreground">
                  {details.email}
                </a>
              </li>
            ) : null}
          </ul>

          {details.socials.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {details.socials.map((social) => (
                <Button key={social.id} size="sm" variant="outline" asChild>
                  <a href={social.href} target="_blank" rel="noreferrer noopener">
                    {social.label}
                  </a>
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        {details.mapEmbedUrl ? (
          <iframe
            src={details.mapEmbedUrl}
            title={mapTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full rounded-2xl border border-border"
          />
        ) : null}
      </div>
    </section>
  );
}
