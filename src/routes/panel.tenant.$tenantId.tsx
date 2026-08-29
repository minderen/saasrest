import { createFileRoute } from "@tanstack/react-router";

import { TenantDetail } from "@/modules/agent";
import { RequireAccess } from "@/modules/auth";

export const Route = createFileRoute("/panel/tenant/$tenantId")({
  component: TenantDetailRoute,
});

function TenantDetailRoute() {
  const { tenantId } = Route.useParams();
  return (
    <RequireAccess scope="staff">
      <TenantDetail tenantId={tenantId} />
    </RequireAccess>
  );
}
