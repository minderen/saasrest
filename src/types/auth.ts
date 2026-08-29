export type AppRole = "super_admin" | "agent" | "tenant_owner" | "tenant_staff";

export type UserRoleAssignment = {
  role: AppRole;
  agent_id: string | null;
  tenant_id: string | null;
};
