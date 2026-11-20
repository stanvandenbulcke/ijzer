import type { Activity, Goal, Sex } from '../profile/types'

/** Activity factors for the start TDEE (SPEC §5.5). */
export const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const KCAL_PER_KG = 7700

/**
 * Mifflin-St Jeor BMR. Without a sex the average of both formulas is used (−78), so nobody has
 * to answer to get an estimate.
 */
export function bmr(p: { weightKg: number; heightCm: number; age: number; sex: Sex | null }) {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age
  return Math.round(base + (p.sex === 'male' ? 5 : p.sex === 'female' ? -161 : -78))
}

export function ageOn(birthDate: string | null, birthYear: number | null, today: string): number {
  if (birthDate) {
    const [y, m, d] = birthDate.split('-').map(Number) as [number, number, number]
    const [ty, tm, td] = today.split('-').map(Number) as [number, number, number]
    return ty - y - (tm < m || (tm === m && td < d) ? 1 : 0)
  }
  return birthYear ? Number(today.slice(0, 4)) - birthYear : 25
}

export interface Targets {
  kcal: number
  protein: number
  fat: number
  carbs: number
  bmr: number
  tdee: number
  /** True when the goal was raised to the BMR floor (safety, SPEC §5.5). */
  flooredAtBmr: boolean
}

/**
 * Daily targets (SPEC §5.4–5.5): TDEE = BMR × activity; goal kcal = TDEE − rate × weight ×
 * 7700 / 7, never below BMR. Protein 2.0 g/kg, fat 0.8 g/kg (min 20 % of kcal), carbs the rest.
 */
export function dailyTargets(p: {
  weightKg: number
  heightCm: number
  age: number
  sex: Sex | null
  activity: Activity
  goal: Goal
  ratePctPerWeek: number
  proteinPerKg?: number
}): Targets {
  const base = bmr(p)
  const tdee = Math.round(base * ACTIVITY_FACTOR[p.activity])
  const rate = p.goal === 'maintain' ? 0 : p.ratePctPerWeek
  const change = ((rate / 100) * p.weightKg * KCAL_PER_KG) / 7
  const wanted = Math.round(tdee + change)
  const kcal = Math.max(base, wanted)
  const protein = Math.round(p.weightKg * (p.proteinPerKg ?? 2))
  const fat = Math.round(Math.max(p.weightKg * 0.8, (kcal * 0.2) / 9))
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { kcal, protein, fat, carbs, bmr: base, tdee, flooredAtBmr: wanted < base }
}
