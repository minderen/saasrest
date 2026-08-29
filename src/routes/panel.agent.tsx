import { createFileRoute } from "@tanstack/react-router";

import { AgentDashboard } from "@/modules/agent";
import { RequireAccess } from "@/modules/auth";

export const Route = createFileRoute("/panel/agent")({
  component: () => (
    <RequireAccess scope="staff">
      <AgentDashboard />
    </RequireAccess>
  ),
});
