-- GMC BLUE · Registro transaccional de pedidos
-- Ejecutar una sola vez en Supabase SQL Editor después de revisar el archivo.
-- Usa las tablas y políticas RLS existentes. No crea tablas ni cambia grants/RLS.

CREATE OR REPLACE FUNCTION public.gmc_create_order(
  p_items jsonb,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_item record;
  v_product record;
  v_total numeric(12,2) := 0;
  v_count integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para registrar un pedido.' USING ERRCODE = '28000';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'El carrito está vacío.' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'El pedido supera el máximo de 50 líneas.' USING ERRCODE = '22023';
  END IF;

  -- Primera pasada: validar cada producto y calcular el total usando precios de BD.
  FOR v_item IN
    SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer)
  LOOP
    v_count := v_count + 1;
    IF v_item.product_id IS NULL OR v_item.quantity IS NULL OR v_item.quantity < 1 OR v_item.quantity > 9999 THEN
      RAISE EXCEPTION 'Producto o cantidad no válida.' USING ERRCODE = '22023';
    END IF;
    SELECT id, name, price INTO v_product
    FROM public.products
    WHERE id = v_item.product_id AND active = true
    FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Uno de los productos ya no está disponible.' USING ERRCODE = '22023';
    END IF;
    v_total := v_total + (v_product.price * v_item.quantity);
  END LOOP;

  IF v_count = 0 THEN
    RAISE EXCEPTION 'El carrito está vacío.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.orders (user_id, status, total, notes)
  VALUES (v_user_id, 'pending', v_total, NULLIF(left(coalesce(p_notes, ''), 2000), ''))
  RETURNING id INTO v_order_id;

  -- Segunda pasada: guardar el nombre y precio unitario vigentes como fotografía del pedido.
  FOR v_item IN
    SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer)
  LOOP
    SELECT id, name, price INTO v_product
    FROM public.products
    WHERE id = v_item.product_id AND active = true;
    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price)
    VALUES (v_order_id, v_product.id, v_product.name, v_item.quantity, v_product.price);
  END LOOP;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.gmc_create_order(jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gmc_create_order(jsonb, text) TO authenticated;
