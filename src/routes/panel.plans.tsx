import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { adminRepository } from "@/repositories/admin";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/panel/plans")({
  component: PlansPage,
});

function PlansPage() {
  const queryClient = useQueryClient();
  const { data: plans = [], isPending } = useQuery({ queryKey: ["panel", "plans"], queryFn: adminRepository.plans });

  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => adminRepository.togglePlan(id, value),
    onSuccess: async () => {
      toast.success("Plan güncellendi");
      await queryClient.invalidateQueries({ queryKey: ["panel", "plans"] });
    },
    onError: () => toast.error("Güncelleme başarısız"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Planlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acente ve marka planlarını yönetin. Kapatılan planlar tanıtım sayfasında görünmez.
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <li key={plan.id} className="surface-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {plan.kind === "agent" ? "Acente" : "Marka"}
                  </p>
                  <h2 className="text-lg font-semibold">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>
                <Switch
                  checked={plan.is_active}
                  aria-label={`${plan.name} aktifliği`}
                  onCheckedChange={(value) => toggle.mutate({ id: plan.id, value })}
                />
              </div>
              <p className="text-2xl font-semibold text-primary">{formatMoney(plan.price_monthly, plan.currency)}</p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {(Array.isArray(plan.features) ? (plan.features as string[]) : []).map((feature) => (
                  <li key={feature}>· {feature}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
