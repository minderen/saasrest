import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ResourceFields } from "@/components/admin/resource-form";
import { tenantContentRepository } from "@/repositories";
import { buildResourceValues, describeDatabaseError } from "@/services/resource.service";
import type { AdminField, AdminResource } from "@/types/admin";
import { useTenantScope } from "./tenant-scope";

/**
 * Single-row (per tenant) settings editor. Reuses the declarative field layer so
 * settings screens do not duplicate form code.
 */
export function SiteSettingsForm({
  title,
  description,
  fields,
}: {
  title: string;
  description: string;
  fields: AdminField[];
}) {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();
  const queryKey = ["panel", "site-settings", tenantId];

  const { data, isPending } = useQuery({
    queryKey,
    enabled: Boolean(tenantId),
    queryFn: () => tenantContentRepository.settings(tenantId),
  });

  const save = useMutation({
    mutationFn: async (form: FormData) => {
      const resource = {
        key: "site-settings",
        title,
        description,
        table: "site_settings",
        columns: [],
        fields,
      } satisfies AdminResource;
      const values = buildResourceValues(resource, form);
      await tenantContentRepository.saveSettings(tenantId, values);
    },
    onSuccess: async () => {
      toast.success("Ayarlar kaydedildi");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(describeDatabaseError(error)),
  });

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {!tenantId ? (
        <p className="text-sm text-muted-foreground">Devam etmek için bir marka seçin.</p>
      ) : isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <form
          key={String(tenantId)}
          className="surface-card grid gap-4 p-5 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(new FormData(event.currentTarget));
          }}
        >
          <ResourceFields
            fields={fields}
            row={data as Record<string, unknown> | null}
            optionMap={{}}
          />
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              Kaydet
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
