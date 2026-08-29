import { createFileRoute } from "@tanstack/react-router";

import { RequireAccess } from "@/modules/auth";
import { TenantScopeSelect } from "@/modules/admin/tenant-scope";
import { SiteSettingsForm } from "@/modules/admin/site-settings-form";
import { seoSettingsFields } from "@/config/site-settings-fields";

export const Route = createFileRoute("/panel/seo")({
  component: () => (
    <RequireAccess scope="tenant">
      <SeoAdminPage />
    </RequireAccess>
  ),
});

function SeoAdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">SEO</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Marka sitesinin arama ve paylaşım meta bilgileri.
          </p>
        </div>
        <TenantScopeSelect />
      </div>

      <SiteSettingsForm
        title="Meta bilgiler"
        description="Başlık, açıklama ve paylaşım görselini yönetin."
        fields={seoSettingsFields}
      />
    </div>
  );
}
