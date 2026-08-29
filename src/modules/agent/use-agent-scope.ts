import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { agentRepository } from "@/repositories/agent.repository";

export type AgentOption = Awaited<ReturnType<typeof agentRepository.myAgents>>[number];

/**
 * Selected agency for agent screens. RLS decides which agencies are returned:
 * an agent only sees its own, a super admin sees all.
 */
export function useAgentScope() {
  const [agentId, setAgentId] = useState("");
  const { data: agents = [], isPending } = useQuery({
    queryKey: ["panel", "my-agents"],
    queryFn: agentRepository.myAgents,
  });

  useEffect(() => {
    if (!agentId && agents[0]) setAgentId(agents[0].id);
  }, [agents, agentId]);

  return { agents, agentId, setAgentId, loading: isPending };
}
