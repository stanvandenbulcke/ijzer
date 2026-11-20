import { describe, expect, it } from 'vitest'
import { dayTotals, gramsFor, kcalDeviation, scale, sum } from './macros'
import { ageOn, bmr, dailyTargets } from './targets'
import type { FoodLog, Nutrients } from './types'
import { weekSummary } from './week'

const oats: Nutrients = { kcal: 372, protein: 13.5, carbs: 58.7, fat: 7, fiber: 10 }

const log = (day: string, n: Partial<Nutrients>): FoodLog => ({
  id: `${day}-${Math.random()}`,
  day,
  meal: 'lunch',
  foodId: null,
  name: 'x',
  per100: null,
  amount: null,
  unit: null,
  gramsPerPiece: null,
  servingGrams: null,
  nutrients: { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: null, ...n },
})

describe('macros', () => {
  it('scales per-100 values to the amount eaten', () => {
    expect(scale(oats, 60)).toEqual({ kcal: 223, protein: 8.1, carbs: 35.2, fat: 4.2, fiber: 6 })
    expect(scale(oats, 0).kcal).toBe(0)
    expect(scale(oats, -5).kcal).toBe(0)
  })

  it('converts pieces and servings, and refuses an unknown unit', () => {
    const egg = { gramsPerPiece: 55, servingGrams: null }
    expect(gramsFor(2, 'piece', egg)).toBe(110)
    expect(gramsFor(1, 'serving', egg)).toBeNull()
    expect(gramsFor(250, 'ml', egg)).toBe(250)
  })

  it('sums entries and keeps fibre unknown unless someone listed it', () => {
    const a = { kcal: 100, protein: 10, carbs: 5, fat: 2, fiber: null }
    expect(sum([a, a]).fiber).toBeNull()
    expect(sum([a, { ...a, fiber: 3 }]).fiber).toBe(3)
    expect(dayTotals([log('d', { kcal: 300 }), log('d', { kcal: 200 })]).kcal).toBe(500)
    expect(sum([]).kcal).toBe(0)
  })

  it('flags labels whose kcal do not match the macros', () => {
    expect(kcalDeviation(oats)).toBeLessThan(0.15)
    expect(kcalDeviation({ ...oats, kcal: 150 })).toBeGreaterThan(0.15)
    expect(kcalDeviation({ kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: null })).toBe(0)
  })
})

describe('targets', () => {
  it('uses Mifflin-St Jeor', () => {
    expect(bmr({ weightKg: 78, heightCm: 182, age: 19, sex: 'male' })).toBe(1828)
    expect(bmr({ weightKg: 60, heightCm: 168, age: 19, sex: 'female' })).toBe(1394)
    // Without a sex: the average of both.
    expect(bmr({ weightKg: 78, heightCm: 182, age: 19, sex: null })).toBe(1745)
  })

  it('computes age from a birth date, also the day before a birthday', () => {
    expect(ageOn('2007-03-15', null, '2026-03-14')).toBe(18)
    expect(ageOn('2007-03-15', null, '2026-03-15')).toBe(19)
    expect(ageOn(null, 2007, '2026-11-20')).toBe(19)
  })

  it('subtracts the planned loss, adds a surplus, and never goes below BMR', () => {
    const base = {
      weightKg: 80,
      heightCm: 180,
      age: 19,
      sex: 'male' as const,
      activity: 'moderate' as const,
    }
    const keep = dailyTargets({ ...base, goal: 'maintain', ratePctPerWeek: -0.5 })
    const cut = dailyTargets({ ...base, goal: 'cut', ratePctPerWeek: -0.5 })
    const bulk = dailyTargets({ ...base, goal: 'bulk', ratePctPerWeek: 0.25 })
    expect(keep.kcal).toBe(keep.tdee)
    expect(keep.tdee - cut.kcal).toBe(440) // 0.5 % × 80 kg × 7700 / 7
    expect(bulk.kcal).toBeGreaterThan(keep.kcal)
    expect(cut.protein).toBe(160)
    expect(cut.protein * 4 + cut.fat * 9 + cut.carbs * 4).toBeCloseTo(cut.kcal, -1)

    const tiny = dailyTargets({ ...base, activity: 'sedentary', goal: 'cut', ratePctPerWeek: -3 })
    expect(tiny.kcal).toBe(tiny.bmr)
    expect(tiny.flooredAtBmr).toBe(true)
  })
})

describe('weekSummary', () => {
  it('averages only days with entries and counts protein-goal days', () => {
    const logs = [
      log('2026-11-20', { kcal: 2000, protein: 150 }),
      log('2026-11-19', { kcal: 1800, protein: 120 }),
      log('2026-11-01', { kcal: 9999, protein: 999 }), // outside the week
    ]
    const w = weekSummary(logs, new Set(['2026-11-20']), '2026-11-20', 140)
    expect(w.days).toHaveLength(7)
    expect(w.loggedDays).toBe(2)
    expect(w.average?.kcal).toBe(1900)
    expect(w.proteinGoalDays).toBe(1)
    expect(w.days.at(-1)).toMatchObject({ day: '2026-11-20', complete: true })
    expect(weekSummary([], new Set(), '2026-11-20', 140).average).toBeNull()
  })
})
