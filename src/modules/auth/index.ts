export { AuthProvider, useAuth } from "./auth-provider";
export { RequireAccess } from "./require-access";
export {
  allowsScope,
  canAccessTenant,
  emptyAccess,
  hasAnyPermission,
  hasPermission,
  hasRole,
  isAgent,
  isSuperAdmin,
  type AccessScope,
  type AccessSnapshot,
} from "./authorization";
