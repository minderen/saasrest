-- =========================================================
-- Authorization: roles, permissions, role_permissions
-- =========================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key app_role NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.roles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles readable" ON public.roles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "roles managed by super admin" ON public.roles FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  module text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT permissions_key_format CHECK (key = module || '.' || action),
  CONSTRAINT permissions_action_valid CHECK (action IN ('read','create','update','delete','manage'))
);
GRANT SELECT ON public.permissions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissions readable" ON public.permissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "permissions managed by super admin" ON public.permissions FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_permissions_updated BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions (module);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, permission_id)
);
GRANT SELECT ON public.role_permissions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_permissions readable" ON public.role_permissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "role_permissions managed by super admin" ON public.role_permissions FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions (permission_id);

-- =========================================================
-- Tenant membership + settings
-- =========================================================
CREATE TABLE IF NOT EXISTS public.tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'tenant_staff',
  title text,
  is_active boolean NOT NULL DEFAULT true,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id),
  CONSTRAINT tenant_users_role_valid CHECK (role IN ('tenant_owner','tenant_staff'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_users TO authenticated;
GRANT ALL ON public.tenant_users TO service_role;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_users visible to tenant" ON public.tenant_users FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_tenant_access(tenant_id));
CREATE POLICY "tenant_users managed by tenant" ON public.tenant_users FOR ALL TO authenticated
  USING (public.has_tenant_access(tenant_id)) WITH CHECK (public.has_tenant_access(tenant_id));
CREATE TRIGGER trg_tenant_users_updated BEFORE UPDATE ON public.tenant_users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON public.tenant_users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON public.tenant_users (user_id);

CREATE TABLE IF NOT EXISTS public.tenant_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, key)
);
GRANT SELECT ON public.tenant_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tenant_settings TO authenticated;
GRANT ALL ON public.tenant_settings TO service_role;
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_settings public read" ON public.tenant_settings FOR SELECT TO anon, authenticated
  USING (is_public AND public.is_tenant_published(tenant_id));
CREATE POLICY "tenant_settings managed by tenant" ON public.tenant_settings FOR ALL TO authenticated
  USING (public.has_tenant_access(tenant_id)) WITH CHECK (public.has_tenant_access(tenant_id));
CREATE TRIGGER trg_tenant_settings_updated BEFORE UPDATE ON public.tenant_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant ON public.tenant_settings (tenant_id);

-- =========================================================
-- Plans: features + limits
-- =========================================================
CREATE TABLE IF NOT EXISTS public.plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  key text NOT NULL,
  label text NOT NULL,
  description text,
  is_included boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, key)
);
GRANT SELECT ON public.plan_features TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.plan_features TO authenticated;
GRANT ALL ON public.plan_features TO service_role;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_features readable" ON public.plan_features FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "plan_features managed by super admin" ON public.plan_features FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_plan_features_updated BEFORE UPDATE ON public.plan_features FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_plan_features_plan ON public.plan_features (plan_id, sort_order);

CREATE TABLE IF NOT EXISTS public.plan_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  key text NOT NULL,
  limit_value integer,
  unit text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, key),
  CONSTRAINT plan_limits_value_valid CHECK (limit_value IS NULL OR limit_value >= -1)
);
GRANT SELECT ON public.plan_limits TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.plan_limits TO authenticated;
GRANT ALL ON public.plan_limits TO service_role;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_limits readable" ON public.plan_limits FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "plan_limits managed by super admin" ON public.plan_limits FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_plan_limits_updated BEFORE UPDATE ON public.plan_limits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_plan_limits_plan ON public.plan_limits (plan_id);

-- =========================================================
-- Agents: plans + usage
-- =========================================================
CREATE TABLE IF NOT EXISTS public.agent_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status entity_status NOT NULL DEFAULT 'active',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_id, plan_id, starts_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_plans TO authenticated;
GRANT ALL ON public.agent_plans TO service_role;
ALTER TABLE public.agent_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_plans visible to agent" ON public.agent_plans FOR SELECT TO authenticated
  USING (public.is_super_admin() OR agent_id IN (SELECT public.my_agent_ids()));
CREATE POLICY "agent_plans managed by super admin" ON public.agent_plans FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_agent_plans_updated BEFORE UPDATE ON public.agent_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_agent_plans_agent ON public.agent_plans (agent_id, status);

CREATE TABLE IF NOT EXISTS public.agent_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  tenant_count integer NOT NULL DEFAULT 0,
  order_count integer NOT NULL DEFAULT 0,
  storage_bytes bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_id, period_start),
  CONSTRAINT agent_usage_period_valid CHECK (period_end >= period_start),
  CONSTRAINT agent_usage_counts_valid CHECK (tenant_count >= 0 AND order_count >= 0 AND storage_bytes >= 0)
);
GRANT SELECT ON public.agent_usage TO authenticated;
GRANT ALL ON public.agent_usage TO service_role;
ALTER TABLE public.agent_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_usage visible to agent" ON public.agent_usage FOR SELECT TO authenticated
  USING (public.is_super_admin() OR agent_id IN (SELECT public.my_agent_ids()));
CREATE TRIGGER trg_agent_usage_updated BEFORE UPDATE ON public.agent_usage FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_agent_usage_agent_period ON public.agent_usage (agent_id, period_start DESC);

-- =========================================================
-- Sites (website + menu site per tenant)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  kind text NOT NULL,
  slug text NOT NULL,
  custom_domain text UNIQUE,
  theme_key text NOT NULL DEFAULT 'theme-01',
  default_locale text NOT NULL DEFAULT 'tr' REFERENCES public.languages(code) ON UPDATE CASCADE,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, kind),
  CONSTRAINT sites_kind_valid CHECK (kind IN ('website','menu')),
  CONSTRAINT sites_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]*$')
);
GRANT SELECT ON public.sites TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sites public read" ON public.sites FOR SELECT TO anon, authenticated
  USING (is_published AND deleted_at IS NULL AND public.is_tenant_published(tenant_id));
CREATE POLICY "sites managed by tenant" ON public.sites FOR ALL TO authenticated
  USING (public.has_tenant_access(tenant_id)) WITH CHECK (public.has_tenant_access(tenant_id));
CREATE TRIGGER trg_sites_updated BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_sites_tenant ON public.sites (tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_slug_kind ON public.sites (slug, kind) WHERE deleted_at IS NULL;

-- =========================================================
-- Theme / plugin settings (global when tenant_id IS NULL)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (theme_id, tenant_id, key)
);
GRANT SELECT ON public.theme_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.theme_settings TO authenticated;
GRANT ALL ON public.theme_settings TO service_role;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "theme_settings public read" ON public.theme_settings FOR SELECT TO anon, authenticated
  USING (tenant_id IS NULL OR public.is_tenant_published(tenant_id));
CREATE POLICY "theme_settings managed" ON public.theme_settings FOR ALL TO authenticated
  USING (CASE WHEN tenant_id IS NULL THEN public.is_super_admin() ELSE public.has_tenant_access(tenant_id) END)
  WITH CHECK (CASE WHEN tenant_id IS NULL THEN public.is_super_admin() ELSE public.has_tenant_access(tenant_id) END);
CREATE TRIGGER trg_theme_settings_updated BEFORE UPDATE ON public.theme_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_theme_settings_tenant ON public.theme_settings (tenant_id);
CREATE INDEX IF NOT EXISTS idx_theme_settings_theme ON public.theme_settings (theme_id);

CREATE TABLE IF NOT EXISTS public.plugin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id uuid NOT NULL REFERENCES public.plugins(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (plugin_id, tenant_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plugin_settings TO authenticated;
GRANT ALL ON public.plugin_settings TO service_role;
ALTER TABLE public.plugin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plugin_settings visible" ON public.plugin_settings FOR SELECT TO authenticated
  USING (tenant_id IS NULL OR public.has_tenant_access(tenant_id));
CREATE POLICY "plugin_settings managed" ON public.plugin_settings FOR ALL TO authenticated
  USING (CASE WHEN tenant_id IS NULL THEN public.is_super_admin() ELSE public.has_tenant_access(tenant_id) END)
  WITH CHECK (CASE WHEN tenant_id IS NULL THEN public.is_super_admin() ELSE public.has_tenant_access(tenant_id) END);
CREATE TRIGGER trg_plugin_settings_updated BEFORE UPDATE ON public.plugin_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_plugin_settings_tenant ON public.plugin_settings (tenant_id);
CREATE INDEX IF NOT EXISTS idx_plugin_settings_plugin ON public.plugin_settings (plugin_id);

-- =========================================================
-- Localized content (translations for any row/field)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.localized_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  entity_table text NOT NULL,
  entity_id uuid NOT NULL,
  field text NOT NULL,
  locale text NOT NULL REFERENCES public.languages(code) ON UPDATE CASCADE,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_table, entity_id, field, locale)
);
GRANT SELECT ON public.localized_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.localized_content TO authenticated;
GRANT ALL ON public.localized_content TO service_role;
ALTER TABLE public.localized_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "localized_content public read" ON public.localized_content FOR SELECT TO anon, authenticated
  USING (tenant_id IS NULL OR public.is_tenant_published(tenant_id));
CREATE POLICY "localized_content managed" ON public.localized_content FOR ALL TO authenticated
  USING (CASE WHEN tenant_id IS NULL THEN public.is_super_admin() ELSE public.has_tenant_access(tenant_id) END)
  WITH CHECK (CASE WHEN tenant_id IS NULL THEN public.is_super_admin() ELSE public.has_tenant_access(tenant_id) END);
CREATE TRIGGER trg_localized_content_updated BEFORE UPDATE ON public.localized_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_localized_content_lookup ON public.localized_content (entity_table, entity_id, locale);
CREATE INDEX IF NOT EXISTS idx_localized_content_tenant ON public.localized_content (tenant_id);

-- =========================================================
-- Brands + branch link
-- =========================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  logo_url text,
  cover_image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, slug),
  CONSTRAINT brands_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]*$')
);
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands public read" ON public.brands FOR SELECT TO anon, authenticated
  USING (is_active AND deleted_at IS NULL AND public.is_tenant_published(tenant_id));
CREATE POLICY "brands managed by tenant" ON public.brands FOR ALL TO authenticated
  USING (public.has_tenant_access(tenant_id)) WITH CHECK (public.has_tenant_access(tenant_id));
CREATE TRIGGER trg_brands_updated BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_brands_tenant ON public.brands (tenant_id, sort_order);

ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_branches_brand ON public.branches (brand_id);

-- =========================================================
-- Product options
-- =========================================================
CREATE TABLE IF NOT EXISTS public.product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  group_label text NOT NULL,
  name text NOT NULL,
  price_delta numeric(12,2) NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, group_label, name)
);
GRANT SELECT ON public.product_options TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_options TO authenticated;
GRANT ALL ON public.product_options TO service_role;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_options public read" ON public.product_options FOR SELECT TO anon, authenticated
  USING (is_active AND public.is_tenant_published(tenant_id));
CREATE POLICY "product_options managed by tenant" ON public.product_options FOR ALL TO authenticated
  USING (public.has_tenant_access(tenant_id)) WITH CHECK (public.has_tenant_access(tenant_id));
CREATE TRIGGER trg_product_options_updated BEFORE UPDATE ON public.product_options FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_product_options_product ON public.product_options (product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_options_tenant ON public.product_options (tenant_id);

-- =========================================================
-- Missing indexes on existing tables (avoid N+1 / full scans)
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_branches_tenant ON public.branches (tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_categories_tenant ON public.menu_categories (tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_tenant_status ON public.products (tenant_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_menus_tenant_status ON public.menus (tenant_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_products_menu ON public.menu_products (menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_products_product ON public.menu_products (product_id);
CREATE INDEX IF NOT EXISTS idx_product_features_product ON public.product_features (product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status ON public.campaigns (tenant_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_posts_tenant_status ON public.posts (tenant_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_categories_tenant ON public.post_categories (tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_awards_tenant ON public.awards (tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_galleries_tenant ON public.galleries (tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_slides_tenant ON public.slides (tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_site_sections_tenant ON public.site_sections (tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_site_navigation_tenant ON public.site_navigation (tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON public.orders (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_tenant ON public.order_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history (order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_tenant ON public.media (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_folders_tenant ON public.media_folders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON public.audit_logs (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_agent ON public.tenants (agent_id);
CREATE INDEX IF NOT EXISTS idx_tenants_owner ON public.tenants (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_translations_locale_ns ON public.translations (locale, namespace);
CREATE INDEX IF NOT EXISTS idx_landing_sections_locale ON public.landing_sections (locale, sort_order);
CREATE INDEX IF NOT EXISTS idx_landing_features_locale ON public.landing_features (locale, sort_order);
CREATE INDEX IF NOT EXISTS idx_landing_faqs_locale ON public.landing_faqs (locale, sort_order);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON public.subscriptions (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_agent ON public.subscriptions (agent_id, status);
CREATE INDEX IF NOT EXISTS idx_plugin_assignments_tenant ON public.plugin_assignments (tenant_id, is_enabled);
CREATE INDEX IF NOT EXISTS idx_theme_assignments_tenant ON public.theme_assignments (tenant_id);

-- =========================================================
-- Controlled seed
-- =========================================================
INSERT INTO public.roles (key, name, description, sort_order) VALUES
  ('super_admin', 'Platform yöneticisi', 'Tüm platformu yönetir', 1),
  ('agent',       'Bayi',                'Kendi markalarını yönetir', 2),
  ('tenant_owner','Marka sahibi',        'Kendi markasını yönetir', 3),
  ('tenant_staff','Marka personeli',     'Menü ve siparişleri yönetir', 4)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.permissions (key, module, action, description)
SELECT m.module || '.' || a.action, m.module, a.action, NULL
FROM (VALUES ('tenants'),('agents'),('plans'),('themes'),('plugins'),('menu'),('orders'),('content'),('media'),('leads'),('settings'),('i18n'),('users')) AS m(module)
CROSS JOIN (VALUES ('read'),('create'),('update'),('delete'),('manage')) AS a(action)
ON CONFLICT (key) DO NOTHING;

-- super_admin: everything
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.key = 'super_admin'
ON CONFLICT DO NOTHING;

-- agent: tenants + read-only platform catalog
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON true
WHERE r.key = 'agent'
  AND ((p.module = 'tenants' AND p.action <> 'delete')
    OR (p.module IN ('plans','themes','plugins') AND p.action = 'read')
    OR (p.module IN ('menu','orders','content','media','settings','users') AND p.action IN ('read','update')))
ON CONFLICT DO NOTHING;

-- tenant_owner: full control of own tenant content
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON true
WHERE r.key = 'tenant_owner'
  AND (p.module IN ('menu','orders','content','media','settings','users','i18n')
    OR (p.module IN ('plans','themes','plugins','tenants') AND p.action = 'read'))
ON CONFLICT DO NOTHING;

-- tenant_staff: day-to-day operations
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON true
WHERE r.key = 'tenant_staff'
  AND ((p.module IN ('menu','content','media') AND p.action IN ('read','create','update'))
    OR (p.module = 'orders' AND p.action IN ('read','update'))
    OR (p.module IN ('settings','tenants') AND p.action = 'read'))
ON CONFLICT DO NOTHING;

-- Backfill sites for existing tenants
INSERT INTO public.sites (tenant_id, kind, slug, theme_key, default_locale, is_published, published_at)
SELECT t.id, 'website', t.slug, t.website_theme, t.default_locale, t.is_published, CASE WHEN t.is_published THEN now() END
FROM public.tenants t WHERE t.deleted_at IS NULL
ON CONFLICT (tenant_id, kind) DO NOTHING;

INSERT INTO public.sites (tenant_id, kind, slug, theme_key, default_locale, is_published, published_at)
SELECT t.id, 'menu', t.slug, t.menu_theme, t.default_locale, t.is_published, CASE WHEN t.is_published THEN now() END
FROM public.tenants t WHERE t.deleted_at IS NULL
ON CONFLICT (tenant_id, kind) DO NOTHING;

-- Backfill tenant_users from existing role assignments and tenant owners
INSERT INTO public.tenant_users (tenant_id, user_id, role)
SELECT ur.tenant_id, ur.user_id, ur.role
FROM public.user_roles ur
WHERE ur.tenant_id IS NOT NULL AND ur.role IN ('tenant_owner','tenant_staff')
ON CONFLICT (tenant_id, user_id) DO NOTHING;

INSERT INTO public.tenant_users (tenant_id, user_id, role)
SELECT t.id, t.owner_user_id, 'tenant_owner'
FROM public.tenants t
WHERE t.owner_user_id IS NOT NULL AND t.deleted_at IS NULL
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- Plan features/limits derived from existing jsonb plan data (idempotent)
INSERT INTO public.plan_features (plan_id, key, label, sort_order)
SELECT p.id, 'feature_' || (f.ord - 1), f.value, f.ord - 1
FROM public.plans p
CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(p.features) = 'array' THEN p.features ELSE '[]'::jsonb END) WITH ORDINALITY AS f(value, ord)
ON CONFLICT (plan_id, key) DO NOTHING;

INSERT INTO public.plan_limits (plan_id, key, limit_value)
SELECT p.id, l.key, CASE WHEN jsonb_typeof(l.value) = 'number' THEN (l.value #>> '{}')::int ELSE NULL END
FROM public.plans p
CROSS JOIN LATERAL jsonb_each(CASE WHEN jsonb_typeof(p.limits) = 'object' THEN p.limits ELSE '{}'::jsonb END) AS l(key, value)
ON CONFLICT (plan_id, key) DO NOTHING;