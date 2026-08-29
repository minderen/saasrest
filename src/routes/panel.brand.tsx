import { createFileRoute } from "@tanstack/react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceSection } from "@/components/admin/resource-page";
import { adminResources } from "@/config/admin-resources";
import {
  brandIdentityFields,
  contactSettingsFields,
  topbarHeaderFields,
} from "@/config/site-settings-fields";
import { RequireAccess } from "@/modules/auth";
import { SiteSettingsForm } from "@/modules/admin/site-settings-form";
import { TenantScopeSelect } from "@/modules/admin/tenant-scope";
import { BrandProfileForm, PublishControls } from "@/modules/tenant-admin";

export const Route = createFileRoute("/panel/brand")({
  head: () => ({
    meta: [
      { title: "Marka yönetimi · QR Sofra paneli" },
      {
        name: "description",
        content: "Marka bilgileri, logo, favicon, topbar, header ve yayın durumu yönetimi.",
      },
    ],
  }),
  component: () => (
    <RequireAccess scope="tenant">
      <BrandAdminPage />
    </RequireAccess>
  ),
});

function BrandAdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Marka yönetimi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Marka bilgileri, kimlik görselleri, iletişim, topbar/header ve yayın durumu.
          </p>
        </div>
        <TenantScopeSelect />
      </div>

      <PublishControls />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Marka bilgileri</TabsTrigger>
          <TabsTrigger value="identity">Logo & favicon</TabsTrigger>
          <TabsTrigger value="contact">İletişim</TabsTrigger>
          <TabsTrigger value="topbar">Topbar & header</TabsTrigger>
          <TabsTrigger value="brands">Alt markalar</TabsTrigger>
          <TabsTrigger value="awards">Ödüller</TabsTrigger>
          <TabsTrigger value="galleries">Galeriler</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <BrandProfileForm />
        </TabsContent>
        <TabsContent value="identity" className="mt-6">
          <SiteSettingsForm
            title="Logo, favicon ve renkler"
            description="Marka kimliğini oluşturan görseller ve renk tercihleri."
            fields={brandIdentityFields}
          />
        </TabsContent>
        <TabsContent value="contact" className="mt-6">
          <SiteSettingsForm
            title="İletişim bilgileri"
            description="Telefon, WhatsApp, adres, harita ve sosyal medya bağlantıları."
            fields={contactSettingsFields}
          />
        </TabsContent>
        <TabsContent value="topbar" className="mt-6">
          <SiteSettingsForm
            title="Topbar ve header"
            description="Üst şerit mesajı ve header aksiyon butonları."
            fields={topbarHeaderFields}
          />
        </TabsContent>
        <TabsContent value="brands" className="mt-6">
          <ResourceSection resource={adminResources.brands} embedded />
        </TabsContent>
        <TabsContent value="awards" className="mt-6">
          <ResourceSection resource={adminResources.awards} embedded />
        </TabsContent>
        <TabsContent value="galleries" className="mt-6">
          <ResourceSection resource={adminResources.galleries} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
