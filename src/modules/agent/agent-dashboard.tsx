import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Newspaper, ReceiptText, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { agentRepository } from "@/repositories/agent.repository";

import { AgentSelect } from "./agent-select";
import { useAgentScope } from "./use-agent-scope";

const CARDS = [
  { key: "products", label: "Ürün", icon: UtensilsCrossed },
  { key: "menus", label: "Menü", icon: UtensilsCrossed },
  { key: "branches", label: "Şube", icon: MapPin },
  { key: "campaigns", label: "Kampanya", icon: Building2 },
  { key: "posts", label: "Haber", icon: Newspaper },
  { key: "orders", label: "Sipariş", icon: ReceiptText },
] as const;

/** Agent overview: quota usage plus aggregated content counts of own tenants. */
export function AgentDashboard() {
  const { agents, agentId, setAgentId, loading } = useAgentScope();

  const { data: tenants = [] } = useQuery({
    queryKey: ["panel", "agent-tenants", agentId],
    enabled: Boolean(agentId),
    queryFn: () => agentRepository.tenants(agentId),
  });

  const tenantIds = useMemo(() => tenants.map((tenant) => tenant.id), [tenants]);

  const { data: counts } = useQuery({
    queryKey: ["panel", "agent-content-counts", tenantIds],
    enabled: tenantIds.length > 0,
    queryFn: () => agentRepository.tenantContentCounts(tenantIds),
  });

  const activeAgent = agents.find((agent) => agent.id === agentId);
  const quota = activeAgent?.tenant_quota ?? -1;
  const used = tenants.length;
  const percent = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const published = tenants.filter((tenant) => tenant.is_published).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Acente paneli</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Yalnızca acentenize bağlı markalar listelenir; erişim veritabanı seviyesinde sınırlıdır.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <AgentSelect agents={agents} agentId={agentId} setAgentId={setAgentId} />
          <Button asChild>
            <Link to="/panel/tenants">Markaları yönet</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : !agentId ? (
        <p className="text-sm text-muted-foreground">Erişebileceğiniz bir acente bulunamadı.</p>
      ) : (
        <>
          <section className="surface-card flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Marka kotası</span>
              <span className="text-muted-foreground">
                {quota >= 0 ? `${used} / ${quota}` : `${used} / sınırsız`}
              </span>
            </div>
            {quota > 0 ? <Progress value={percent} /> : null}
            <p className="text-xs text-muted-foreground">
              {published} marka yayında. Kota dolduğunda yeni marka oluşturma veritabanı tarafında
              engellenir.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((card) => (
              <article key={card.key} className="surface-card flex items-center gap-4 p-5">
                <card.icon className="size-5 text-muted-foreground" aria-hidden />
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-semibold">{counts?.[card.key] ?? 0}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="surface-card p-5">
            <h2 className="text-sm font-semibold">Markalar</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {tenants.map((tenant) => (
                <li key={tenant.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>{tenant.name}</span>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to="/panel/tenant/$tenantId" params={{ tenantId: tenant.id }}>
                      Yönet
                    </Link>
                  </Button>
                </li>
              ))}
              {tenants.length === 0 ? (
                <li className="text-sm text-muted-foreground">Henüz marka oluşturulmadı.</li>
              ) : null}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
