import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { RequireAccess } from "@/modules/auth";
import { TenantScopeSelect, useTenantScope } from "@/modules/admin/tenant-scope";
import { UsageList } from "@/modules/billing";
import { billingRepository } from "@/repositories";

export const Route = createFileRoute("/panel/usage")({
  component: () => (
    <RequireAccess scope="tenant">
      <UsagePage />
    </RequireAccess>
  ),
});

function UsagePage() {
  const { tenantId } = useTenantScope();
  const { data: usage = [], isPending } = useQuery({
    queryKey: ["panel", "billing", "usage", "tenant", tenantId],
    enabled: Boolean(tenantId),
    queryFn: () => billingRepository.tenantUsage(tenantId),
  });

  const { data: planId } = useQuery({
    queryKey: ["panel", "billing", "plan", tenantId],
    enabled: Boolean(tenantId),
    queryFn: () => billingRepository.tenantPlan(tenantId),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kota / kullanım</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Limitler veritabanı tarafında zorunlu kılınır; kota dolduğunda yeni kayıt oluşturulamaz.
          </p>
        </div>
        <TenantScopeSelect />
      </div>

      {!tenantId ? (
        <p className="text-sm text-muted-foreground">Devam etmek için bir marka seçin.</p>
      ) : isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <section className="surface-card flex flex-col gap-3 p-5">
          <h2 className="text-sm font-medium">Aktif plan kullanımı</h2>
          <UsageList rows={usage} />
          {planId ? (
            <p className="text-xs text-muted-foreground">Geçerli plan kimliği: {planId}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Bu markaya atanmış aktif plan bulunmuyor.</p>
          )}
        </section>
      )}
    </div>
  );
}
