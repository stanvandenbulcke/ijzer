import { describe, expect, it } from 'vitest'
import { set } from '../training/fixtures'
import { suggestNext, type ProgressionInput } from './progression'

const base: ProgressionInput = {
  model: 'double',
  repMin: 8,
  repMax: 12,
  targetRir: 2,
  incrementKg: 2.5,
  previousSets: [],
}

describe('suggestNext — double progression', () => {
  it('has no suggestion the first time', () => {
    expect(suggestNext(base).reason).toBe('first_time')
  })

  it('adds weight when every working set hit the top of the range at the target RIR', () => {
    const s = suggestNext({
      ...base,
      previousSets: [
        set(80, 12, { rir: 2 }),
        set(80, 12, { rir: 1 }),
        set(40, 10, { type: 'warmup' }),
      ],
    })
    expect(s).toMatchObject({ weightKg: 82.5, repMin: 8, reason: 'increase_weight' })
    expect(s.previous).toEqual({ weightKg: 80, reps: [12, 12], rir: [2, 1] })
  })

  it('keeps the weight when one set fell short or was too easy', () => {
    expect(suggestNext({ ...base, previousSets: [set(80, 12), set(80, 10)] }).reason).toBe(
      'add_rep',
    )
    expect(
      suggestNext({ ...base, previousSets: [set(80, 12, { rir: 4 }), set(80, 12, { rir: 2 })] }),
    ).toMatchObject({ weightKg: 80, reason: 'add_rep' })
  })

  it('ignores unchecked sets', () => {
    const s = suggestNext({
      ...base,
      previousSets: [set(80, 12), set(80, 6, { completed: false })],
    })
    expect(s.reason).toBe('increase_weight')
  })

  it('says "keeping strength is a win" in a cut when performance drops', () => {
    const s = suggestNext({
      ...base,
      previousSets: [set(80, 12), set(80, 12)],
      cutting: true,
      recentE1rms: [112, 108],
    })
    expect(s).toMatchObject({ weightKg: 80, reason: 'cut_maintain' })
  })
})

describe('suggestNext — other models', () => {
  it('fixed reps: add weight only when all sets were done', () => {
    const fixed = { ...base, model: 'fixed' as const, repMin: 5, repMax: 5 }
    expect(suggestNext({ ...fixed, previousSets: [set(100, 5), set(100, 5)] })).toMatchObject({
      weightKg: 102.5,
      reason: 'fixed_increase',
    })
    expect(suggestNext({ ...fixed, previousSets: [set(100, 5), set(100, 4)] }).reason).toBe(
      'fixed_repeat',
    )
  })

  it('RIR-based: picks the weight for the planned reps and RIR via the e1RM', () => {
    const s = suggestNext({
      ...base,
      model: 'rir',
      repMin: 6,
      repMax: 8,
      targetRir: 2,
      previousSets: [set(100, 6, { rir: 2 })],
    })
    // e1RM = 100 × (1 + 8/30) = 126.67; for 7 reps + 2 RIR: 126.67 / 1.3 = 97.4 → 97.5
    expect(s).toMatchObject({ weightKg: 97.5, reason: 'rir_adjust' })
  })
})
