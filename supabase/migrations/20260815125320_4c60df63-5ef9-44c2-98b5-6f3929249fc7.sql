-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.stock_state AS ENUM ('unverified', 'in_stock', 'out_of_stock');
CREATE TYPE public.payment_state AS ENUM ('payment_pending', 'verification_pending', 'paid', 'refunded', 'failed');
CREATE TYPE public.order_state AS ENUM ('payment_pending', 'verification_pending', 'paid', 'processing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled', 'refunded');
CREATE TYPE public.product_condition AS ENUM ('new', 'refurbished', 'used');

-- UTIL
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_roles_admin_select" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Signup handler: create profile, and make the very first user an admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', NEW.email)
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (is_active AND NOT is_archived);
CREATE POLICY "categories_admin_read" ON public.categories FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  brand TEXT,
  condition public.product_condition NOT NULL DEFAULT 'new',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(12,2) CHECK (compare_at_price >= 0),
  warranty TEXT,
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  stock_state public.stock_state NOT NULL DEFAULT 'unverified',
  low_stock_threshold INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  needs_review BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_active_idx ON public.products(is_active, is_archived);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (is_active AND NOT is_archived);
CREATE POLICY "products_admin_read" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCT IMAGES
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_idx ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT TO anon, authenticated USING (true);

-- ORDERS
CREATE SEQUENCE public.order_number_seq START 1001;
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  pincode TEXT NOT NULL,
  notes TEXT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'upi_manual',
  payment_status public.payment_state NOT NULL DEFAULT 'payment_pending',
  order_status public.order_state NOT NULL DEFAULT 'payment_pending',
  upi_reference TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_idx ON public.orders(user_id);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "orders_admin_select" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ORDER ITEMS (price/name snapshot at purchase time)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_slug TEXT,
  unit_price NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_idx ON public.order_items(order_id);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order_items_admin_select" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- PAYMENT RECORDS
CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'upi_manual',
  amount NUMERIC(12,2) NOT NULL,
  reference TEXT,
  status public.payment_state NOT NULL DEFAULT 'payment_pending',
  submitted_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX payment_records_order_idx ON public.payment_records(order_id);
GRANT SELECT ON public.payment_records TO authenticated;
GRANT ALL ON public.payment_records TO service_role;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_records_select_own" ON public.payment_records FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "payment_records_admin_select" ON public.payment_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER payment_records_updated_at BEFORE UPDATE ON public.payment_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BUSINESS SETTINGS (single row)
CREATE TABLE public.business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE CHECK (singleton),
  business_name TEXT NOT NULL DEFAULT 'All Tech IT Solution',
  tagline TEXT,
  logo_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  google_maps_url TEXT,
  business_hours TEXT,
  gst_number TEXT,
  upi_id TEXT,
  upi_payee_name TEXT,
  upi_qr_url TEXT,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_policy TEXT,
  warranty_policy TEXT,
  refund_policy TEXT,
  cancellation_policy TEXT,
  privacy_policy TEXT,
  terms TEXT,
  about_text TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_settings TO anon, authenticated;
GRANT ALL ON public.business_settings TO service_role;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "business_settings_public_read" ON public.business_settings FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER business_settings_updated_at BEFORE UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ORDER PLACEMENT: atomic stock check + decrement, server-computed totals
CREATE OR REPLACE FUNCTION public.place_order(
  _items JSONB,
  _customer_name TEXT,
  _phone TEXT,
  _email TEXT,
  _address_line1 TEXT,
  _address_line2 TEXT,
  _city TEXT,
  _state TEXT,
  _pincode TEXT,
  _notes TEXT,
  _user_id UUID
) RETURNS TABLE (order_id UUID, order_number TEXT, total NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _item JSONB;
  _product public.products;
  _qty INTEGER;
  _subtotal NUMERIC(12,2) := 0;
  _fee NUMERIC(12,2) := 0;
  _order_id UUID;
  _order_number TEXT;
BEGIN
  IF _items IS NULL OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;

  SELECT COALESCE(bs.delivery_fee, 0) INTO _fee FROM public.business_settings bs LIMIT 1;
  _fee := COALESCE(_fee, 0);

  _order_number := 'ATS-' || to_char(now(), 'YYYY') || '-' || nextval('public.order_number_seq');

  INSERT INTO public.orders (
    order_number, user_id, customer_name, phone, email,
    address_line1, address_line2, city, state, pincode, notes,
    subtotal, delivery_fee, total
  ) VALUES (
    _order_number, _user_id, _customer_name, _phone, NULLIF(_email, ''),
    _address_line1, NULLIF(_address_line2, ''), _city, COALESCE(NULLIF(_state, ''), 'Maharashtra'), _pincode, NULLIF(_notes, ''),
    0, _fee, 0
  ) RETURNING id INTO _order_id;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := GREATEST(1, COALESCE((_item->>'quantity')::INTEGER, 1));

    SELECT * INTO _product FROM public.products
      WHERE id = (_item->>'product_id')::UUID FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'A product in your cart is no longer available.';
    END IF;

    IF NOT _product.is_active OR _product.is_archived THEN
      RAISE EXCEPTION '% is no longer available.', _product.name;
    END IF;

    IF _product.stock_state <> 'in_stock' OR _product.stock_quantity < _qty THEN
      RAISE EXCEPTION 'Only % unit(s) of % are available right now.', _product.stock_quantity, _product.name;
    END IF;

    UPDATE public.products
      SET stock_quantity = stock_quantity - _qty,
          stock_state = CASE WHEN stock_quantity - _qty <= 0 THEN 'out_of_stock'::public.stock_state ELSE stock_state END
      WHERE id = _product.id;

    INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, unit_price, quantity, line_total)
    VALUES (_order_id, _product.id, _product.name, _product.slug, _product.price, _qty, _product.price * _qty);

    _subtotal := _subtotal + (_product.price * _qty);
  END LOOP;

  UPDATE public.orders SET subtotal = _subtotal, total = _subtotal + _fee WHERE id = _order_id;

  INSERT INTO public.payment_records (order_id, provider, amount, status)
  VALUES (_order_id, 'upi_manual', _subtotal + _fee, 'payment_pending');

  RETURN QUERY SELECT _order_id, _order_number, (_subtotal + _fee)::NUMERIC;
END; $$;

REVOKE ALL ON FUNCTION public.place_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO service_role;

-- STORAGE: product images bucket policies (bucket created via tooling)
CREATE POLICY "product_images_public_view" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');
CREATE POLICY "product_images_admin_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "product_images_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "product_images_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));