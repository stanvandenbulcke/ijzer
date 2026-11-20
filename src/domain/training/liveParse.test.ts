import { describe, expect, it } from 'vitest'
import { LIVE_VERSION } from './liveSnapshot'
import { parseLiveSnapshot } from './liveParse'

const good = {
  v: LIVE_VERSION,
  snapshot: {
    workoutName: 'Benen',
    startedAt: '2026-11-20T17:00:00.000Z',
    lastSetAt: null,
    exercises: [{ name: 'Hip Thrust', state: 'doing', sets: [{ kg: 60, reps: 8, warmup: false }] }],
  },
}

describe('parseLiveSnapshot', () => {
  it('accepts a well-formed snapshot', () => {
    expect(parseLiveSnapshot(good)?.exercises[0]?.sets[0]).toMatchObject({ kg: 60, reps: 8 })
  })

  it('never throws on junk and treats it as not training', () => {
    const junk: unknown[] = [
      null,
      'x',
      42,
      [],
      { v: 999, snapshot: good.snapshot },
      { v: LIVE_VERSION, snapshot: { ...good.snapshot, exercises: 'x' } },
      { v: LIVE_VERSION, snapshot: { ...good.snapshot, startedAt: 'gisteren' } },
      { v: LIVE_VERSION, snapshot: { ...good.snapshot, workoutName: { evil: true } } },
    ]
    for (const j of junk) expect(() => parseLiveSnapshot(j)).not.toThrow()
    expect(parseLiveSnapshot(junk[4])).toBeNull()
    expect(parseLiveSnapshot(junk[5])?.exercises).toEqual([])
    expect(parseLiveSnapshot(junk[6])).toBeNull()
  })

  it('drops bad exercises and sets, clamps text and limits sizes', () => {
    const snap = parseLiveSnapshot({
      v: LIVE_VERSION,
      snapshot: {
        ...good.snapshot,
        exercises: [
          { name: 'x'.repeat(500), state: 'doing', sets: [{ kg: -5, reps: 1e9 }, 'nope'] },
          { name: 'Bad state', state: 'hacked', sets: [] },
          ...Array.from({ length: 100 }, () => ({ name: 'a', state: 'doing', sets: [] })),
        ],
      },
    })
    expect(snap?.exercises[0]?.name).toHaveLength(80)
    expect(snap?.exercises[0]?.sets).toEqual([
      { kg: null, reps: null, seconds: null, meters: null, warmup: false },
    ])
    expect(snap?.exercises.some((e) => e.name === 'Bad state')).toBe(false)
    expect(snap!.exercises.length).toBeLessThanOrEqual(40)
  })
})
