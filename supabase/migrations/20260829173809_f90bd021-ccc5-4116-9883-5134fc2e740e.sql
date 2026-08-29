-- ============================================================
-- 1. Core authorization helpers
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_tenant_access(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin()
    OR EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = _tenant_id AND t.owner_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.tenant_id = _tenant_id)
    OR EXISTS (SELECT 1 FROM public.tenant_users tu WHERE tu.tenant_id = _tenant_id AND tu.user_id = auth.uid() AND tu.is_active)
    OR EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = _tenant_id AND t.agent_id IN (SELECT public.my_agent_ids()));
$$;

CREATE OR REPLACE FUNCTION public.is_agent()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.agents a WHERE a.owner_user_id = auth.uid() AND a.deleted_at IS NULL)
      OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'agent');
$$;

CREATE OR REPLACE FUNCTION public.my_tenant_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.id FROM public.tenants t WHERE t.owner_user_id = auth.uid() AND t.deleted_at IS NULL
  UNION
  SELECT ur.tenant_id FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.tenant_id IS NOT NULL
  UNION
  SELECT tu.tenant_id FROM public.tenant_users tu WHERE tu.user_id = auth.uid() AND tu.is_active
  UNION
  SELECT t.id FROM public.tenants t WHERE t.deleted_at IS NULL AND t.agent_id IN (SELECT public.my_agent_ids());
$$;

-- Manage = ownership level (super admin, owning agent, tenant owner). Staff excluded.
CREATE OR REPLACE FUNCTION public.can_manage_tenant(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin()
    OR EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = _tenant_id AND t.owner_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = _tenant_id AND t.agent_id IN (SELECT public.my_agent_ids()))
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.tenant_id = _tenant_id AND ur.role = 'tenant_owner')
    OR EXISTS (SELECT 1 FROM public.tenant_users tu WHERE tu.tenant_id = _tenant_id AND tu.user_id = auth.uid() AND tu.is_active AND tu.role = 'tenant_owner');
$$;

-- ============================================================
-- 2. Permission system (role -> role_permissions -> permissions)
-- ============================================================

CREATE OR REPLACE FUNCTION public.my_permissions()
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT p.key
  FROM public.user_roles ur
  JOIN public.roles r ON r.key = ur.role
  JOIN public.role_permissions rp ON rp.role_id = r.id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = auth.uid()
  UNION
  SELECT DISTINCT p.key
  FROM public.tenant_users tu
  JOIN public.roles r ON r.key = tu.role
  JOIN public.role_permissions rp ON rp.role_id = r.id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE tu.user_id = auth.uid() AND tu.is_active;
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin() OR EXISTS (SELECT 1 FROM public.my_permissions() k WHERE k = _key);
$$;

REVOKE ALL ON FUNCTION public.is_agent() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_tenant_ids() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_manage_tenant(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_permissions() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_permission(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_agent() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_tenant_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_tenant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_permissions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(text) TO authenticated;

-- ============================================================
-- 3. Role assignment policies (user_roles was read-only)
-- ============================================================

DROP POLICY IF EXISTS user_roles_admin_all ON public.user_roles;
CREATE POLICY user_roles_admin_all ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS user_roles_tenant_grant ON public.user_roles;
CREATE POLICY user_roles_tenant_grant ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IS NOT NULL
    AND agent_id IS NULL
    AND role IN ('tenant_owner', 'tenant_staff')
    AND public.can_manage_tenant(tenant_id)
  );

DROP POLICY IF EXISTS user_roles_tenant_revoke ON public.user_roles;
CREATE POLICY user_roles_tenant_revoke ON public.user_roles FOR DELETE TO authenticated
  USING (
    tenant_id IS NOT NULL
    AND role IN ('tenant_owner', 'tenant_staff')
    AND public.can_manage_tenant(tenant_id)
  );

GRANT SELECT, INSERT, DELETE, UPDATE ON public.user_roles TO authenticated;

-- ============================================================
-- 4. Tenant team management: staff can read, only owners manage
-- ============================================================

DROP POLICY IF EXISTS "tenant_users managed by tenant" ON public.tenant_users;
CREATE POLICY tenant_users_manage ON public.tenant_users FOR ALL TO authenticated
  USING (public.can_manage_tenant(tenant_id))
  WITH CHECK (public.can_manage_tenant(tenant_id) AND role IN ('tenant_owner', 'tenant_staff'));

-- ============================================================
-- 5. Tenant row protection: staff cannot re-parent or self-publish
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_tenant_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.agent_id IS DISTINCT FROM OLD.agent_id
     OR NEW.plan_id IS DISTINCT FROM OLD.plan_id
     OR NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
     OR NEW.slug IS DISTINCT FROM OLD.slug
     OR NEW.custom_domain IS DISTINCT FROM OLD.custom_domain
     OR NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Bu alanları yalnızca platform yöneticisi değiştirebilir';
  END IF;

  IF NEW.is_published IS DISTINCT FROM OLD.is_published AND NOT public.can_manage_tenant(OLD.id) THEN
    RAISE EXCEPTION 'Yayın durumunu değiştirme yetkiniz yok';
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_tenants_protect ON public.tenants;
CREATE TRIGGER trg_tenants_protect BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.protect_tenant_columns();

-- ============================================================
-- 6. Order items must belong to an order of the same tenant
-- ============================================================

DROP POLICY IF EXISTS order_items_guest_insert ON public.order_items;
CREATE POLICY order_items_guest_insert ON public.order_items FOR INSERT TO anon, authenticated
  WITH CHECK (
    public.is_tenant_published(tenant_id)
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.tenant_id = order_items.tenant_id
    )
  );

-- ============================================================
-- 7. Plugin assignments were world-readable
-- ============================================================

DROP POLICY IF EXISTS plugin_assign_read ON public.plugin_assignments;
CREATE POLICY plugin_assign_public_read ON public.plugin_assignments FOR SELECT TO anon, authenticated
  USING (tenant_id IS NULL AND agent_id IS NULL);
CREATE POLICY plugin_assign_scoped_read ON public.plugin_assignments FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (tenant_id IS NOT NULL AND public.has_tenant_access(tenant_id))
    OR (agent_id IS NOT NULL AND agent_id IN (SELECT public.my_agent_ids()))
  );