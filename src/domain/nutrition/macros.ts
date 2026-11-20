import type { Food, FoodLog, FoodUnit, Nutrients } from './types'

export const ZERO: Nutrients = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: null }

/** Grams (or ml) for an amount in a unit; null when the unit is unknown for this food. */
export function gramsFor(
  amount: number,
  unit: FoodUnit,
  food: Pick<Food, 'gramsPerPiece' | 'servingGrams'>,
): number | null {
  if (unit === 'g' || unit === 'ml') return amount
  if (unit === 'piece') return food.gramsPerPiece ? amount * food.gramsPerPiece : null
  return food.servingGrams ? amount * food.servingGrams : null
}

const round1 = (x: number) => Math.round(x * 10) / 10

/** Nutrients for a number of grams: value per 100 × grams / 100 (SPEC §5.4). */
export function scale(per100: Nutrients, grams: number): Nutrients {
  const f = Math.max(0, grams) / 100
  return {
    kcal: Math.round(per100.kcal * f),
    protein: round1(per100.protein * f),
    carbs: round1(per100.carbs * f),
    fat: round1(per100.fat * f),
    fiber: per100.fiber === null ? null : round1(per100.fiber * f),
  }
}

/** Sum of entries; fibre stays null unless at least one entry has it. */
export function sum(items: Nutrients[]): Nutrients {
  return items.reduce<Nutrients>(
    (acc, n) => ({
      kcal: acc.kcal + n.kcal,
      protein: round1(acc.protein + n.protein),
      carbs: round1(acc.carbs + n.carbs),
      fat: round1(acc.fat + n.fat),
      fiber: n.fiber === null ? acc.fiber : round1((acc.fiber ?? 0) + n.fiber),
    }),
    ZERO,
  )
}

export const dayTotals = (logs: FoodLog[]): Nutrients => sum(logs.map((l) => l.nutrients))

/**
 * Sanity check for typed or scanned values (SPEC §4.5): kcal ≈ 4·protein + 4·carbs + 9·fat
 * (+ 2·fibre). Returns the relative deviation; > 0.15 deserves a warning.
 */
export function kcalDeviation(n: Nutrients): number {
  const expected = 4 * n.protein + 4 * n.carbs + 9 * n.fat + 2 * (n.fiber ?? 0)
  if (n.kcal === 0 && expected === 0) return 0
  return Math.abs(n.kcal - expected) / Math.max(n.kcal, expected)
}

export const KCAL_WARNING = 0.15
