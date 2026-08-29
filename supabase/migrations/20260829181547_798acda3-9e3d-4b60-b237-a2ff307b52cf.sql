-- Tenant managers (super admin, agent owners, tenant owners) can see the profiles
-- of people who are already members of a tenant they manage.
CREATE POLICY "profiles_tenant_manager_read"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_users tu
    WHERE tu.user_id = profiles.id AND public.can_manage_tenant(tu.tenant_id)
  )
);

-- Agents / tenant owners manage plugin activation for their own tenants only.
CREATE POLICY "plugin_assign_tenant_manage"
ON public.plugin_assignments
FOR ALL
TO authenticated
USING (tenant_id IS NOT NULL AND public.can_manage_tenant(tenant_id))
WITH CHECK (tenant_id IS NOT NULL AND public.can_manage_tenant(tenant_id));

-- Agent tenant creation: ownership is enforced here, quota is enforced by
-- public.enforce_agent_tenant_quota() which reports a friendly Turkish message
-- and honours both the agent plan limit and agents.tenant_quota.
DROP POLICY IF EXISTS "tenants_agent_insert" ON public.tenants;

CREATE POLICY "tenants_agent_insert"
ON public.tenants
FOR INSERT
TO authenticated
WITH CHECK (agent_id IS NOT NULL AND agent_id IN (SELECT public.my_agent_ids()));