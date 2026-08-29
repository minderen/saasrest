import { createFileRoute } from "@tanstack/react-router";

import { ResourcePage } from "@/components/admin/resource-page";
import { adminResources } from "@/config/admin-resources";
import { RequireAccess } from "@/modules/auth";

export const Route = createFileRoute("/panel/branches")({
  component: () => (
    <RequireAccess scope="tenant">
      <ResourcePage resource={adminResources.branches} />
    </RequireAccess>
  ),
});
