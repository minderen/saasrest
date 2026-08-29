import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { RequireAccess } from "@/modules/auth";
import {
  AGENT_FEATURE_KEYS,
  AGENT_LIMIT_KEYS,
  PlanFeaturesEditor,
  PlanForm,
  PlanLimitsEditor,
  TENANT_FEATURE_KEYS,
  TENANT_LIMIT_KEYS,
} from "@/modules/billing";
import { billingRepository } from "@/repositories";
import {
  deletePlanFeature,
  deletePlanLimit,
  setPlanActive,
  upsertPlan,
  upsertPlanFeature,
  upsertPlanLimit,
} from "@/lib/billing.functions";
import { formatMoney } from "@/lib/format";
import type { PlanWithDetails } from "@/types/billing";
import type { PlanUpsertInput } from "@/validators/plan.validator";

export const Route = createFileRoute("/panel/plans")({
  component: GuardedPage,
});

const PLANS_KEY = ["panel", "billing", "plans"] as const;

function PlansPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlanWithDetails | null>(null);

  const { data: plans = [], isPending } = useQuery({
    queryKey: PLANS_KEY,
    queryFn: () => billingRepository.plans(),
  });

  const savePlan = useServerFn(upsertPlan);
  const toggleActive = useServerFn(setPlanActive);
  const saveFeature = useServerFn(upsertPlanFeature);
  const removeFeature = useServerFn(deletePlanFeature);
  const saveLimit = useServerFn(upsertPlanLimit);
  const removeLimit = useServerFn(deletePlanLimit);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: PLANS_KEY });
  const fail = (error: unknown) =>
    toast.error(error instanceof Error ? error.message : "İşlem başarısız");

  const planMutation = useMutation({
    mutationFn: (input: PlanUpsertInput) => savePlan({ data: input }),
    onSuccess: async () => {
      toast.success("Plan kaydedildi");
      setDialogOpen(false);
      setEditing(null);
      await invalidate();
    },
    onError: fail,
  });

  const activeMutation = useMutation({
    mutationFn: (input: { id: string; is_active: boolean }) => toggleActive({ data: input }),
    onSuccess: async () => {
      toast.success("Plan durumu güncellendi");
      await invalidate();
    },
    onError: fail,
  });

  const featureMutation = useMutation({
    mutationFn: (input: { planId: string; key: string; label: string; isIncluded: boolean }) =>
      saveFeature({ data: { ...input, sortOrder: 0 } }),
    onSuccess: async () => {
      await invalidate();
    },
    onError: fail,
  });

  const featureDelete = useMutation({
    mutationFn: (id: string) => removeFeature({ data: { id } }),
    onSuccess: async () => {
      await invalidate();
    },
    onError: fail,
  });

  const limitMutation = useMutation({
    mutationFn: (input: { planId: string; key: string; limitValue: number; unit: string | null }) =>
      saveLimit({ data: input }),
    onSuccess: async () => {
      await invalidate();
    },
    onError: fail,
  });

  const limitDelete = useMutation({
    mutationFn: (id: string) => removeLimit({ data: { id } }),
    onSuccess: async () => {
      await invalidate();
    },
    onError: fail,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Planlar &amp; kotalar</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Acente ve marka planlarını, özelliklerini ve limitlerini yönetin. Limitler veritabanı
            seviyesinde zorlanır; kota dolduğunda yeni kayıt oluşturulamaz.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" aria-hidden />
              Yeni plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Planı düzenle" : "Yeni plan"}</DialogTitle>
            </DialogHeader>
            <PlanForm
              {...(editing ? { plan: editing } : {})}
              pending={planMutation.isPending}
              onSubmit={(input) => planMutation.mutate(input)}
              onCancel={() => {
                setDialogOpen(false);
                setEditing(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {plans.map((plan) => (
            <li key={plan.id} className="surface-card flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {plan.kind === "agent" ? "Acente planı" : "Marka planı"}
                  </p>
                  <h2 className="text-lg font-semibold">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={plan.is_active}
                    aria-label={`${plan.name} aktifliği`}
                    onCheckedChange={(value) =>
                      activeMutation.mutate({ id: plan.id, is_active: value })
                    }
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditing(plan);
                      setDialogOpen(true);
                    }}
                  >
                    Düzenle
                  </Button>
                </div>
              </div>

              <p className="text-2xl font-semibold text-primary">
                {formatMoney(plan.price_monthly, plan.currency)}
              </p>

              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Özellikler</h3>
                <PlanFeaturesEditor
                  features={[...(plan.plan_features ?? [])].sort(
                    (a, b) => a.sort_order - b.sort_order,
                  )}
                  suggestions={plan.kind === "agent" ? AGENT_FEATURE_KEYS : TENANT_FEATURE_KEYS}
                  onSave={(input) => featureMutation.mutate({ planId: plan.id, ...input })}
                  onDelete={(id) => featureDelete.mutate(id)}
                />
              </section>

              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Limitler</h3>
                <PlanLimitsEditor
                  limits={[...(plan.plan_limits ?? [])].sort((a, b) => a.key.localeCompare(b.key))}
                  suggestions={plan.kind === "agent" ? AGENT_LIMIT_KEYS : TENANT_LIMIT_KEYS}
                  onSave={(input) => limitMutation.mutate({ planId: plan.id, ...input })}
                  onDelete={(id) => limitDelete.mutate(id)}
                />
              </section>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GuardedPage() {
  return (
    <RequireAccess scope="super">
      <PlansPage />
    </RequireAccess>
  );
}
