-- GMC BLUE · Catálogo inicial del prototipo
-- Ejecutar una sola vez en Supabase SQL Editor.
-- No crea tablas, no modifica RLS y no toca usuarios/roles.

BEGIN;

-- Permiso mínimo para que la web pueda leer productos mediante Data API.
-- RLS sigue controlando qué filas pueden verse.
GRANT SELECT ON TABLE public.products TO anon, authenticated;

-- Carga de los cuatro productos del prototipo.
-- Se evita duplicarlos por SKU si el script se ejecuta nuevamente.
INSERT INTO public.products (name, sku, description, price, image_url, active)
SELECT v.name, v.sku, v.description, v.price, v.image_url, v.active
FROM (VALUES
  ('Bidón automotriz 20 L', '20L-BIDON', 'Presentación práctica para abastecimiento y reposición.', 65, 'assets/bidon_gmc.jpg', true),
  ('Caja de urea 20 L', '20L-CAJA', 'Alternativa compacta para almacenamiento y distribución.', 58, 'assets/caja_gmc.jpg', true),
  ('Cilindro industrial 208 L', '208L-CILINDRO', 'Para operaciones con una demanda de abastecimiento mayor.', 529, 'assets/cilindro_gmc.jpg', true),
  ('Contenedor IBC 1,000 L', '1000L-IBC', 'Formato de gran capacidad para flotas y puntos de abastecimiento.', 0, 'assets/ibc_gmc.jpg', true)
) AS v(name, sku, description, price, image_url, active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products p WHERE p.sku = v.sku
);

COMMIT;

-- Comprobación final: debe devolver los 4 productos del prototipo.
SELECT id, name, sku, price, image_url, active
FROM public.products
WHERE sku IN ('20L-BIDON', '20L-CAJA', '208L-CILINDRO', '1000L-IBC')
ORDER BY created_at ASC NULLS LAST;
