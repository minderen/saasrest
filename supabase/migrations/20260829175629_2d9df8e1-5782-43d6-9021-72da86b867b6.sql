-- Postgres grants EXECUTE to PUBLIC by default; revoke that, then re-grant narrowly.
REVOKE ALL ON FUNCTION public.protect_tenant_columns() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_tenant_published(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tenant_effective_plan_id(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.agent_effective_plan_id(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.plan_limit(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.plan_feature_enabled(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tenant_limit(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tenant_feature_enabled(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_permission(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_tenant_access(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_tenant(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_agent() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.my_agent_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.my_permissions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.my_tenant_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tenant_usage(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.agent_usage_summary(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_tenant_quota() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_agent_tenant_quota() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_order_feature() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_post_views(uuid) FROM PUBLIC;

-- Panel/app surface: signed-in users only.
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_tenant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_permissions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_tenant_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.agent_usage_summary(uuid) TO authenticated;

-- Public site needs the view counter only.
GRANT EXECUTE ON FUNCTION public.increment_post_views(uuid) TO anon, authenticated;
