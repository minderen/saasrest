-- ============ Plan resolution helpers ============
CREATE OR REPLACE FUNCTION public.tenant_effective_plan_id(_tenant_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT s.plan_id FROM public.subscriptions s
      WHERE s.tenant_id = _tenant_id AND s.status = 'active'
        AND (s.ends_at IS NULL OR s.ends_at > now())
      ORDER BY s.started_at DESC LIMIT 1),
    (SELECT t.plan_id FROM public.tenants t WHERE t.id = _tenant_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.agent_effective_plan_id(_agent_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT ap.plan_id FROM public.agent_plans ap
      WHERE ap.agent_id = _agent_id AND ap.status = 'active'
        AND (ap.ends_at IS NULL OR ap.ends_at > now())
      ORDER BY ap.starts_at DESC LIMIT 1),
    (SELECT s.plan_id FROM public.subscriptions s
      WHERE s.agent_id = _agent_id AND s.status = 'active'
        AND (s.ends_at IS NULL OR s.ends_at > now())
      ORDER BY s.started_at DESC LIMIT 1),
    (SELECT a.plan_id FROM public.agents a WHERE a.id = _agent_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.plan_limit(_plan_id uuid, _key text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pl.limit_value FROM public.plan_limits pl
   WHERE pl.plan_id = _plan_id AND pl.key = _key LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.plan_feature_enabled(_plan_id uuid, _key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT pf.is_included FROM public.plan_features pf
      WHERE pf.plan_id = _plan_id AND pf.key = _key LIMIT 1),
    true);
$$;

CREATE OR REPLACE FUNCTION public.tenant_limit(_tenant_id uuid, _key text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.plan_limit(public.tenant_effective_plan_id(_tenant_id), _key);
$$;

CREATE OR REPLACE FUNCTION public.tenant_feature_enabled(_tenant_id uuid, _key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.plan_feature_enabled(public.tenant_effective_plan_id(_tenant_id), _key);
$$;

-- ============ Quota enforcement ============
-- TG_ARGV[0] = plan limit key, TG_ARGV[1] = 'soft' when table has deleted_at
CREATE OR REPLACE FUNCTION public.enforce_tenant_quota()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _limit integer;
  _used integer;
  _sql text;
BEGIN
  _limit := public.tenant_limit(NEW.tenant_id, TG_ARGV[0]);
  IF _limit IS NULL OR _limit < 0 THEN
    RETURN NEW;
  END IF;

  _sql := format('SELECT count(*) FROM public.%I WHERE tenant_id = $1%s',
                 TG_TABLE_NAME,
                 CASE WHEN TG_NARGS > 1 AND TG_ARGV[1] = 'soft' THEN ' AND deleted_at IS NULL' ELSE '' END);
  EXECUTE _sql INTO _used USING NEW.tenant_id;

  IF _used >= _limit THEN
    RAISE EXCEPTION 'Plan limiti doldu: %s (limit: %s). Devam etmek için planınızı yükseltin.', TG_ARGV[0], _limit
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.enforce_agent_tenant_quota()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _limit integer;
  _used integer;
  _quota integer;
BEGIN
  IF NEW.agent_id IS NULL THEN RETURN NEW; END IF;

  _limit := public.plan_limit(public.agent_effective_plan_id(NEW.agent_id), 'tenants');
  SELECT a.tenant_quota INTO _quota FROM public.agents a WHERE a.id = NEW.agent_id;
  IF _limit IS NULL OR _limit < 0 THEN _limit := _quota; END IF;
  IF _quota IS NOT NULL AND _quota >= 0 AND _quota < _limit THEN _limit := _quota; END IF;
  IF _limit IS NULL OR _limit < 0 THEN RETURN NEW; END IF;

  SELECT count(*) INTO _used FROM public.tenants t
    WHERE t.agent_id = NEW.agent_id AND t.deleted_at IS NULL;

  IF _used >= _limit THEN
    RAISE EXCEPTION 'Acente marka kotası doldu (limit: %s). Yeni marka eklemek için planı yükseltin.', _limit
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.enforce_order_feature()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.tenant_feature_enabled(NEW.tenant_id, 'orders') THEN
    RAISE EXCEPTION 'Sipariş özelliği bu markanın planında kapalı.' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_products_quota ON public.products;
CREATE TRIGGER trg_products_quota BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_quota('products', 'soft');

DROP TRIGGER IF EXISTS trg_menus_quota ON public.menus;
CREATE TRIGGER trg_menus_quota BEFORE INSERT ON public.menus
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_quota('menus', 'soft');

DROP TRIGGER IF EXISTS trg_branches_quota ON public.branches;
CREATE TRIGGER trg_branches_quota BEFORE INSERT ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_quota('branches', 'soft');

DROP TRIGGER IF EXISTS trg_tenant_users_quota ON public.tenant_users;
CREATE TRIGGER trg_tenant_users_quota BEFORE INSERT ON public.tenant_users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_quota('users');

DROP TRIGGER IF EXISTS trg_tenants_agent_quota ON public.tenants;
CREATE TRIGGER trg_tenants_agent_quota BEFORE INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.enforce_agent_tenant_quota();

DROP TRIGGER IF EXISTS trg_orders_feature ON public.orders;
CREATE TRIGGER trg_orders_feature BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_order_feature();

-- ============ Usage reporting ============
CREATE OR REPLACE FUNCTION public.tenant_usage(_tenant_id uuid)
RETURNS TABLE(key text, used integer, limit_value integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_tenant_access(_tenant_id) THEN
    RAISE EXCEPTION 'Bu markanın kullanım verilerine erişim yetkiniz yok';
  END IF;

  RETURN QUERY
  SELECT 'products'::text,
         (SELECT count(*)::int FROM public.products p WHERE p.tenant_id = _tenant_id AND p.deleted_at IS NULL),
         public.tenant_limit(_tenant_id, 'products')
  UNION ALL
  SELECT 'menus'::text,
         (SELECT count(*)::int FROM public.menus m WHERE m.tenant_id = _tenant_id AND m.deleted_at IS NULL),
         public.tenant_limit(_tenant_id, 'menus')
  UNION ALL
  SELECT 'branches'::text,
         (SELECT count(*)::int FROM public.branches b WHERE b.tenant_id = _tenant_id AND b.deleted_at IS NULL),
         public.tenant_limit(_tenant_id, 'branches')
  UNION ALL
  SELECT 'users'::text,
         (SELECT count(*)::int FROM public.tenant_users tu WHERE tu.tenant_id = _tenant_id),
         public.tenant_limit(_tenant_id, 'users')
  UNION ALL
  SELECT 'orders_last_30d'::text,
         (SELECT count(*)::int FROM public.orders o WHERE o.tenant_id = _tenant_id AND o.created_at > now() - interval '30 days'),
         public.tenant_limit(_tenant_id, 'orders_per_month');
END; $$;

CREATE OR REPLACE FUNCTION public.agent_usage_summary(_agent_id uuid)
RETURNS TABLE(key text, used integer, limit_value integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.is_super_admin() OR _agent_id IN (SELECT public.my_agent_ids())) THEN
    RAISE EXCEPTION 'Bu acentenin kullanım verilerine erişim yetkiniz yok';
  END IF;

  RETURN QUERY
  SELECT 'tenants'::text,
         (SELECT count(*)::int FROM public.tenants t WHERE t.agent_id = _agent_id AND t.deleted_at IS NULL),
         public.plan_limit(public.agent_effective_plan_id(_agent_id), 'tenants');
END; $$;

-- ============ Execute grants ============
REVOKE ALL ON FUNCTION public.enforce_tenant_quota() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_agent_tenant_quota() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_order_feature() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.plan_limit(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.plan_feature_enabled(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.tenant_effective_plan_id(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.agent_effective_plan_id(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.tenant_limit(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.tenant_usage(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.agent_usage_summary(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.plan_limit(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.plan_feature_enabled(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_effective_plan_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.agent_effective_plan_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_limit(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_feature_enabled(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.tenant_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.agent_usage_summary(uuid) TO authenticated;

-- ============ Missing limits & feature flags ============
INSERT INTO public.plan_limits (plan_id, key, limit_value, unit)
SELECT p.id, v.key, v.limit_value, v.unit
FROM public.plans p
JOIN (VALUES
  ('tenant-basic', 'menus', 20, 'adet'),
  ('tenant-basic', 'users', 2, 'kullanıcı'),
  ('tenant-growth', 'menus', 100, 'adet'),
  ('tenant-growth', 'users', 10, 'kullanıcı'),
  ('tenant-chain', 'menus', -1, 'adet'),
  ('tenant-chain', 'users', -1, 'kullanıcı')
) AS v(slug, key, limit_value, unit) ON v.slug = p.slug
ON CONFLICT (plan_id, key) DO NOTHING;

INSERT INTO public.plan_features (plan_id, key, label, description, is_included, sort_order)
SELECT p.id, v.key, v.label, NULL, v.is_included, v.sort_order
FROM public.plans p
JOIN (VALUES
  ('tenant-basic', 'orders', 'QR sipariş', false, 90),
  ('tenant-basic', 'custom_themes', 'Tema seçimi', false, 91),
  ('tenant-basic', 'plugins', 'Eklentiler', false, 92),
  ('tenant-growth', 'orders', 'QR sipariş', true, 90),
  ('tenant-growth', 'custom_themes', 'Tema seçimi', true, 91),
  ('tenant-growth', 'plugins', 'Eklentiler', true, 92),
  ('tenant-chain', 'orders', 'QR sipariş', true, 90),
  ('tenant-chain', 'custom_themes', 'Tema seçimi', true, 91),
  ('tenant-chain', 'plugins', 'Eklentiler', true, 92)
) AS v(slug, key, label, is_included, sort_order) ON v.slug = p.slug
ON CONFLICT (plan_id, key) DO NOTHING;