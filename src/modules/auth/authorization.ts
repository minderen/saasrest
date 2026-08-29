import type { AppRole, UserRoleAssignment } from "@/types/auth";

/** Coarse access scopes used by navigation and route guards. */
export type AccessScope = "authenticated" | "super" | "agent" | "staff" | "tenant";

export type AccessSnapshot = {
  roles: UserRoleAssignment[];
  permissions: string[];
  tenantIds: string[];
  agentIds: string[];
};

export const emptyAccess: AccessSnapshot = { roles: [], permissions: [], tenantIds: [], agentIds: [] };

export function hasRole(access: AccessSnapshot, role: AppRole) {
  return access.roles.some((entry) => entry.role === role);
}

export function isSuperAdmin(access: AccessSnapshot) {
  return hasRole(access, "super_admin");
}

export function isAgent(access: AccessSnapshot) {
  return hasRole(access, "agent") || access.agentIds.length > 0;
}

/** Super admin implicitly holds every permission (mirrors public.has_permission). */
export function hasPermission(access: AccessSnapshot, key: string) {
  return isSuperAdmin(access) || access.permissions.includes(key);
}

export function hasAnyPermission(access: AccessSnapshot, keys: string[]) {
  return keys.some((key) => hasPermission(access, key));
}

/**
 * Tenant A must never reach Tenant B. This is only a UI shortcut —
 * the database enforces the same rule through has_tenant_access().
 */
export function canAccessTenant(access: AccessSnapshot, tenantId: string | null | undefined) {
  if (!tenantId) return false;
  return isSuperAdmin(access) || access.tenantIds.includes(tenantId);
}

export function allowsScope(access: AccessSnapshot, scope: AccessScope) {
  switch (scope) {
    case "authenticated":
      return true;
    case "super":
      return isSuperAdmin(access);
    case "agent":
      return isSuperAdmin(access) || isAgent(access);
    case "staff":
      return isSuperAdmin(access) || isAgent(access) || access.tenantIds.length > 0;
    case "tenant":
      return isSuperAdmin(access) || access.tenantIds.length > 0;
    default:
      return false;
  }
}
