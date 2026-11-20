/** Nutrition (SPEC §4.5, §5.4). Values per 100 g (or 100 ml for liquids). */
export interface Nutrients {
  kcal: number
  protein: number
  carbs: number
  fat: number
  /** Optional: not every label lists fibre. */
  fiber: number | null
}

export type FoodUnit = 'g' | 'ml' | 'piece' | 'serving'

export interface Food {
  id: string
  name: string
  brand: string | null
  barcode: string | null
  per100: Nutrients
  /** Measured in ml instead of g. */
  liquid: boolean
  gramsPerPiece: number | null
  servingGrams: number | null
  favorite: boolean
  /** Remembered so the next log of this food proposes the same amount (SPEC §4.5). */
  lastAmount: { amount: number; unit: FoodUnit } | null
}

export const MEALS = ['breakfast', 'lunch', 'dinner', 'snacks'] as const
export type MealId = (typeof MEALS)[number]

/**
 * One logged item. `per100` is a SNAPSHOT taken when logging, so old days never change when a
 * product is edited later. Quick adds have no per100/amount, only `nutrients`.
 */
export interface FoodLog {
  id: string
  /** "YYYY-MM-DD" */
  day: string
  meal: MealId
  foodId: string | null
  name: string
  per100: Nutrients | null
  amount: number | null
  unit: FoodUnit | null
  gramsPerPiece: number | null
  servingGrams: number | null
  /** Totals for this entry. */
  nutrients: Nutrients
}
