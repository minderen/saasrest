import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RequireAccess } from "@/modules/auth";
import { UsageList } from "@/modules/billing";
import { adminRepository, billingRepository } from "@/repositories";
import { createSubscription, setSubscriptionStatus } from "@/lib/billing.functions";

export const Route = createFileRoute("/panel/subscriptions")({
  component: GuardedPage,
});

const SUBS_KEY = ["panel", "billing", "subscriptions"] as const;

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  pending: "Beklemede",
  suspended: "Askıda",
  cancelled: "İptal",
};

function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [targetKind, setTargetKind] = useState<"tenant" | "agent">("tenant");
  const [targetId, setTargetId] = useState("");
  const [planId, setPlanId] = useState("");

  const { data: subscriptions = [], isPending } = useQuery({
    queryKey: SUBS_KEY,
    queryFn: billingRepository.subscriptions,
  });
  const { data: plans = [] } = useQuery({
    queryKey: ["panel", "billing", "plans"],
    queryFn: () => billingRepository.plans(),
  });
  const { data: tenants = [] } = useQuery({
    queryKey: ["panel", "tenants"],
    queryFn: adminRepository.tenants,
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["panel", "agents"],
    queryFn: adminRepository.agents,
  });

  const { data: usage = [] } = useQuery({
    queryKey: ["panel", "billing", "usage", targetKind, targetId],
    queryFn: () =>
      targetKind === "tenant"
        ? billingRepository.tenantUsage(targetId)
        : billingRepository.agentUsage(targetId),
    enabled: Boolean(targetId),
  });

  const assign = useServerFn(createSubscription);
  const changeStatus = useServerFn(setSubscriptionStatus);
  const fail = (error: unknown) =>
    toast.error(error instanceof Error ? error.message : "İşlem başarısız");

  const assignMutation = useMutation({
    mutationFn: () =>
      assign({
        data:
          targetKind === "tenant"
            ? { planId, tenantId: targetId, agentId: null }
            : { planId, agentId: targetId, tenantId: null },
      }),
    onSuccess: async () => {
      toast.success("Abonelik güncellendi");
      await queryClient.invalidateQueries({ queryKey: ["panel", "billing"] });
    },
    onError: fail,
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: "active" | "suspended" | "pending" | "cancelled" }) =>
      changeStatus({ data: input }),
    onSuccess: async () => {
      toast.success("Abonelik durumu güncellendi");
      await queryClient.invalidateQueries({ queryKey: SUBS_KEY });
    },
    onError: fail,
  });

  const targets = targetKind === "tenant" ? tenants : agents;
  const availablePlans = plans.filter((plan) => plan.kind === targetKind && plan.is_active);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Abonelikler</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Acente ve markalara plan atayın, plan değişikliği yapın veya aboneliği askıya alın. Kota
          kontrolleri atanan plana göre veritabanında zorlanır.
        </p>
      </div>

      <section className="surface-card grid gap-4 p-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-medium">Plan ata / değiştir</h2>
          <div className="flex flex-col gap-2">
            <Label>Hedef tipi</Label>
            <Select
              value={targetKind}
              onValueChange={(value) => {
                setTargetKind(value as "tenant" | "agent");
                setTargetId("");
                setPlanId("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">Marka</SelectItem>
                <SelectItem value="agent">Acente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{targetKind === "tenant" ? "Marka" : "Acente"}</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                {targets.map((target) => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Plan</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Plan seçin" />
              </SelectTrigger>
              <SelectContent>
                {availablePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={!targetId || !planId || assignMutation.isPending}
            onClick={() => assignMutation.mutate()}
            className="self-start"
          >
            Planı uygula
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Kullanım / kota</h2>
          {targetId ? (
            <UsageList rows={usage} />
          ) : (
            <p className="text-sm text-muted-foreground">Bir hedef seçin.</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Mevcut abonelikler</h2>
        {isPending ? (
          <p className="text-sm text-muted-foreground">Yükleniyor…</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {subscriptions.length === 0 && (
              <li className="text-sm text-muted-foreground">Abonelik kaydı yok.</li>
            )}
            {subscriptions.map((sub) => (
              <li
                key={sub.id}
                className="surface-card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-medium">
                    {sub.tenants?.name ?? sub.agents?.name ?? "—"}{" "}
                    <span className="text-sm text-muted-foreground">· {sub.plans?.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {STATUS_LABELS[sub.status] ?? sub.status} ·{" "}
                    {new Date(sub.started_at).toLocaleDateString("tr-TR")}
                    {sub.ends_at ? ` – ${new Date(sub.ends_at).toLocaleDateString("tr-TR")}` : ""}
                  </p>
                </div>
                <Select
                  value={sub.status}
                  onValueChange={(value) =>
                    statusMutation.mutate({
                      id: sub.id,
                      status: value as "active" | "suspended" | "pending" | "cancelled",
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function GuardedPage() {
  return (
    <RequireAccess scope="super">
      <SubscriptionsPage />
    </RequireAccess>
  );
}
