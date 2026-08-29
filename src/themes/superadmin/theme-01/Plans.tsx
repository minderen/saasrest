import { Check } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney } from "@/lib/format";
import type { LandingSection } from "@/repositories/landing.repository";

type Plan = {
  id: string;
  kind: string;
  slug: string;
  name: string;
  tagline: string | null;
  price_monthly: number;
  currency: string;
  features: unknown;
  is_featured: boolean;
};

function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: (slug: string) => void }) {
  const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
  return (
    <article
      className={`surface-card flex flex-col gap-5 p-7 ${plan.is_featured ? "border-primary/50 shadow-[var(--shadow-glow)]" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <p className="text-sm text-muted-foreground">{plan.tagline}</p>
        </div>
        {plan.is_featured ? (
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Popüler
          </span>
        ) : null}
      </div>
      <p className="text-3xl font-semibold">
        {formatMoney(plan.price_monthly, plan.currency)}
        <span className="text-sm font-normal text-muted-foreground"> / ay</span>
      </p>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        className="mt-auto"
        variant={plan.is_featured ? "default" : "secondary"}
        onClick={() => onSelect(plan.slug)}
      >
        Bu planı seç
      </Button>
    </article>
  );
}

export function Plans({
  section,
  plans,
  onSelect,
}: {
  section?: LandingSection | undefined;
  plans: Plan[];
  onSelect: (slug: string) => void;
}) {
  if (!section) return null;
  const agentPlans = plans.filter((plan) => plan.kind === "agent");
  const tenantPlans = plans.filter((plan) => plan.kind === "tenant");

  return (
    <section className="section-y" id="plans">
      <div className="container-page flex flex-col items-center gap-10">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <Tabs defaultValue="tenant" className="w-full">
          <TabsList className="mx-auto">
            <TabsTrigger value="tenant">Marka planları</TabsTrigger>
            <TabsTrigger value="agent">Acente planları</TabsTrigger>
          </TabsList>
          <TabsContent value="tenant" className="mt-8">
            <div className="grid gap-5 md:grid-cols-3">
              {tenantPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onSelect={onSelect} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="agent" className="mt-8">
            <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
              {agentPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onSelect={onSelect} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
