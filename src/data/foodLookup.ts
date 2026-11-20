import type { OffFood } from '../../supabase/functions/_shared/offNormalize'
import { db, type FoodRow } from './db'
import { notDeleted } from './rows'
import { supabase } from './supabase/client'

export type LookupResult =
  | { kind: 'own'; food: FoodRow }
  | { kind: 'found'; food: OffFood }
  | { kind: 'not-found' }
  | { kind: 'signed-out' }
  | { kind: 'limit' }
  | { kind: 'offline' }
  | { kind: 'error' }

/**
 * Barcode → product (SPEC §4.5 "Barcodeflow"): first your own products, then the shared cache /
 * Open Food Facts via the `food-lookup` edge function (signed-in users only).
 */
export async function lookupBarcode(barcode: string): Promise<LookupResult> {
  const own = (await db.foods.where('barcode').equals(barcode).toArray()).find(notDeleted)
  if (own) return { kind: 'own', food: own }
  const client = supabase()
  const { data: session } = (await client?.auth.getSession()) ?? { data: { session: null } }
  if (!client || !session.session) return { kind: 'signed-out' }
  if (!navigator.onLine) return { kind: 'offline' }
  const { data, error } = await client.functions.invoke<{ found: boolean; food: OffFood | null }>(
    'food-lookup',
    { body: { barcode } },
  )
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status
    return status === 429 ? { kind: 'limit' } : { kind: 'error' }
  }
  return data?.found && data.food ? { kind: 'found', food: data.food } : { kind: 'not-found' }
}
