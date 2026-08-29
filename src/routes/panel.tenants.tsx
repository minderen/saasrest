import { createFileRoute } from "@tanstack/react-router";

import { RequireAccess } from "@/modules/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRepository } from "@/repositories";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/panel/tenants")({
  component: GuardedPage,
});

function TenantsPage() {
  const queryClient = useQueryClient();
  const publishTenant = useServerFn(setTenantPublished);
  const { data: tenants = [], isPending } = useQuery({
    queryKey: ["panel", "tenants"],
    queryFn: adminRepository.tenants,
  });

  const publish = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      publishTenant({ data: { tenantId: id, isPublished: value } }),
    onSuccess: async () => {
      toast.success("Yayın durumu güncellendi");
      await queryClient.invalidateQueries({ queryKey: ["panel", "tenants"] });
    },
    onError: (error: Error) => toast.error(error.message || "Güncelleme başarısız"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Markalar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marka yayın durumunu yönetin, sitelerini ve QR menülerini görüntüleyin.
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <div className="surface-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marka</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead>Oluşturma</TableHead>
                <TableHead>Yayın</TableHead>
                <TableHead className="text-right">Bağlantılar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell className="text-muted-foreground">{tenant.slug}</TableCell>
                  <TableCell className="text-muted-foreground">{tenant.status}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tenant.website_theme} / {tenant.menu_theme}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(tenant.created_at)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={tenant.is_published}
                      aria-label={`${tenant.name} yayın durumu`}
                      onCheckedChange={(value) => publish.mutate({ id: tenant.id, value })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" asChild>
                        <a href={`/${tenant.slug}`} target="_blank" rel="noreferrer noopener">
                          Site
                          <ExternalLink className="size-3.5" aria-hidden />
                        </a>
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={`/${tenant.slug}/menu`} target="_blank" rel="noreferrer noopener">
                          Menü
                          <ExternalLink className="size-3.5" aria-hidden />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function GuardedPage() {
  return (
    <RequireAccess scope="staff">
      <TenantsPage />
    </RequireAccess>
  );
}
