-- Trigger-only functions: never callable via the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated;

-- Authorization helpers: needed by RLS for signed-in users only
REVOKE ALL ON FUNCTION public.is_super_admin() FROM anon;
REVOKE ALL ON FUNCTION public.my_agent_ids() FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE ALL ON FUNCTION public.has_tenant_access(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_tenant_published(uuid) FROM anon;

-- Grant back only what the app actually calls directly
GRANT EXECUTE ON FUNCTION public.increment_post_views(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_access(uuid) TO authenticated;