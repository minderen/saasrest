import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceSection } from "@/components/admin/resource-page";
import { adminResources } from "@/config/admin-resources";
import { websiteSettingsFields } from "@/config/site-settings-fields";
import { SiteSettingsForm } from "@/modules/admin/site-settings-form";
import { TenantScopeProvider } from "@/modules/admin/tenant-scope";
import { TenantTeam } from "@/modules/admin/tenant-team";
import { agentRepository } from "@/repositories/agent.repository";

/**
 * Single-tenant management surface for agents. The tenant scope is locked to one
 * brand, so every embedded resource screen reads/writes only that tenant's rows.
 */
export function TenantDetail({ tenantId }: { tenantId: string }) {
  const { data: tenant, isPending } = useQuery({
    queryKey: ["panel", "tenant", tenantId],
    queryFn: () => agentRepository.tenantById(tenantId),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  if (!tenant) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Marka bulunamadı veya bu markaya erişim yetkiniz yok.
        </p>
        <Button variant="ghost" asChild className="self-start">
          <Link to="/panel/tenants">
            <ArrowLeft className="size-4" aria-hidden />
            Markalara dön
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <TenantScopeProvider fixedTenantId={tenantId}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
              <Link to="/panel/tenants">
                <ArrowLeft className="size-4" aria-hidden />
                Markalar
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold">{tenant.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              /{tenant.slug} · {tenant.status} · {tenant.is_published ? "Yayında" : "Yayın dışı"} ·
              tema {tenant.website_theme} / {tenant.menu_theme}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <a href={`/${tenant.slug}`} target="_blank" rel="noreferrer noopener">
                Website
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a href={`/${tenant.slug}/menu`} target="_blank" rel="noreferrer noopener">
                QR menü
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="website">
          <TabsList className="flex-wrap">
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="products">Ürünler</TabsTrigger>
            <TabsTrigger value="menus">Menüler</TabsTrigger>
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="branches">Şubeler</TabsTrigger>
            <TabsTrigger value="campaigns">Kampanyalar</TabsTrigger>
            <TabsTrigger value="posts">Haberler</TabsTrigger>
            <TabsTrigger value="media">Medya</TabsTrigger>
            <TabsTrigger value="plugins">Eklentiler</TabsTrigger>
            <TabsTrigger value="team">Kullanıcılar</TabsTrigger>
          </TabsList>

          <TabsContent value="website" className="mt-6 flex flex-col gap-8">
            <SiteSettingsForm
              title="Genel site ayarları"
              description="Logo, renkler ve iletişim bilgileri."
              fields={websiteSettingsFields}
            />
            <ResourceSection resource={adminResources.siteSections} embedded />
            <ResourceSection resource={adminResources.siteNavigation} embedded />
            <ResourceSection resource={adminResources.slides} embedded />
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <ResourceSection resource={adminResources.products} embedded />
          </TabsContent>
          <TabsContent value="menus" className="mt-6">
            <ResourceSection resource={adminResources.menus} embedded />
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <ResourceSection resource={adminResources.categories} embedded />
          </TabsContent>
          <TabsContent value="branches" className="mt-6">
            <ResourceSection resource={adminResources.branches} embedded />
          </TabsContent>
          <TabsContent value="campaigns" className="mt-6">
            <ResourceSection resource={adminResources.campaigns} embedded />
          </TabsContent>
          <TabsContent value="posts" className="mt-6">
            <ResourceSection resource={adminResources.posts} embedded />
          </TabsContent>
          <TabsContent value="media" className="mt-6">
            <ResourceSection resource={adminResources.media} embedded />
          </TabsContent>
          <TabsContent value="plugins" className="mt-6">
            <ResourceSection resource={adminResources.tenantPlugins} embedded />
          </TabsContent>
          <TabsContent value="team" className="mt-6">
            <TenantTeam tenantId={tenantId} />
          </TabsContent>
        </Tabs>
      </div>
    </TenantScopeProvider>
  );
}
