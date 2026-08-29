import { Label } from "@/components/ui/label";

import type { AgentOption } from "./use-agent-scope";

/** Agency picker; hidden when the user only has access to a single agency. */
export function AgentSelect({
  agents,
  agentId,
  setAgentId,
  label = "Acente",
}: {
  agents: AgentOption[];
  agentId: string;
  setAgentId: (value: string) => void;
  label?: string;
}) {
  if (agents.length <= 1) return null;

  return (
    <div className="grid gap-2">
      <Label htmlFor="agent-scope">{label}</Label>
      <select
        id="agent-scope"
        value={agentId}
        onChange={(event) => setAgentId(event.target.value)}
        className="h-10 min-w-48 rounded-lg border border-border bg-background px-3 text-sm"
      >
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
    </div>
  );
}
