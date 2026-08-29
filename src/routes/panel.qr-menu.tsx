import { createFileRoute } from "@tanstack/react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceSection } from "@/components/admin/resource-page";
import { adminResources } from "@/config/admin-resources";
import { orderSettingsFields } from "@/config/site-settings-fields";
import { RequireAccess } from "@/modules/auth";
import { SiteSettingsForm } from "@/modules/admin/site-settings-form";
import { TenantScopeSelect } from "@/modules/admin/tenant-scope";
import { PublishControls } from "@/modules/tenant-admin";

export const Route = createFileRoute("/panel/qr-menu")({
  head: () => ({
    meta: [
      { title: "Online / QR menü yönetimi · QR Sofra paneli" },
      {
        name: "description",
        content: "QR menü içerikleri, menü kayıtları ve online sipariş ayarları.",
      },
    ],
  }),
  component: () => (
    <RequireAccess scope="tenant">
      <QrMenuAdminPage />
    </RequireAccess>
  ),
});

function QrMenuAdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Online / QR menü</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            QR menüde görünen menüler, kategoriler ve sipariş ayarları.
          </p>
        </div>
        <TenantScopeSelect />
      </div>

      <PublishControls />

      <Tabs defaultValue="order">
        <TabsList>
          <TabsTrigger value="order">Sipariş ayarları</TabsTrigger>
          <TabsTrigger value="menus">Menüler</TabsTrigger>
          <TabsTrigger value="categories">Kategoriler</TabsTrigger>
          <TabsTrigger value="products">Ürünler</TabsTrigger>
        </TabsList>

        <TabsContent value="order" className="mt-6">
          <SiteSettingsForm
            title="Sipariş ayarları"
            description="Online sipariş açık/kapalı durumu ve sipariş kuralları. Plan özelliği kapalıysa veritabanı siparişi reddeder."
            fields={orderSettingsFields}
          />
        </TabsContent>
        <TabsContent value="menus" className="mt-6">
          <ResourceSection resource={adminResources.menus} embedded />
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <ResourceSection resource={adminResources.categories} embedded />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <ResourceSection resource={adminResources.products} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
