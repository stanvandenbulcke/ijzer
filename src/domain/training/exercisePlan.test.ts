import { describe, expect, it } from 'vitest'
import { planExercise } from './exercisePlan'
import { exercise, set, workout } from './fixtures'
import { performances } from './performances'

const past = [
  workout('2026-11-12T17:00:00Z', [
    exercise('bench', [set(80, 12, { rir: 2 }), set(80, 12, { rir: 1 })]),
  ]),
]
const history = performances(past)
const target = { repMin: 8, repMax: 12, rir: 2 }

describe('planExercise', () => {
  it('suggests more weight and proposes it for a one-tap tick', () => {
    const current = workout(
      '2026-11-19T17:00:00Z',
      [
        exercise('bench', [
          set(null, null, { completed: false, target }),
          set(null, null, { completed: false, target }),
        ]),
      ],
      { finishedAt: null },
    )
    const plan = planExercise({
      workout: current,
      exercise: current.exercises[0]!,
      type: 'weight_reps',
      finishedWorkouts: past,
      history,
      incrementKg: 2.5,
      cutting: false,
    })
    expect(plan.suggestion?.reason).toBe('increase_weight')
    expect(plan.proposals).toEqual([
      { weightKg: 82.5, reps: 8 },
      { weightKg: 82.5, reps: 8 },
    ])
    expect(plan.previousBySet.map((s) => s?.reps)).toEqual([12, 12])
  })

  it('marks a PR once, not again for an equal set later today', () => {
    const current = workout(
      '2026-11-19T17:00:00Z',
      [
        exercise('bench', [
          set(85, 10, { target }),
          set(85, 10, { target }),
          set(85, 11, { target }),
        ]),
      ],
      { finishedAt: null },
    )
    const plan = planExercise({
      workout: current,
      exercise: current.exercises[0]!,
      type: 'weight_reps',
      finishedWorkouts: past,
      history,
      incrementKg: 2.5,
      cutting: false,
    })
    expect(plan.prKinds[0]).toContain('weight')
    expect(plan.prKinds[1]).toEqual([])
    expect(plan.prKinds[2]).toContain('reps')
  })
})
