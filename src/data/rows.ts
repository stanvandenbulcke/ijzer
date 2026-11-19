import { db, type RowMeta, type SyncedTable } from './db'

export const newId = (): string => crypto.randomUUID()
export const now = (): string => new Date().toISOString()

/** Adds or refreshes the sync metadata of a row. */
export function stamp<T extends object>(row: T & Partial<RowMeta>): T & RowMeta {
  const time = now()
  return {
    ...row,
    createdAt: row.createdAt ?? time,
    updatedAt: time,
    deletedAt: row.deletedAt ?? null,
  }
}

/** Records that a row changed, in the same transaction as the change itself. */
export function enqueue(table: SyncedTable, rowId: string): Promise<number> {
  return db.outbox.add({ table, rowId, at: now() })
}

export const notDeleted = <T extends RowMeta>(row: T): boolean => row.deletedAt === null
