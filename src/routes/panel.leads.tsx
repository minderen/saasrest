import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { adminRepository } from "@/repositories/admin";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/panel/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const { data: leads = [], isPending } = useQuery({ queryKey: ["panel", "leads"], queryFn: adminRepository.leads });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Talepler</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tanıtım sayfasındaki iletişim formundan gelen başvurular.</p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : leads.length === 0 ? (
        <p className="surface-card p-6 text-sm text-muted-foreground">Henüz talep yok.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {leads.map((lead) => (
            <li key={lead.id} className="surface-card flex flex-col gap-2 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {lead.name}
                  {lead.company ? ` · ${lead.company}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                <a href={`mailto:${lead.email}`} className="hover:text-foreground">
                  {lead.email}
                </a>
                {lead.phone ? ` · ${lead.phone}` : ""}
                {lead.plan_slug ? ` · Plan: ${lead.plan_slug}` : ""}
              </p>
              {lead.message ? <p className="text-sm text-muted-foreground">{lead.message}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
