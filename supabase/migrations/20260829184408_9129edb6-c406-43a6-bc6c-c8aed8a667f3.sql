-- Public RLS policies call these helper functions, so anonymous visitors must be
-- able to execute them. They are SECURITY DEFINER and only return booleans /
-- id sets, never row data.
GRANT EXECUTE ON FUNCTION public.is_tenant_published(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_access(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_tenant(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_tenant_ids() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_agent_ids() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_agent() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_permissions() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_effective_plan_id(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.plan_feature_enabled(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.plan_limit(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_feature_enabled(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_limit(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_post_views(uuid) TO anon, authenticated;