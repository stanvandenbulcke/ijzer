import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { exercise, set, workout } from '../domain/training/fixtures'
import { listBodyWeights, logBodyWeight } from './bodyRepo'
import { db } from './db'
import { loadProfile, saveProfile } from './profileRepo'
import {
  copyRoutine,
  deleteRoutine,
  listRoutines,
  restoreRoutine,
  saveRoutine,
} from './routinesRepo'
import { getActiveWorkout, listFinishedWorkouts, saveWorkout } from './workoutsRepo'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('profile', () => {
  it('starts from defaults and merges changes, including nested settings', async () => {
    expect((await loadProfile()).stepGoal).toBe(8000)
    await saveProfile({
      name: 'Stan',
      settings: { restCompoundSec: 180, restIsolationSec: 90, wakeLock: false, restSound: true },
    })
    const p = await loadProfile()
    expect(p.name).toBe('Stan')
    expect(p.settings.restCompoundSec).toBe(180)
    expect(p.equipment.barKg).toBe(20)
  })
})

describe('workouts', () => {
  it('saves every change and finds the active workout', async () => {
    const active = workout('2026-11-19T17:00:00Z', [exercise('bench', [set(80, 8)])], {
      finishedAt: null,
    })
    await saveWorkout(active)
    expect((await getActiveWorkout())?.id).toBe(active.id)

    await saveWorkout({ ...active, finishedAt: '2026-11-19T18:00:00Z' })
    expect(await getActiveWorkout()).toBeNull()
    const finished = await listFinishedWorkouts()
    expect(finished).toHaveLength(1)
    expect(finished[0]!.createdAt).toBeTruthy()
  })

  it('records every change in the outbox for later sync', async () => {
    const w = workout('2026-11-19T17:00:00Z', [], { finishedAt: null })
    await saveWorkout(w)
    await saveWorkout(w)
    const entries = await db.outbox.toArray()
    expect(entries.map((e) => [e.table, e.rowId])).toEqual([
      ['workouts', w.id],
      ['workouts', w.id],
    ])
  })
})

describe('routines', () => {
  const routine = {
    id: 'r1',
    name: 'Push A',
    color: 'yellow' as const,
    folder: null,
    exercises: [
      {
        id: 'e1',
        exerciseId: 'bench',
        sets: [],
        restSec: 150,
        progression: 'double' as const,
        incrementKg: null,
        note: '',
        supersetGroup: 'g1',
      },
      {
        id: 'e2',
        exerciseId: 'fly',
        sets: [],
        restSec: 90,
        progression: 'double' as const,
        incrementKg: null,
        note: '',
        supersetGroup: 'g1',
      },
    ],
  }

  it('soft-deletes and restores', async () => {
    await saveRoutine(routine)
    await deleteRoutine('r1')
    expect(await listRoutines()).toHaveLength(0)
    await restoreRoutine('r1')
    expect(await listRoutines()).toHaveLength(1)
  })

  it('copies with new ids but keeps supersets together', () => {
    const copy = copyRoutine(routine, 'Push A (kopie)')
    expect(copy.id).not.toBe('r1')
    expect(copy.exercises.map((e) => e.id)).not.toContain('e1')
    const [a, b] = copy.exercises
    expect(a!.supersetGroup).toBe(b!.supersetGroup)
    expect(a!.supersetGroup).not.toBe('g1')
  })
})

describe('body weight', () => {
  it('keeps one weigh-in per day', async () => {
    await logBodyWeight('2026-11-19', 78.4)
    await logBodyWeight('2026-11-19', 78.1)
    await logBodyWeight('2026-11-18', 78.6)
    expect((await listBodyWeights()).map((w) => [w.day, w.kg])).toEqual([
      ['2026-11-18', 78.6],
      ['2026-11-19', 78.1],
    ])
  })
})
