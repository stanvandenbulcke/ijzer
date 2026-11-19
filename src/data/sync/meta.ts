import { db } from '../db'

/** The account that owns the data in this local database; null = created without account. */
export async function getOwner(): Promise<string | null> {
  return ((await db.meta.get('ownerId'))?.value as string | undefined) ?? null
}

export async function setOwner(userId: string): Promise<void> {
  await db.meta.put({ key: 'ownerId', value: userId })
}

/** Server time of the newest row already pulled, per remote table. */
export async function getCursor(table: string): Promise<string> {
  return (
    ((await db.meta.get(`cursor:${table}`))?.value as string | undefined) ?? '1970-01-01T00:00:00Z'
  )
}

export async function setCursor(table: string, value: string): Promise<void> {
  await db.meta.put({ key: `cursor:${table}`, value })
}
