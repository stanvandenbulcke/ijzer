import type { Exercise } from '../domain/training/types'
import { db, type ExerciseRow } from './db'
import { enqueue, notDeleted, now, stamp } from './rows'

export async function listCustomExercises(): Promise<ExerciseRow[]> {
  return (await db.customExercises.toArray()).filter(notDeleted)
}

export async function saveCustomExercise(exercise: Exercise): Promise<void> {
  await db.transaction('rw', db.customExercises, db.outbox, async () => {
    const existing = await db.customExercises.get(exercise.id)
    await db.customExercises.put(
      stamp({ ...existing, ...exercise, custom: true, quality: 'custom' }),
    )
    await enqueue('customExercises', exercise.id)
  })
}

export async function deleteCustomExercise(id: string): Promise<void> {
  await db.transaction('rw', db.customExercises, db.outbox, async () => {
    await db.customExercises.update(id, { deletedAt: now(), updatedAt: now() })
    await enqueue('customExercises', id)
  })
}
