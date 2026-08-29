import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { adminRepository } from "@/repositories";
import { useAuth } from "@/modules/auth";

export const Route = createFileRoute("/panel/")({
  component: PanelOverview,
});

const LABELS: Record<string, string> = {
  tenants: "Marka",
  agents: "Acente",
  profiles: "Kullanıcı",
  plans: "Plan",
  products: "Ürün",
  menus: "Menü",
  branches: "Şube",
  campaigns: "Kampanya",
  posts: "Haber",
  orders: "Sipariş",
  leads: "Talep",
};

function PanelOverview() {
  const { isSuperAdmin, isAgent, tenantIds } = useAuth();
  const { data: counts, isPending } = useQuery({
    queryKey: ["panel", "counts"],
    queryFn: adminRepository.counts,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Genel bakış</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSuperAdmin
            ? "Platform yöneticisi olarak tüm markaları, planları ve modülleri yönetiyorsunuz."
            : isAgent
              ? "Acente olarak kendi portföyünüzdeki markaları yönetiyorsunuz."
              : `Yetkili olduğunuz marka sayısı: ${tenantIds.length}`}
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Veriler yükleniyor…</p>
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(counts ?? {}).map(([key, value]) => (
            <div key={key} className="surface-card p-5">
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                {LABELS[key] ?? key}
              </dt>
              <dd className="mt-2 text-3xl font-semibold text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
