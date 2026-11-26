import postgres from 'npm:postgres@3.4.5';

const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Vary': 'Origin',
};

const allowedOrigins = (Deno.env.get('GMC_CATALOG_ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const databaseUrl = Deno.env.get('GMC_CATALOG_DATABASE_URL');
let sql: ReturnType<typeof postgres> | null = null;

function headersFor(origin: string | null): Headers {
  const headers = new Headers(corsHeaders);
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  return headers;
}

function json(data: unknown, status: number, origin: string | null, extra: Record<string, string> = {}) {
  const headers = headersFor(origin);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  for (const [key, value] of Object.entries(extra)) headers.set(key, value);
  return new Response(JSON.stringify(data), { status, headers });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin');
  const headers = headersFor(origin);

  if (request.method === 'OPTIONS') {
    if (origin && !allowedOrigins.includes(origin)) {
      return new Response(null, { status: 403, headers });
    }
    return new Response(null, { status: 204, headers });
  }

  if (origin && !allowedOrigins.includes(origin)) {
    return json({ error: 'Origen no autorizado.' }, 403, origin);
  }

  if (request.method !== 'GET') {
    return json({ error: 'Método no permitido.' }, 405, origin, { Allow: 'GET, OPTIONS' });
  }

  if (!databaseUrl) {
    console.error('GMC catalog: falta configurar GMC_CATALOG_DATABASE_URL.');
    return json({ error: 'El catálogo no está disponible temporalmente.' }, 503, origin);
  }

  try {
    // Conexión persistente dentro del isolate. La URL debe pertenecer a un rol
    // dedicado con SELECT únicamente sobre las columnas públicas de products.
    sql ??= postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });

    // Consulta fija y parametrizada: el cliente no puede solicitar tablas,
    // columnas, filtros ni precios arbitrarios.
    const products = await sql`
      SELECT id, name, sku, description, price, image_url, active
      FROM public.products
      WHERE active = TRUE
      ORDER BY created_at ASC NULLS LAST
      LIMIT 100
    `;

    return json({ products }, 200, origin, {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
    });
  } catch (error) {
    // No enviar detalles SQL, credenciales ni trazas al navegador.
    console.error('GMC catalog database error:', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'No se pudo consultar el catálogo.' }, 503, origin);
  }
});
