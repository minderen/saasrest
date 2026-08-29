import { createFileRoute } from "@tanstack/react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceSection } from "@/components/admin/resource-page";
import { adminResources } from "@/config/admin-resources";
import { RequireAccess } from "@/modules/auth";
import { TenantScopeSelect } from "@/modules/admin/tenant-scope";
import { SiteSettingsForm } from "@/modules/admin/site-settings-form";
import { websiteSettingsFields } from "@/config/site-settings-fields";

export const Route = createFileRoute("/panel/website")({
  component: () => (
    <RequireAccess scope="tenant">
      <WebsiteAdminPage />
    </RequireAccess>
  ),
});

function WebsiteAdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Website yönetimi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Marka sitesinin bölümleri, menüsü, slider'ı ve genel ayarları.
          </p>
        </div>
        <TenantScopeSelect />
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Genel ayarlar</TabsTrigger>
          <TabsTrigger value="sections">Bölümler</TabsTrigger>
          <TabsTrigger value="navigation">Menü</TabsTrigger>
          <TabsTrigger value="slides">Slider</TabsTrigger>
        </TabsList>
        <TabsContent value="settings" className="mt-6">
          <SiteSettingsForm
            title="Genel site ayarları"
            description="Logo, renkler ve iletişim bilgileri."
            fields={websiteSettingsFields}
          />
        </TabsContent>
        <TabsContent value="sections" className="mt-6">
          <ResourceSection resource={adminResources.siteSections} embedded />
        </TabsContent>
        <TabsContent value="navigation" className="mt-6">
          <ResourceSection resource={adminResources.siteNavigation} embedded />
        </TabsContent>
        <TabsContent value="slides" className="mt-6">
          <ResourceSection resource={adminResources.slides} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
