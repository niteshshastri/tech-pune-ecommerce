CREATE OR REPLACE FUNCTION public.place_order(_items jsonb, _customer_name text, _phone text, _email text, _address_line1 text, _address_line2 text, _city text, _state text, _pincode text, _notes text, _user_id uuid)
 RETURNS TABLE(order_id uuid, order_number text, total numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

    IF _product.stock_state = 'out_of_stock' THEN
      RAISE EXCEPTION '% is currently out of stock.', _product.name;
    END IF;

    IF _product.stock_state = 'in_stock' THEN
      IF _product.stock_quantity < _qty THEN
        RAISE EXCEPTION 'Only % unit(s) of % are available right now.', _product.stock_quantity, _product.name;
      END IF;

      UPDATE public.products
        SET stock_quantity = stock_quantity - _qty,
            stock_state = CASE WHEN stock_quantity - _qty <= 0 THEN 'out_of_stock'::public.stock_state ELSE stock_state END
        WHERE id = _product.id;
    END IF;

    INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, unit_price, quantity, line_total)
    VALUES (_order_id, _product.id, _product.name, _product.slug, _product.price, _qty, _product.price * _qty);

    _subtotal := _subtotal + (_product.price * _qty);
  END LOOP;

  UPDATE public.orders SET subtotal = _subtotal, total = _subtotal + _fee WHERE id = _order_id;

  INSERT INTO public.payment_records (order_id, provider, amount, status)
  VALUES (_order_id, 'upi_manual', _subtotal + _fee, 'payment_pending');

  RETURN QUERY SELECT _order_id, _order_number, (_subtotal + _fee)::NUMERIC;
END; $function$;

REVOKE ALL ON FUNCTION public.place_order(jsonb, text, text, text, text, text, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, text, text, text, text, text, text, text, text, text, uuid) TO service_role;