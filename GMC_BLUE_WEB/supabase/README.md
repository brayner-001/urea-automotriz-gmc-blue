# GMC BLUE — Backend de catálogo (Fase 1)

Esta Edge Function publica únicamente una lista limitada de productos activos. No expone la tabla mediante la Data API y no modifica las políticas RLS ni los grants existentes.

## Arquitectura

- Frontend: `catalog.js` solicita `GET /functions/v1/catalog`.
- Backend: `functions/catalog/index.ts` ejecuta una consulta SQL fija.
- Base de datos: conexión directa mediante `GMC_CATALOG_DATABASE_URL`.
- Credencial: debe pertenecer a un rol dedicado de solo lectura, no al usuario `postgres` ni a `service_role`.
- Respuesta: solo `id`, `name`, `sku`, `description`, `price`, `image_url` y `active`, filtrados por `active = TRUE`.

## Requisitos antes de desplegar

1. Revisar los grants efectivos actuales de `public.products` y las membresías de roles. No ejecutar cambios de permisos a ciegas.
2. Crear, mediante una migración aprobada, un rol dedicado sin privilegios heredados y con permiso de lectura limitado a las columnas que usa la función. No reutilizar una cuenta administrativa.
3. Obtener una cadena de conexión del pooler de Supabase compatible con Edge Functions y asociarla a ese rol restringido.
4. Configurar los secretos de la función desde Supabase, nunca dentro del repositorio:
   - `GMC_CATALOG_DATABASE_URL`: cadena de conexión del rol dedicado.
   - `GMC_CATALOG_ALLOWED_ORIGINS`: `https://urea-automotriz-gmc-blue.pages.dev` y el origen local exacto usado para pruebas, separados por coma.
5. Desplegar la función `catalog` y comprobar respuesta, CORS y que no devuelve productos inactivos.

## Despliegue (cuando se autorice)

Desde la raíz del proyecto, con Supabase CLI vinculado al proyecto existente:

```bash
supabase functions deploy catalog --project-ref agogxfbehbnfdoqgoocf
```

Configurar los secretos con el mecanismo seguro de Supabase CLI o Dashboard. No guardar el valor de `GMC_CATALOG_DATABASE_URL` en archivos versionados.

## Límites de seguridad

- Solo acepta `GET` y `OPTIONS`.
- No recibe nombres de tablas, columnas, filtros ni ordenamiento del navegador.
- Consulta fija, sin concatenación de SQL proporcionado por el usuario.
- Devuelve solo productos activos y un máximo de 100 filas.
- No expone errores SQL al cliente.
- CORS limita los navegadores a los orígenes configurados. CORS no sustituye autenticación ni limita clientes no navegador; la consulta restringida y el rol de base de datos son la barrera de privilegios.
- No usar una contraseña de `postgres`, `service_role` ni una clave secreta en el frontend.

La función está preparada localmente, pero no está desplegada ni conectada a producción. No se ha cambiado Supabase.


## Fase 2 · Pedidos reales

Se incluye `gmc_create_order.sql`, una función RPC transaccional con `SECURITY INVOKER`. Valida sesión, productos activos y cantidades; calcula los importes con `products.price` en PostgreSQL; crea `orders` y `order_items` dentro de la misma transacción. No usa `service_role`, no crea tablas y no altera políticas RLS existentes.

Antes de habilitar pedidos, ejecutar una vez `gmc_create_order.sql` en SQL Editor. El frontend solo permite registrar pedidos a usuarios autenticados. Visitantes mantienen el flujo actual de WhatsApp sin guardar un pedido. Tras el registro, WhatsApp recibe el UUID del pedido. El historial de Mi cuenta consulta `orders` y su relación `order_items`, sujeto a las políticas RLS actuales.
