/**
 * Open Food Facts product → our food shape (values per 100 g/ml). Pure code: used by the
 * `food-lookup` edge function (Deno) and unit-tested from src/ with Vitest.
 * OFF data is ODbL; product photos are CC BY-SA (shown with attribution, SPEC §4.5).
 */
export interface OffFood {
  barcode: string
  name: string
  brand: string | null
  per100: { kcal: number; protein: number; carbs: number; fat: number; fiber: number | null }
  liquid: boolean
  servingGrams: number | null
  /** Fields that were missing on OFF and are filled with 0: highlight them for checking. */
  missing: Array<'kcal' | 'protein' | 'carbs' | 'fat'>
}

type Json = Record<string, unknown>

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : typeof v === 'number' ? v : NaN
  return Number.isFinite(n) && n >= 0 ? n : null
}
const round1 = (x: number) => Math.round(x * 10) / 10
/** Anyone can edit OFF: values outside what food can physically contain count as missing. */
const upTo = (v: number | null, max: number) => (v !== null && v <= max ? v : null)

/** Returns null when OFF has no usable product (unknown barcode or no name and no kcal). */
export function normalizeOff(barcode: string, response: Json): OffFood | null {
  const product = response.product as Json | undefined
  if (!product || response.status === 0) return null
  const n = (product.nutriments ?? {}) as Json
  const kj = num(n['energy-kj_100g']) ?? (n['energy_unit'] === 'kJ' ? num(n['energy_100g']) : null)
  const kcal = upTo(num(n['energy-kcal_100g']) ?? (kj !== null ? kj / 4.184 : null), 950)
  const values = {
    kcal,
    protein: upTo(num(n['proteins_100g']), 100),
    carbs: upTo(num(n['carbohydrates_100g']), 100),
    fat: upTo(num(n['fat_100g']), 100),
  }
  if ((values.protein ?? 0) + (values.carbs ?? 0) + (values.fat ?? 0) > 105) {
    values.protein = null
    values.carbs = null
    values.fat = null
  }
  const name = String(product.product_name ?? '')
    .trim()
    .slice(0, 120)
  if (!name && values.kcal === null) return null
  const missing = (Object.keys(values) as Array<keyof typeof values>).filter(
    (k) => values[k] === null,
  )
  const quantity = String(product.quantity ?? '').toLowerCase()
  return {
    barcode,
    name: name || barcode,
    brand:
      String(product.brands ?? '')
        .split(',')[0]
        ?.trim()
        .slice(0, 80) || null,
    per100: {
      kcal: Math.round(values.kcal ?? 0),
      protein: round1(values.protein ?? 0),
      carbs: round1(values.carbs ?? 0),
      fat: round1(values.fat ?? 0),
      fiber: upTo(num(n['fiber_100g']), 100) === null ? null : round1(num(n['fiber_100g'])!),
    },
    liquid: /\d\s*(ml|cl|l)\b/.test(quantity),
    servingGrams: (() => {
      const g = num(product.serving_quantity)
      return g !== null && g > 0 && g <= 2000 ? g : null
    })(),
    missing,
  }
}

/** EAN-8, UPC-A, EAN-13, GTIN-14: digits only. */
export const isBarcode = (code: string) => /^\d{8,14}$/.test(code)
