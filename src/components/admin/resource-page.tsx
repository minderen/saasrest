import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbox } from "@/components/shared/lightbox";
import { DataTable } from "@/components/admin/data-table";
import { ResourceFields } from "@/components/admin/resource-form";
import { TenantScopeSelect, useTenantScope } from "@/modules/admin/tenant-scope";
import { useOptionSources } from "@/modules/admin/use-option-sources";
import { buildResourceValues, resourceService } from "@/services/resource.service";
import type { AdminResource } from "@/types/admin";

type Row = Record<string, unknown>;

/**
 * Generic CRUD screen driven by an AdminResource definition. All reads/writes go
 * through the service → repository layers; the database enforces authorization.
 */
export function ResourceSection({
  resource,
  embedded = false,
}: {
  resource: AdminResource;
  embedded?: boolean;
}) {
  const queryClient = useQueryClient();
  const scope = useTenantScope();
  const tenantId = resource.tenantScoped ? scope.tenantId : null;
  const primaryKey = resource.primaryKey ?? "id";

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [search, setSearch] = useState("");

  const optionMap = useOptionSources(resource.fields, tenantId);
  const enabled = !resource.tenantScoped || Boolean(tenantId);
  const queryKey = ["panel", "resource", resource.key, tenantId];

  const { data: rows = [], isPending, error } = useQuery({
    queryKey,
    enabled,
    queryFn: () => resourceService.list(resource, tenantId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const save = useMutation({
    mutationFn: async (form: FormData) => {
      const values = buildResourceValues(resource, form);
      await resourceService.save(resource, values, editing?.[primaryKey], tenantId);
    },
    onSuccess: async () => {
      toast.success("Kayıt kaydedildi");
      setOpen(false);
      setEditing(null);
      await invalidate();
    },
    onError: (mutationError) =>
      toast.error(mutationError instanceof Error ? mutationError.message : "Kayıt başarısız"),
  });

  const remove = useMutation({
    mutationFn: (id: unknown) => resourceService.remove(resource, id),
    onSuccess: async () => {
      toast.success(resource.softDelete ? "Kayıt arşivlendi" : "Kayıt silindi");
      await invalidate();
    },
    onError: (mutationError) =>
      toast.error(mutationError instanceof Error ? mutationError.message : "Silme başarısız"),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term || !resource.searchColumns?.length) return rows;
    return rows.filter((row) =>
      resource.searchColumns!.some((column) => String(row[column] ?? "").toLowerCase().includes(term)),
    );
  }, [rows, search, resource.searchColumns]);

  const Heading = embedded ? "h2" : "h1";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading className={embedded ? "text-lg font-semibold" : "text-2xl font-semibold"}>
            {resource.title}
          </Heading>
          <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {resource.tenantScoped && !embedded ? <TenantScopeSelect /> : null}
          {resource.searchColumns?.length ? (
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ara…"
              className="w-48"
              aria-label="Kayıtlarda ara"
            />
          ) : null}
          {resource.readOnly ? null : (
            <Button
              disabled={!enabled}
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" aria-hidden />
              Yeni kayıt
            </Button>
          )}
        </div>
      </div>

      {!enabled ? (
        <p className="text-sm text-muted-foreground">Devam etmek için bir marka seçin.</p>
      ) : isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : "Veri alınamadı."}</p>
      ) : (
        <DataTable
          columns={resource.columns}
          rows={filtered}
          rowKey={(row) => String(row[primaryKey])}
          {...(resource.readOnly
            ? {}
            : {
                actions: (row) => (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditing(row);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="size-4" aria-hidden />
                      Düzenle
                    </Button>
                    {resource.noDelete ? null : (
                      <Button size="sm" variant="ghost" onClick={() => remove.mutate(row[primaryKey])}>
                        <Trash2 className="size-4" aria-hidden />
                        {resource.softDelete ? "Arşivle" : "Sil"}
                      </Button>
                    )}
                  </div>
                ),
              })}
        />
      )}

      <Lightbox open={open} onOpenChange={setOpen} title={editing ? `${resource.title} · düzenle` : `${resource.title} · yeni`}>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(new FormData(event.currentTarget));
          }}
        >
          <ResourceFields fields={resource.fields} row={editing} optionMap={optionMap} />
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Kaydet
            </Button>
          </div>
        </form>
      </Lightbox>
    </div>
  );
}

/** Route-level wrapper: identical to ResourceSection but always page-level. */
export function ResourcePage({ resource }: { resource: AdminResource }) {
  return <ResourceSection resource={resource} />;
}
