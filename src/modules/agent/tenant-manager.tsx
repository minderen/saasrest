import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, ExternalLink, Pencil, Plus, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { setTenantPublished } from "@/lib/authz.functions";
import { formatDate } from "@/lib/format";
import { agentRepository } from "@/repositories/agent.repository";
import { tenantService } from "@/services/tenant.service";

import { AgentSelect, useAgentScope } from "./use-agent-scope";

type TenantRow = Awaited<ReturnType<typeof agentRepository.tenants>>[number];

/**
 * Agent-facing brand (tenant) management: create, edit, archive and publish.
 * Ownership and plan quota are enforced by RLS and database triggers.
 */
export function TenantManager() {
  const queryClient = useQueryClient();
  const publishTenant = useServerFn(setTenantPublished);
  const { agents, agentId, setAgentId, loading: agentsLoading } = useAgentScope();
  const [editing, setEditing] = useState<TenantRow | null>(null);
  const [creating, setCreating] = useState(false);

  const tenantsKey = ["panel", "agent-tenants", agentId];
  const { data: tenants = [], isPending } = useQuery({
    queryKey: tenantsKey,
    enabled: Boolean(agentId),
    queryFn: () => agentRepository.tenants(agentId),
  });

  const { data: websiteThemes = [] } = useQuery({
    queryKey: ["panel", "themes", "restaurant"],
    queryFn: () => agentRepository.themes("restaurant"),
  });
  const { data: menuThemes = [] } = useQuery({
    queryKey: ["panel", "themes", "menu"],
    queryFn: () => agentRepository.themes("menu"),
  });

  const activeAgent = useMemo(() => agents.find((agent) => agent.id === agentId), [agents, agentId]);
  const quota = activeAgent?.tenant_quota ?? -1;

  useEffect(() => {
    if (!creating && !editing) return;
    if (!agentId) setCreating(false);
  }, [agentId, creating, editing]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: tenantsKey }),
      queryClient.invalidateQueries({ queryKey: ["panel", "tenants"] }),
    ]);
  };

  const save = useMutation({
    mutationFn: async (form: FormData) => {
      const payload = {
        name: String(form.get("name") ?? ""),
        default_locale: String(form.get("default_locale") ?? "tr"),
        website_theme: String(form.get("website_theme") ?? ""),
        menu_theme: String(form.get("menu_theme") ?? ""),
      };
      if (editing) {
        await tenantService.update({ id: editing.id, ...payload });
        return;
      }
      await tenantService.create({
        agent_id: agentId,
        slug: String(form.get("slug") ?? ""),
        ...payload,
      });
    },
    onSuccess: async () => {
      toast.success(editing ? "Marka güncellendi" : "Marka oluşturuldu");
      setEditing(null);
      setCreating(false);
      await invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "İşlem başarısız"),
  });

  const archive = useMutation({
    mutationFn: (id: string) => tenantService.archive(id),
    onSuccess: async () => {
      toast.success("Marka arşivlendi");
      await invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Arşivleme başarısız"),
  });

  const publish = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      publishTenant({ data: { tenantId: id, isPublished: value } }),
    onSuccess: async () => {
      toast.success("Yayın durumu güncellendi");
      await invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Güncelleme başarısız"),
  });

  const formOpen = creating || Boolean(editing);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Markalar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acentenize bağlı markaları oluşturun, düzenleyin ve yayınlayın.
            {quota >= 0
              ? ` Plan kotası: ${tenants.length}/${quota} marka.`
              : " Plan kotası: sınırsız."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <AgentSelect agents={agents} agentId={agentId} setAgentId={setAgentId} />
          <Button
            onClick={() => {
              setEditing(null);
              setCreating((value) => !value);
            }}
            disabled={!agentId}
          >
            <Plus className="size-4" aria-hidden />
            Yeni marka
          </Button>
        </div>
      </div>

      {formOpen ? (
        <form
          className="surface-card grid gap-4 p-5 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(new FormData(event.currentTarget));
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="tenant-name">Marka adı</Label>
            <Input id="tenant-name" name="name" defaultValue={editing?.name ?? ""} required />
          </div>
          {editing ? null : (
            <div className="grid gap-2">
              <Label htmlFor="tenant-slug">Slug</Label>
              <Input id="tenant-slug" name="slug" placeholder="Boş bırakılırsa addan üretilir" />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="tenant-locale">Varsayılan dil</Label>
            <Input id="tenant-locale" name="default_locale" defaultValue={editing?.default_locale ?? "tr"} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenant-website-theme">Website teması</Label>
            <select
              id="tenant-website-theme"
              name="website_theme"
              defaultValue={editing?.website_theme ?? websiteThemes[0]?.slug ?? ""}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            >
              {websiteThemes.map((theme) => (
                <option key={theme.slug} value={theme.slug}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenant-menu-theme">Menü teması</Label>
            <select
              id="tenant-menu-theme"
              name="menu_theme"
              defaultValue={editing?.menu_theme ?? menuThemes[0]?.slug ?? ""}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            >
              {menuThemes.map((theme) => (
                <option key={theme.slug} value={theme.slug}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Kaydet
            </Button>
          </div>
        </form>
      ) : null}

      {agentsLoading || isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : !agentId ? (
        <p className="text-sm text-muted-foreground">Erişebileceğiniz bir acente bulunamadı.</p>
      ) : tenants.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bu acenteye bağlı marka yok.</p>
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
                <TableHead className="text-right">İşlemler</TableHead>
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
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/panel/tenant/$tenantId" params={{ tenantId: tenant.id }}>
                          <Settings2 className="size-4" aria-hidden />
                          Yönet
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCreating(false);
                          setEditing(tenant);
                        }}
                      >
                        <Pencil className="size-4" aria-hidden />
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (window.confirm(`${tenant.name} arşivlenecek. Onaylıyor musunuz?`)) {
                            archive.mutate(tenant.id);
                          }
                        }}
                      >
                        <Archive className="size-4" aria-hidden />
                        Arşivle
                      </Button>
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
