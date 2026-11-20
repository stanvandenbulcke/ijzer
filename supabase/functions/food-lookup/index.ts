// Edge function `food-lookup` (SPEC §4.5): barcode → product per 100 g, via a shared cache and
// Open Food Facts. OFF asks for a User-Agent with a contact address; browsers cannot set one,
// so the lookup happens here. The address lives in the secret OFF_CONTACT, never in the repo.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { isBarcode, normalizeOff } from '../_shared/offNormalize.ts'

const DAILY_LIMIT = 200
const FOUND_TTL_DAYS = 30
const MISSING_TTL_DAYS = 1
const FIELDS = 'code,product_name,brands,nutriments,serving_quantity,quantity'
const ORIGINS = new Set([
  'https://ijzer.stanvandenbulck.workers.dev',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4190',
])

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  return {
    'Access-Control-Allow-Origin': ORIGINS.has(origin)
      ? origin
      : 'https://ijzer.stanvandenbulck.workers.dev',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

Deno.serve(async (req) => {
  const headers = { ...cors(req), 'Content-Type': 'application/json' }
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers })
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) })
  if (req.method !== 'POST') return reply(405, { error: 'method' })

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
  // Only signed-in users: verify the access token with the auth server.
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  const { data: auth } = token ? await admin.auth.getUser(token) : { data: { user: null } }
  const user = auth.user
  if (!user) return reply(401, { error: 'unauthorized' })

  const body = await req.json().catch(() => ({}))
  const barcode = typeof body?.barcode === 'string' ? body.barcode.trim() : ''
  if (!isBarcode(barcode)) return reply(400, { error: 'invalid_barcode' })

  const today = new Date().toISOString().slice(0, 10)
  const { data: used, error: usageError } = await admin.rpc('bump_lookup_usage', {
    p_user: user.id,
    p_day: today,
  })
  if (usageError) return reply(500, { error: 'usage' })
  if ((used as number) > DAILY_LIMIT) return reply(429, { error: 'limit' })

  const { data: cached } = await admin
    .from('product_cache')
    .select('data, fetched_at')
    .eq('barcode', barcode)
    .maybeSingle()
  if (cached) {
    const ageDays = (Date.now() - Date.parse(cached.fetched_at)) / 86_400_000
    if (ageDays < (cached.data ? FOUND_TTL_DAYS : MISSING_TTL_DAYS))
      return reply(200, { found: cached.data !== null, food: cached.data, cached: true })
  }

  const contact = Deno.env.get('OFF_CONTACT') ?? ''
  let response: Response
  try {
    response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=${FIELDS}`,
      {
        headers: { 'User-Agent': `IRON/1.0 (${contact})`, Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      },
    )
  } catch {
    return reply(502, { error: 'upstream' })
  }
  if (!response.ok && response.status !== 404) return reply(502, { error: 'upstream' })
  const json = await response.json().catch(() => ({}))
  const food = normalizeOff(barcode, json)
  await admin
    .from('product_cache')
    .upsert({ barcode, data: food, source: 'off', fetched_at: new Date().toISOString() })
  return reply(200, { found: food !== null, food })
})
