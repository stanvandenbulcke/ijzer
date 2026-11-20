import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from './fixtures'
import type { Exercise } from './types'
import { computeWrapped, periodRange } from './wrapped'

const ex = (id: string, muscle: Exercise['muscles'][number]['muscle']): Exercise => ({
  id,
  name: id,
  equipment: 'barbell',
  type: 'weight_reps',
  unilateral: false,
  muscles: [{ muscle, weight: 1 }],
  lengthened: false,
  mechanic: 'compound',
  quality: 'curated',
  aliases: [],
  instructions: [],
  hasImages: true,
  custom: false,
})
const catalog: Record<string, Exercise> = {
  bench: ex('bench', 'chest'),
  squat: ex('squat', 'quads'),
}
const byId = (id: string) => catalog[id]

describe('periodRange', () => {
  it('handles months (incl. February) and years', () => {
    expect(periodRange('2026-11')).toEqual({ from: '2026-11-01', to: '2026-11-30' })
    expect(periodRange('2028-02')).toEqual({ from: '2028-02-01', to: '2028-02-29' })
    expect(periodRange('2026')).toEqual({ from: '2026-01-01', to: '2026-12-31' })
  })
})

describe('computeWrapped', () => {
  const all = [
    workout('2026-10-28T17:00:00Z', [exercise('bench', [set(80, 8)])], {
      finishedAt: '2026-10-28T18:00:00Z',
    }),
    workout(
      '2026-11-03T17:00:00Z',
      [exercise('bench', [set(85, 8), set(85, 8)]), exercise('squat', [set(100, 5)])],
      { finishedAt: '2026-11-03T18:00:00Z' },
    ),
    workout('2026-11-05T17:00:00Z', [exercise('bench', [set(85, 9)])], {
      finishedAt: '2026-11-05T17:30:00Z',
    }),
  ]

  it('counts only the period, finds favourite, top muscle, best week and PRs', () => {
    const w = computeWrapped(all, byId, '2026-11')
    expect(w).toMatchObject({
      workouts: 2,
      minutes: 90,
      sets: 4,
      reps: 30,
      activeDays: 2,
      tonnageKg: 2625,
    })
    expect(w.favoriteExercise).toEqual({ exerciseId: 'bench', sets: 3 })
    expect(w.topMuscle).toEqual({ muscle: 'chest', sets: 3 })
    expect(w.bestWeek).toEqual({ week: '2026-11-02', workouts: 2 })
    expect(w.topPrs[0]).toEqual({ exerciseId: 'bench', weightKg: 85, reps: 9 })
  })

  it('is empty for a month without training', () => {
    expect(computeWrapped(all, byId, '2026-09')).toMatchObject({
      workouts: 0,
      favoriteExercise: null,
      topMuscle: null,
      topPrs: [],
    })
  })
})
