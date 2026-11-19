import { useLiveQuery } from 'dexie-react-hooks'
import type { Workout } from '../domain/training/types'
import { db, type WorkoutRow } from './db'
import { enqueue, notDeleted, now, stamp } from './rows'

/** All finished workouts, newest first. */
export async function listFinishedWorkouts(): Promise<WorkoutRow[]> {
  const rows = await db.workouts.orderBy('startedAt').reverse().toArray()
  return rows.filter((w) => notDeleted(w) && w.finishedAt !== null)
}

export function useFinishedWorkouts(): WorkoutRow[] | undefined {
  return useLiveQuery(listFinishedWorkouts)
}

/** The workout in progress, if any. There is at most one. */
export async function getActiveWorkout(): Promise<WorkoutRow | null> {
  const rows = await db.workouts
    .filter((w) => w.finishedAt === null && w.deletedAt === null)
    .toArray()
  return rows.sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] ?? null
}

export function useActiveWorkout(): WorkoutRow | null | undefined {
  return useLiveQuery(getActiveWorkout)
}

export function useWorkout(id: string | undefined): WorkoutRow | null | undefined {
  return useLiveQuery(async () => {
    const row = id ? await db.workouts.get(id) : undefined
    return row && notDeleted(row) ? row : null
  }, [id])
}

/** Saves immediately; called on every change during a workout. */
export async function saveWorkout(workout: Workout): Promise<WorkoutRow> {
  return db.transaction('rw', db.workouts, db.outbox, async () => {
    const existing = await db.workouts.get(workout.id)
    const row = stamp({ ...existing, ...workout })
    await db.workouts.put(row)
    await enqueue('workouts', row.id)
    return row
  })
}

export async function deleteWorkout(id: string): Promise<void> {
  await db.transaction('rw', db.workouts, db.outbox, async () => {
    await db.workouts.update(id, { deletedAt: now(), updatedAt: now() })
    await enqueue('workouts', id)
  })
}
