-- site settings
CREATE TABLE public.site_settings (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  logo_url text, favicon_url text, hero_image_url text,
  brand_color text, accent_color text,
  contact_phone text, whatsapp text, contact_email text,
  address text, map_embed_url text, latitude numeric(10,7), longitude numeric(10,7),
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  topbar jsonb NOT NULL DEFAULT '{"enabled":false,"rows":[]}'::jsonb,
  header_buttons jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_enabled boolean NOT NULL DEFAULT false,
  order_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_title text, seo_description text, og_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  key text NOT NULL,
  eyebrow text, title text, subtitle text, body text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, key)
);
CREATE TRIGGER trg_site_sections_updated BEFORE UPDATE ON public.site_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_navigation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  label text NOT NULL, href text NOT NULL,
  target text NOT NULL DEFAULT '_self',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_site_nav_updated BEFORE UPDATE ON public.site_navigation FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  image_url text, eyebrow text, title text, description text,
  button_label text, button_href text, button_target text NOT NULL DEFAULT '_self',
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_slides_updated BEFORE UPDATE ON public.slides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL, description text, icon text, image_url text, detail_html text,
  is_active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_awards_updated BEFORE UPDATE ON public.awards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL, slug text NOT NULL,
  cover_image_url text, gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  address text, city text, phone text, whatsapp text,
  latitude numeric(10,7), longitude numeric(10,7),
  directions_url text, map_embed_url text,
  opening_hours jsonb NOT NULL DEFAULT '[]'::jsonb,
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, slug)
);
CREATE INDEX idx_branches_tenant ON public.branches(tenant_id);
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  title text NOT NULL, slug text NOT NULL, excerpt text, description text,
  image_url text, badge text, category text,
  starts_at date, ends_at date,
  status public.content_status NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, slug)
);
CREATE INDEX idx_campaigns_tenant ON public.campaigns(tenant_id, status);
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.post_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL, slug text NOT NULL, sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.post_categories(id) ON DELETE SET NULL,
  title text NOT NULL, slug text NOT NULL, excerpt text, content text,
  image_url text, badge text,
  badge_position text NOT NULL DEFAULT 'top-left' CHECK (badge_position IN ('top-left','top-right','bottom-left')),
  view_count int NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, slug)
);
CREATE INDEX idx_posts_tenant ON public.posts(tenant_id, status, published_at DESC);
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL, slug text NOT NULL, description text, image_url text, color text,
  is_active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);
CREATE TRIGGER trg_menu_categories_updated BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL, slug text NOT NULL,
  short_description text, description text,
  price numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'TRY',
  image_url text,
  badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_special boolean NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, slug)
);
CREATE INDEX idx_products_tenant ON public.products(tenant_id, status);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  label text NOT NULL, value text, icon text,
  show_on_card boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_features_product ON public.product_features(product_id);

CREATE TABLE public.menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL, slug text NOT NULL,
  short_description text, description text,
  price numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'TRY',
  image_url text,
  badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_special boolean NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, slug)
);
CREATE INDEX idx_menus_tenant ON public.menus(tenant_id, status);
CREATE TRIGGER trg_menus_updated BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.menu_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (menu_id, product_id)
);
CREATE INDEX idx_menu_products_product ON public.menu_products(product_id);

CREATE TABLE public.galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL, items jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_galleries_updated BEFORE UPDATE ON public.galleries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.media_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.media_folders(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.media_folders(id) ON DELETE SET NULL,
  storage_path text NOT NULL, file_name text NOT NULL,
  mime_type text, size_bytes bigint, width int, height int, alt_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_tenant ON public.media(tenant_id);
CREATE TRIGGER trg_media_updated BEFORE UPDATE ON public.media FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  code text NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  table_no text, customer_name text, customer_phone text, note text,
  total numeric(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  currency text NOT NULL DEFAULT 'TRY',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','preparing','delivered','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);
CREATE INDEX idx_orders_tenant ON public.orders(tenant_id, created_at DESC);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  menu_id uuid REFERENCES public.menus(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== grants + RLS =====
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['site_settings','site_sections','site_navigation','slides','awards','branches','campaigns','post_categories','posts','menu_categories','products','product_features','menus','menu_products','galleries','media_folders','media','orders','order_items','order_status_history']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon;', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.has_tenant_access(tenant_id)) WITH CHECK (public.has_tenant_access(tenant_id));', t||'_team_all', t);
  END LOOP;
END $$;

-- public read policies (published tenants only)
CREATE POLICY site_settings_public ON public.site_settings FOR SELECT USING (public.is_tenant_published(tenant_id));
CREATE POLICY site_sections_public ON public.site_sections FOR SELECT USING (is_active AND public.is_tenant_published(tenant_id));
CREATE POLICY site_navigation_public ON public.site_navigation FOR SELECT USING (is_active AND public.is_tenant_published(tenant_id));
CREATE POLICY slides_public ON public.slides FOR SELECT USING (is_active AND public.is_tenant_published(tenant_id));
CREATE POLICY awards_public ON public.awards FOR SELECT USING (is_active AND public.is_tenant_published(tenant_id));
CREATE POLICY branches_public ON public.branches FOR SELECT USING (is_active AND deleted_at IS NULL AND public.is_tenant_published(tenant_id));
CREATE POLICY campaigns_public ON public.campaigns FOR SELECT USING (status = 'published' AND deleted_at IS NULL AND public.is_tenant_published(tenant_id));
CREATE POLICY post_categories_public ON public.post_categories FOR SELECT USING (is_active AND public.is_tenant_published(tenant_id));
CREATE POLICY posts_public ON public.posts FOR SELECT USING (status = 'published' AND deleted_at IS NULL AND public.is_tenant_published(tenant_id));
CREATE POLICY menu_categories_public ON public.menu_categories FOR SELECT USING (is_active AND public.is_tenant_published(tenant_id));
CREATE POLICY products_public ON public.products FOR SELECT USING (status = 'published' AND deleted_at IS NULL AND public.is_tenant_published(tenant_id));
CREATE POLICY product_features_public ON public.product_features FOR SELECT USING (public.is_tenant_published(tenant_id));
CREATE POLICY menus_public ON public.menus FOR SELECT USING (status = 'published' AND deleted_at IS NULL AND public.is_tenant_published(tenant_id));
CREATE POLICY menu_products_public ON public.menu_products FOR SELECT USING (public.is_tenant_published(tenant_id));
CREATE POLICY galleries_public ON public.galleries FOR SELECT USING (is_active AND public.is_tenant_published(tenant_id));

-- guest ordering
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.order_items TO anon;
CREATE POLICY orders_guest_insert ON public.orders FOR INSERT WITH CHECK (public.is_tenant_published(tenant_id));
CREATE POLICY order_items_guest_insert ON public.order_items FOR INSERT WITH CHECK (public.is_tenant_published(tenant_id));

-- view counter
CREATE OR REPLACE FUNCTION public.increment_post_views(_post_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.posts SET view_count = view_count + 1
  WHERE id = _post_id AND status = 'published' AND deleted_at IS NULL;
END; $$;
GRANT EXECUTE ON FUNCTION public.increment_post_views(uuid) TO anon, authenticated;