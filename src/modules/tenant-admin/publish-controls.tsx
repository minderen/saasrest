import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminRepository } from "@/repositories/admin.repository";
import { agentRepository } from "@/repositories/agent.repository";
import { describeDatabaseError } from "@/services/resource.service";
import { useTenantScope } from "@/modules/admin/tenant-scope";

/**
 * Draft → preview → publish flow for the brand site. Publishing is only allowed
 * for tenant managers; the database enforces that through can_manage_tenant().
 */
export function PublishControls() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();
  const queryKey = ["panel", "brand", tenantId];

  const { data: tenant, isPending } = useQuery({
    queryKey,
    enabled: Boolean(tenantId),
    queryFn: () => agentRepository.tenantById(tenantId),
  });

  const publish = useMutation({
    mutationFn: (next: boolean) => adminRepository.setTenantPublished(tenantId, next),
    onSuccess: async () => {
      toast.success("Yayın durumu güncellendi");
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({ queryKey: ["panel", "tenants"] });
    },
    onError: (error) => toast.error(describeDatabaseError(error)),
  });

  if (!tenantId || isPending || !tenant) return null;

  const isPublished = Boolean(tenant.is_published);
  const slug = String(tenant.slug ?? "");

  return (
    <section className="surface-card flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Yayın durumu</h2>
          <Badge variant={isPublished ? "default" : "secondary"}>
            {isPublished ? "Yayında" : "Taslak"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Taslak modda site yalnızca panelden önizlenir; yayına aldığınızda herkese açılır.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" asChild>
          <a href={`/${slug}`} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" aria-hidden />
            Website önizleme
          </a>
        </Button>
        <Button variant="secondary" asChild>
          <a href={`/${slug}/menu`} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" aria-hidden />
            QR menü önizleme
          </a>
        </Button>
        <Button
          variant={isPublished ? "outline" : "default"}
          disabled={publish.isPending}
          onClick={() => publish.mutate(!isPublished)}
        >
          {isPublished ? "Taslağa al" : "Yayınla"}
        </Button>
      </div>
    </section>
  );
}
