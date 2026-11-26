-- GMC BLUE | Actualizar precio del Contenedor IBC 1,000 L
-- Ejecutar en Supabase SQL Editor, en el proyecto agogxfbehbnfdoqgoocf.
-- Actualiza por SKU y devuelve el UUID real afectado.
UPDATE public.products
SET price = 1600
WHERE sku = '1000L-IBC'
  AND active = TRUE
RETURNING id, name, sku, price, active;

-- Verificación independiente del resultado:
SELECT id, name, sku, price, active
FROM public.products
WHERE sku = '1000L-IBC';
