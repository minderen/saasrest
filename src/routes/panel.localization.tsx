import { createFileRoute } from "@tanstack/react-router";

import { ResourcePage } from "@/components/admin/resource-page";
import { adminResources } from "@/config/admin-resources";
import { RequireAccess } from "@/modules/auth";

export const Route = createFileRoute("/panel/localization")({
  head: () => ({
    meta: [
      { title: "Dil içerikleri · QR Sofra paneli" },
      {
        name: "description",
        content: "Marka içeriklerinin dil bazlı çevirilerini yönetin.",
      },
    ],
  }),
  component: () => (
    <RequireAccess scope="tenant">
      <ResourcePage resource={adminResources.localizedContent} />
    </RequireAccess>
  ),
});
