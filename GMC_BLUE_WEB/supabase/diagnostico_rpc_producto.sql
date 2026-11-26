-- GMC BLUE | Diagnóstico del producto y de la función RPC desplegada
SELECT id, name, sku, price, active
FROM public.products
WHERE sku = '1000L-IBC'
   OR id = 'f9e57a6c-ce47-4f7d-ac3f-4fd8e656e8eb'::uuid;

SELECT pg_get_functiondef('public.gmc_create_order(jsonb,text)'::regprocedure) AS definicion_rpc;

SELECT
  routine_schema,
  routine_name,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'gmc_create_order';
