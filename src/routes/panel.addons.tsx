import { createFileRoute } from "@tanstack/react-router";

import { ResourcePage } from "@/components/admin/resource-page";
import { adminResources } from "@/config/admin-resources";
import { RequireAccess } from "@/modules/auth";

export const Route = createFileRoute("/panel/addons")({
  head: () => ({
    meta: [
      { title: "Yetkili eklentiler · QR Sofra paneli" },
      {
        name: "description",
        content: "Markaya atanmış eklentileri ve ayarlarını yönetin.",
      },
    ],
  }),
  component: () => (
    <RequireAccess scope="tenant">
      <ResourcePage resource={adminResources.tenantPlugins} />
    </RequireAccess>
  ),
});
