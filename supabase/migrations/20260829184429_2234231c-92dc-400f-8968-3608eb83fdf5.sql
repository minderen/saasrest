-- Keep anon EXECUTE only for the helpers that public RLS policies actually need
-- (is_tenant_published, is_super_admin) plus the public post-view counter.
REVOKE EXECUTE ON FUNCTION public.has_tenant_access(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_tenant(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.my_tenant_ids() FROM anon;
REVOKE EXECUTE ON FUNCTION public.my_agent_ids() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_agent() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_permission(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.my_permissions() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.tenant_effective_plan_id(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.plan_feature_enabled(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.plan_limit(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.tenant_feature_enabled(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.tenant_limit(uuid, text) FROM anon;