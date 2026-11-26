-- GMC BLUE | AUDITORÍA DE SOLO LECTURA PARA public.products
-- Ejecutar completa en Supabase SQL Editor. Devuelve una sola fila JSON.
-- No modifica datos, roles, grants, políticas ni configuración.

SELECT jsonb_build_object(
  'columns', (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'column_name', column_name,
      'data_type', data_type,
      'is_nullable', is_nullable
    ) ORDER BY ordinal_position), '[]'::jsonb)
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products'
  ),
  'rls', (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'schema_name', n.nspname,
      'table_name', c.relname,
      'rls_enabled', c.relrowsecurity,
      'rls_forced', c.relforcerowsecurity
    )), '[]'::jsonb)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'products'
  ),
  'table_grants', (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'grantee', grantee,
      'privilege_type', privilege_type,
      'is_grantable', is_grantable
    ) ORDER BY grantee, privilege_type), '[]'::jsonb)
    FROM information_schema.table_privileges
    WHERE table_schema = 'public' AND table_name = 'products'
  ),
  'column_grants', (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'grantee', grantee,
      'column_name', column_name,
      'privilege_type', privilege_type,
      'is_grantable', is_grantable
    ) ORDER BY grantee, column_name, privilege_type), '[]'::jsonb)
    FROM information_schema.column_privileges
    WHERE table_schema = 'public' AND table_name = 'products'
  ),
  'roles', (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'role_name', rolname,
      'is_superuser', rolsuper,
      'inherits_roles', rolinherit,
      'can_create_roles', rolcreaterole,
      'can_create_databases', rolcreatedb,
      'can_login', rolcanlogin,
      'bypasses_rls', rolbypassrls
    ) ORDER BY rolname), '[]'::jsonb)
    FROM pg_roles
    WHERE rolname IN ('anon', 'authenticated', 'service_role', 'postgres')
       OR rolname ILIKE '%gmc%'
  ),
  'role_memberships', (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'member', member_role.rolname,
      'granted_role', granted_role.rolname,
      'admin_option', m.admin_option
    ) ORDER BY member_role.rolname, granted_role.rolname), '[]'::jsonb)
    FROM pg_auth_members m
    JOIN pg_roles member_role ON member_role.oid = m.member
    JOIN pg_roles granted_role ON granted_role.oid = m.roleid
    WHERE member_role.rolname IN ('anon', 'authenticated', 'service_role', 'postgres')
       OR member_role.rolname ILIKE '%gmc%'
  ),
  'product_counts', (
    SELECT jsonb_build_object(
      'active', COUNT(*) FILTER (WHERE active IS TRUE),
      'inactive', COUNT(*) FILTER (WHERE active IS FALSE),
      'active_is_null', COUNT(*) FILTER (WHERE active IS NULL)
    )
    FROM public.products
  )
) AS gmc_products_audit;
