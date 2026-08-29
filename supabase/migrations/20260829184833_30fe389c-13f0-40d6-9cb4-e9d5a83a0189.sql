-- Orders are created through one transactional function so that prices are
-- re-read from the database (never trusted from the browser), the plan feature
-- gate applies, and order + items + status history stay consistent.

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'));

-- Status history is written by the database, not by clients.
CREATE OR REPLACE FUNCTION public.log_order_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_status_history (order_id, tenant_id, status, changed_by)
    VALUES (NEW.id, NEW.tenant_id, NEW.status, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, tenant_id, status, changed_by)
    VALUES (NEW.id, NEW.tenant_id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_status_history ON public.orders;
CREATE TRIGGER trg_orders_status_history
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_order_status();

CREATE OR REPLACE FUNCTION public.place_order(
  _tenant_id uuid,
  _items jsonb,
  _customer_name text,
  _customer_phone text,
  _branch_id uuid DEFAULT NULL,
  _table_no text DEFAULT NULL,
  _note text DEFAULT NULL
)
RETURNS TABLE(id uuid, code text, total numeric, currency text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _item jsonb;
  _order_id uuid;
  _total numeric(12,2) := 0;
  _currency text := 'TRY';
  _qty int;
  _name text;
  _price numeric(12,2);
  _product_id uuid;
  _menu_id uuid;
  _count int;
BEGIN
  IF NOT public.is_tenant_published(_tenant_id) THEN
    RAISE EXCEPTION 'Bu marka şu anda sipariş alamıyor.' USING ERRCODE = 'check_violation';
  END IF;

  IF NOT public.tenant_feature_enabled(_tenant_id, 'orders') THEN
    RAISE EXCEPTION 'Sipariş özelliği bu markanın planında kapalı.' USING ERRCODE = 'check_violation';
  END IF;

  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Sepetiniz boş.' USING ERRCODE = 'check_violation';
  END IF;

  IF jsonb_array_length(_items) > 50 THEN
    RAISE EXCEPTION 'Sepette en fazla 50 farklı kalem olabilir.' USING ERRCODE = 'check_violation';
  END IF;

  IF coalesce(length(btrim(_customer_name)), 0) < 2 THEN
    RAISE EXCEPTION 'Lütfen adınızı girin.' USING ERRCODE = 'check_violation';
  END IF;

  IF coalesce(length(btrim(_customer_phone)), 0) < 7 THEN
    RAISE EXCEPTION 'Lütfen geçerli bir telefon numarası girin.' USING ERRCODE = 'check_violation';
  END IF;

  IF _branch_id IS NOT NULL THEN
    SELECT count(*) INTO _count FROM public.branches b
      WHERE b.id = _branch_id AND b.tenant_id = _tenant_id AND b.deleted_at IS NULL;
    IF _count = 0 THEN
      RAISE EXCEPTION 'Şube bulunamadı.' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  INSERT INTO public.orders (tenant_id, branch_id, table_no, customer_name, customer_phone, note, total, status)
  VALUES (_tenant_id, _branch_id, nullif(btrim(coalesce(_table_no, '')), ''),
          btrim(_customer_name), btrim(_customer_phone),
          nullif(btrim(coalesce(_note, '')), ''), 0, 'new')
  RETURNING orders.id, orders.currency INTO _order_id, _currency;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := coalesce((_item->>'quantity')::int, 0);
    IF _qty < 1 OR _qty > 50 THEN
      RAISE EXCEPTION 'Geçersiz adet.' USING ERRCODE = 'check_violation';
    END IF;

    _product_id := nullif(_item->>'product_id', '')::uuid;
    _menu_id := nullif(_item->>'menu_id', '')::uuid;
    _name := NULL;

    IF _product_id IS NOT NULL THEN
      SELECT p.name, p.price, p.currency INTO _name, _price, _currency
      FROM public.products p
      WHERE p.id = _product_id AND p.tenant_id = _tenant_id
        AND p.status = 'published' AND p.deleted_at IS NULL;
    ELSIF _menu_id IS NOT NULL THEN
      SELECT m.name, m.price, m.currency INTO _name, _price, _currency
      FROM public.menus m
      WHERE m.id = _menu_id AND m.tenant_id = _tenant_id
        AND m.status = 'published' AND m.deleted_at IS NULL;
    END IF;

    IF _name IS NULL THEN
      RAISE EXCEPTION 'Sepetteki bir ürün artık satışta değil. Lütfen sepetinizi güncelleyin.'
        USING ERRCODE = 'check_violation';
    END IF;

    INSERT INTO public.order_items (order_id, tenant_id, product_id, menu_id, item_name, unit_price, quantity, note)
    VALUES (_order_id, _tenant_id, _product_id, _menu_id, _name, _price, _qty,
            nullif(btrim(coalesce(_item->>'note', '')), ''));

    _total := _total + (_price * _qty);
  END LOOP;

  UPDATE public.orders o SET total = _total, currency = _currency WHERE o.id = _order_id;

  RETURN QUERY
    SELECT o.id, o.code, o.total, o.currency FROM public.orders o WHERE o.id = _order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order(uuid, jsonb, text, text, uuid, text, text) TO anon, authenticated;