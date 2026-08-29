-- Trigger-only and policy-only helpers must not be callable through the API.
REVOKE ALL ON FUNCTION public.protect_tenant_columns() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.is_tenant_published(uuid) FROM anon, authenticated;

-- Plan resolution / limit lookup are used by policies and triggers only.
REVOKE ALL ON FUNCTION public.tenant_effective_plan_id(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.agent_effective_plan_id(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.plan_limit(uuid, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.plan_feature_enabled(uuid, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.tenant_limit(uuid, text) FROM anon, authenticated;

-- Feature flag check is only needed server-side; keep it away from anonymous callers.
REVOKE ALL ON FUNCTION public.tenant_feature_enabled(uuid, text) FROM anon;

-- Role checks are for signed-in users only.
REVOKE ALL ON FUNCTION public.is_super_admin() FROM anon;
