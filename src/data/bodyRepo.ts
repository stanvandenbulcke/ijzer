import { useLiveQuery } from 'dexie-react-hooks'
import { db, type BodyWeightRow } from './db'
import { enqueue, newId, notDeleted, now, stamp } from './rows'

/** All weigh-ins, oldest first. */
export async function listBodyWeights(): Promise<BodyWeightRow[]> {
  return (await db.bodyWeights.orderBy('day').toArray()).filter(notDeleted)
}

export function useBodyWeights(): BodyWeightRow[] | undefined {
  return useLiveQuery(listBodyWeights)
}

/** One weigh-in per day: logging again on the same day replaces it. */
export async function logBodyWeight(day: string, kg: number): Promise<void> {
  await db.transaction('rw', db.bodyWeights, db.outbox, async () => {
    const existing = await db.bodyWeights.where('day').equals(day).first()
    const row = stamp({ ...existing, id: existing?.id ?? newId(), day, kg, deletedAt: null })
    await db.bodyWeights.put(row)
    await enqueue('bodyWeights', row.id)
  })
}

export async function deleteBodyWeight(id: string): Promise<void> {
  await db.transaction('rw', db.bodyWeights, db.outbox, async () => {
    await db.bodyWeights.update(id, { deletedAt: now(), updatedAt: now() })
    await enqueue('bodyWeights', id)
  })
}
