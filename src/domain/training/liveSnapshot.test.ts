import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from './fixtures'
import { latestSet, liveSnapshot, pairTopic } from './liveSnapshot'

const names = (id: string) =>
  ({ bench: 'Bench Press', row: 'Barbell Row', fly: 'Cable Fly' })[id] ?? id

describe('liveSnapshot', () => {
  it('shares only ticked sets, marks skipped exercises and leaves out untouched ones', () => {
    const w = workout(
      '2026-11-20T17:00:00Z',
      [
        exercise('bench', [set(80, 8), { ...set(82.5, 6), completed: false, completedAt: null }]),
        { ...exercise('row', []), status: 'skipped' as const },
        {
          ...exercise('fly', [{ ...set(15, 12), completed: false, completedAt: null }]),
          status: 'pending' as const,
        },
      ],
      { finishedAt: null },
    )
    const snap = liveSnapshot(w, names)
    expect(snap.exercises.map((e) => [e.name, e.state, e.sets.length])).toEqual([
      ['Bench Press', 'doing', 1],
      ['Barbell Row', 'skipped', 0],
    ])
    expect(snap.exercises[0]!.sets[0]).toMatchObject({ kg: 80, reps: 8, warmup: false })
    expect(latestSet(snap)).toMatchObject({ exercise: 'Bench Press', set: { kg: 80 } })
  })

  it('has no latest set before the first tick', () => {
    const w = workout('2026-11-20T17:00:00Z', [], { finishedAt: null })
    expect(latestSet(liveSnapshot(w, names))).toBeNull()
  })

  it('names the pair channel the same from both sides, like the database', () => {
    expect(pairTopic('b', 'a')).toBe('pair:a:b')
    expect(pairTopic('a', 'b')).toBe('pair:a:b')
  })
})
