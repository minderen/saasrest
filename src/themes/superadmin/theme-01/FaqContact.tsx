import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import { SectionHeading } from "@/components/shared/section-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/i18n";
import { leadService } from "@/services";
import type { LandingSection } from "@/repositories/landing.repository";

export function Faq({ section, faqs }: { section?: LandingSection | undefined; faqs: Array<{ id: string; question: string; answer: string }> }) {
  if (!section) return null;
  return (
    <section className="section-y bg-surface/40" id="faq">
      <div className="container-page flex flex-col items-center gap-10">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} />
        <Accordion type="single" collapsible className="w-full max-w-3xl">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function ContactSection({
  section,
  selectedPlan,
}: {
  section?: LandingSection | undefined;
  selectedPlan: string | null;
}) {
  const t = useT();
  const [pending, setPending] = useState(false);
  if (!section) return null;
  const config = section.config as { email?: string; phone?: string };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    try {
      await leadService.submit({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        company: String(formData.get("company") ?? ""),
        message: String(formData.get("message") ?? ""),
        plan_slug: selectedPlan,
      });
      toast.success(t("form.success"));
      form.reset();
    } catch {
      toast.error(t("form.error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="section-y" id="contact">
      <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-6">
          <SectionHeading align="left" eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
          <div className="flex flex-col gap-3">
            {config.phone ? (
              <a
                href={`tel:${config.phone.replace(/\s/g, "")}`}
                className="surface-card flex items-center gap-3 p-4 text-sm transition-colors hover:border-primary/40"
              >
                <Phone className="size-4 text-primary" aria-hidden />
                {config.phone}
              </a>
            ) : null}
            {config.email ? (
              <a
                href={`mailto:${config.email}`}
                className="surface-card flex items-center gap-3 p-4 text-sm transition-colors hover:border-primary/40"
              >
                <Mail className="size-4 text-primary" aria-hidden />
                {config.email}
              </a>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="surface-card grid gap-4 p-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="lead-name">{t("form.name")}</Label>
            <Input id="lead-name" name="name" required autoComplete="name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lead-email">{t("auth.email")}</Label>
            <Input id="lead-email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lead-phone">{t("form.phone")}</Label>
            <Input id="lead-phone" name="phone" autoComplete="tel" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lead-company">Marka / İşletme</Label>
            <Input id="lead-company" name="company" autoComplete="organization" />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="lead-message">{t("form.message")}</Label>
            <Textarea id="lead-message" name="message" rows={4} />
          </div>
          <Button type="submit" className="sm:col-span-2" disabled={pending}>
            {t("action.send")}
          </Button>
        </form>
      </div>
    </section>
  );
}
