import { useLiveQuery } from 'dexie-react-hooks'
import { db, type CheckInRow } from './db'
import { enqueue, newId, notDeleted, stamp } from './rows'

/** All check-ins, oldest first. */
export async function listCheckIns(): Promise<CheckInRow[]> {
  return (await db.checkIns.orderBy('day').toArray()).filter(notDeleted)
}

export function useCheckIns(): CheckInRow[] | undefined {
  return useLiveQuery(listCheckIns)
}

/** One check-in per day: answering again on the same day updates it. */
export async function saveCheckIn(
  day: string,
  values: Partial<Pick<CheckInRow, 'energy' | 'sleep'>>,
): Promise<void> {
  await db.transaction('rw', db.checkIns, db.outbox, async () => {
    const existing = await db.checkIns.where('day').equals(day).first()
    const row = stamp({
      energy: 0,
      sleep: 0,
      ...existing,
      ...values,
      id: existing?.id ?? newId(),
      day,
      deletedAt: null,
    })
    await db.checkIns.put(row)
    await enqueue('checkIns', row.id)
  })
}
