import { useLiveQuery } from 'dexie-react-hooks'
import type { Routine } from '../domain/training/types'
import { db, type RoutineRow } from './db'
import { enqueue, newId, notDeleted, now, stamp } from './rows'

export async function listRoutines(): Promise<RoutineRow[]> {
  return (await db.routines.orderBy('sortOrder').toArray()).filter(notDeleted)
}

export function useRoutines(): RoutineRow[] | undefined {
  return useLiveQuery(listRoutines)
}

export function useRoutine(id: string | undefined): RoutineRow | null | undefined {
  return useLiveQuery(async () => {
    const row = id ? await db.routines.get(id) : undefined
    return row && notDeleted(row) ? row : null
  }, [id])
}

export async function saveRoutine(routine: Routine): Promise<RoutineRow> {
  return db.transaction('rw', db.routines, db.outbox, async () => {
    const existing = await db.routines.get(routine.id)
    const sortOrder = existing?.sortOrder ?? (await db.routines.count())
    const row = stamp({ ...existing, ...routine, sortOrder })
    await db.routines.put(row)
    await enqueue('routines', row.id)
    return row
  })
}

export async function deleteRoutine(id: string): Promise<void> {
  await db.transaction('rw', db.routines, db.outbox, async () => {
    await db.routines.update(id, { deletedAt: now(), updatedAt: now() })
    await enqueue('routines', id)
  })
}

/** Restores a routine deleted moments ago ("Ongedaan maken"). */
export async function restoreRoutine(id: string): Promise<void> {
  await db.transaction('rw', db.routines, db.outbox, async () => {
    await db.routines.update(id, { deletedAt: null, updatedAt: now() })
    await enqueue('routines', id)
  })
}

/** Copy with new ids for the routine and each of its exercises. */
export function copyRoutine(routine: Routine, name: string): Routine {
  const groups = new Map<string, string>()
  return {
    ...routine,
    id: newId(),
    name,
    example: false,
    exercises: routine.exercises.map((e) => ({
      ...e,
      id: newId(),
      supersetGroup: e.supersetGroup
        ? (groups.get(e.supersetGroup) ??
          groups.set(e.supersetGroup, newId()).get(e.supersetGroup)!)
        : null,
      sets: e.sets.map((s) => ({ ...s })),
    })),
  }
}
