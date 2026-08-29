-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TYPE public.app_role AS ENUM ('super_admin','agent','tenant_owner','tenant_staff');
CREATE TYPE public.plan_kind AS ENUM ('agent','tenant');
CREATE TYPE public.theme_scope AS ENUM ('superadmin','restaurant','menu');
CREATE TYPE public.entity_status AS ENUM ('active','suspended','pending','cancelled');
CREATE TYPE public.content_status AS ENUM ('draft','published','archived');

-- ============ profiles ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  locale text NOT NULL DEFAULT 'tr',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ plans ============
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.plan_kind NOT NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_yearly numeric(10,2),
  currency text NOT NULL DEFAULT 'TRY',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ agents ============
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  contact_email text,
  contact_phone text,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  tenant_quota int NOT NULL DEFAULT 5 CHECK (tenant_quota >= 0),
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX idx_agents_owner ON public.agents(owner_user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO authenticated;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_agents_updated BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ tenants ============
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  custom_domain text UNIQUE,
  status public.entity_status NOT NULL DEFAULT 'active',
  is_published boolean NOT NULL DEFAULT false,
  default_locale text NOT NULL DEFAULT 'tr',
  website_theme text NOT NULL DEFAULT 'theme-01',
  menu_theme text NOT NULL DEFAULT 'theme-01',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX idx_tenants_agent ON public.tenants(agent_id);
CREATE INDEX idx_tenants_owner ON public.tenants(owner_user_id);
CREATE INDEX idx_tenants_slug ON public.tenants(slug);
GRANT SELECT ON public.tenants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ roles / memberships ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_user_roles_unique ON public.user_roles(user_id, role, COALESCE(agent_id,'00000000-0000-0000-0000-000000000000'::uuid), COALESCE(tenant_id,'00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_tenant ON public.user_roles(tenant_id);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.my_agent_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id FROM public.agents a WHERE a.owner_user_id = auth.uid()
  UNION
  SELECT ur.agent_id FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'agent' AND ur.agent_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_access(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin()
    OR EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = _tenant_id AND t.owner_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.tenant_id = _tenant_id)
    OR EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = _tenant_id AND t.agent_id IN (SELECT public.my_agent_ids()));
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_published(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = _tenant_id AND t.is_published AND t.status = 'active' AND t.deleted_at IS NULL);
$$;

-- profiles policies
CREATE POLICY profiles_self_select ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_super_admin());
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_super_admin()) WITH CHECK (id = auth.uid() OR public.is_super_admin());
CREATE POLICY profiles_self_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- user_roles policies
CREATE POLICY user_roles_read ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_super_admin());

-- plans policies
CREATE POLICY plans_public_read ON public.plans FOR SELECT USING (is_active OR public.is_super_admin());
CREATE POLICY plans_admin_write ON public.plans FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- agents policies
CREATE POLICY agents_read ON public.agents FOR SELECT TO authenticated USING (public.is_super_admin() OR id IN (SELECT public.my_agent_ids()));
CREATE POLICY agents_admin_write ON public.agents FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY agents_self_update ON public.agents FOR UPDATE TO authenticated USING (id IN (SELECT public.my_agent_ids())) WITH CHECK (id IN (SELECT public.my_agent_ids()));

-- tenants policies
CREATE POLICY tenants_public_read ON public.tenants FOR SELECT USING (is_published AND status = 'active' AND deleted_at IS NULL);
CREATE POLICY tenants_member_read ON public.tenants FOR SELECT TO authenticated USING (public.has_tenant_access(id));
CREATE POLICY tenants_member_update ON public.tenants FOR UPDATE TO authenticated USING (public.has_tenant_access(id)) WITH CHECK (public.has_tenant_access(id));
CREATE POLICY tenants_admin_all ON public.tenants FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY tenants_agent_insert ON public.tenants FOR INSERT TO authenticated WITH CHECK (
  agent_id IN (SELECT public.my_agent_ids())
  AND (SELECT count(*) FROM public.tenants t WHERE t.agent_id = tenants.agent_id AND t.deleted_at IS NULL)
      < COALESCE((SELECT a.tenant_quota FROM public.agents a WHERE a.id = tenants.agent_id), 0)
);

-- subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  status public.entity_status NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (agent_id IS NOT NULL OR tenant_id IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subs_read ON public.subscriptions FOR SELECT TO authenticated USING (public.is_super_admin() OR (tenant_id IS NOT NULL AND public.has_tenant_access(tenant_id)) OR (agent_id IN (SELECT public.my_agent_ids())));
CREATE POLICY subs_admin ON public.subscriptions FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ themes ============
CREATE TABLE public.themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope public.theme_scope NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  version text NOT NULL DEFAULT '1.0.0',
  preview_image_url text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scope, slug)
);
GRANT SELECT ON public.themes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.themes TO authenticated;
GRANT ALL ON public.themes TO service_role;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY themes_public_read ON public.themes FOR SELECT USING (is_active OR public.is_super_admin());
CREATE POLICY themes_admin ON public.themes FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_themes_updated BEFORE UPDATE ON public.themes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.theme_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (plan_id IS NOT NULL OR tenant_id IS NOT NULL)
);
GRANT SELECT ON public.theme_assignments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.theme_assignments TO authenticated;
GRANT ALL ON public.theme_assignments TO service_role;
ALTER TABLE public.theme_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY theme_assign_read ON public.theme_assignments FOR SELECT USING (true);
CREATE POLICY theme_assign_admin ON public.theme_assignments FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- ============ plugins ============
CREATE TABLE public.plugins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('superadmin','agent','tenant')),
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  version text NOT NULL DEFAULT '1.0.0',
  manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scope, slug)
);
GRANT SELECT ON public.plugins TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plugins TO authenticated;
GRANT ALL ON public.plugins TO service_role;
ALTER TABLE public.plugins ENABLE ROW LEVEL SECURITY;
CREATE POLICY plugins_public_read ON public.plugins FOR SELECT USING (is_active OR public.is_super_admin());
CREATE POLICY plugins_admin ON public.plugins FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_plugins_updated BEFORE UPDATE ON public.plugins FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.plugin_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id uuid NOT NULL REFERENCES public.plugins(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plugin_assignments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plugin_assignments TO authenticated;
GRANT ALL ON public.plugin_assignments TO service_role;
ALTER TABLE public.plugin_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY plugin_assign_read ON public.plugin_assignments FOR SELECT USING (true);
CREATE POLICY plugin_assign_admin ON public.plugin_assignments FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_plugin_assign_updated BEFORE UPDATE ON public.plugin_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ i18n ============
CREATE TABLE public.languages (
  code text PRIMARY KEY,
  name text NOT NULL,
  native_name text NOT NULL,
  flag text,
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.languages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.languages TO authenticated;
GRANT ALL ON public.languages TO service_role;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY languages_public_read ON public.languages FOR SELECT USING (is_active OR public.is_super_admin());
CREATE POLICY languages_admin ON public.languages FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE TABLE public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  namespace text NOT NULL DEFAULT 'common',
  key text NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (locale, namespace, key)
);
CREATE INDEX idx_translations_locale_ns ON public.translations(locale, namespace);
GRANT SELECT ON public.translations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.translations TO authenticated;
GRANT ALL ON public.translations TO service_role;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY translations_public_read ON public.translations FOR SELECT USING (true);
CREATE POLICY translations_admin ON public.translations FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_translations_updated BEFORE UPDATE ON public.translations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SaaS landing content ============
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL DEFAULT 'tr',
  message text NOT NULL,
  link_label text,
  link_href text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY announcements_read ON public.announcements FOR SELECT USING (is_active OR public.is_super_admin());
CREATE POLICY announcements_admin ON public.announcements FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.landing_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL DEFAULT 'tr',
  key text NOT NULL,
  eyebrow text,
  title text,
  subtitle text,
  body text,
  media_url text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (locale, key)
);
GRANT SELECT ON public.landing_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_sections TO authenticated;
GRANT ALL ON public.landing_sections TO service_role;
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY landing_sections_read ON public.landing_sections FOR SELECT USING (is_active OR public.is_super_admin());
CREATE POLICY landing_sections_admin ON public.landing_sections FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_landing_sections_updated BEFORE UPDATE ON public.landing_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.landing_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL DEFAULT 'tr',
  section_key text NOT NULL DEFAULT 'features',
  icon text,
  title text NOT NULL,
  description text,
  detail_html text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.landing_features TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_features TO authenticated;
GRANT ALL ON public.landing_features TO service_role;
ALTER TABLE public.landing_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY landing_features_read ON public.landing_features FOR SELECT USING (is_active OR public.is_super_admin());
CREATE POLICY landing_features_admin ON public.landing_features FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_landing_features_updated BEFORE UPDATE ON public.landing_features FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.landing_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL DEFAULT 'tr',
  question text NOT NULL,
  answer text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.landing_faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_faqs TO authenticated;
GRANT ALL ON public.landing_faqs TO service_role;
ALTER TABLE public.landing_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY landing_faqs_read ON public.landing_faqs FOR SELECT USING (is_active OR public.is_super_admin());
CREATE POLICY landing_faqs_admin ON public.landing_faqs FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_landing_faqs_updated BEFORE UPDATE ON public.landing_faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  message text,
  plan_slug text,
  source text NOT NULL DEFAULT 'landing',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY leads_insert_any ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY leads_admin_read ON public.leads FOR SELECT TO authenticated USING (public.is_super_admin());
CREATE POLICY leads_admin_write ON public.leads FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- ============ system ============
CREATE TABLE public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY system_settings_read ON public.system_settings FOR SELECT USING (is_public OR public.is_super_admin());
CREATE POLICY system_settings_admin ON public.system_settings FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  module text NOT NULL,
  action text NOT NULL,
  record_id text,
  before_data jsonb,
  after_data jsonb,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_tenant ON public.audit_logs(tenant_id, created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_read ON public.audit_logs FOR SELECT TO authenticated USING (public.is_super_admin() OR (tenant_id IS NOT NULL AND public.has_tenant_access(tenant_id)));
CREATE POLICY audit_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  href text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_own ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_super_admin()) WITH CHECK (user_id = auth.uid() OR public.is_super_admin());