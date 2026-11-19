import type { SupabaseClient } from '@supabase/supabase-js'
import { db, type SyncedTable } from '../db'
import {
  fromRemote,
  REMOTE_TABLE,
  remoteWins,
  SYNCED_TABLES,
  toRemote,
  type RemoteRow,
} from './mapping'
import { getCursor, setCursor } from './meta'

const PAGE = 500
const CHUNK = 200

type LocalTable = (typeof db)[SyncedTable]
const local = (table: SyncedTable) =>
  db[table] as unknown as LocalTable & {
    bulkGet: (ids: string[]) => Promise<Array<Record<string, unknown> | undefined>>
  }

/**
 * Sends every row listed in the outbox to the server (upsert; the server keeps the newer
 * version, see supabase/migrations). Outbox entries are removed only after a successful send.
 */
export async function push(client: SupabaseClient, userId: string): Promise<number> {
  const entries = await db.outbox.orderBy('seq').toArray()
  if (entries.length === 0) return 0
  const maxSeq = entries.at(-1)!.seq!
  let sent = 0
  for (const table of SYNCED_TABLES) {
    const ids = [...new Set(entries.filter((e) => e.table === table).map((e) => e.rowId))]
    if (ids.length === 0) continue
    const rows = (await local(table).bulkGet(ids)).filter(Boolean) as unknown as Array<
      Parameters<typeof toRemote>[1]
    >
    const payload = rows.map((row) => ({
      ...toRemote(table, row, userId),
      ...(table === 'profile' ? {} : { user_id: userId }),
    }))
    for (let i = 0; i < payload.length; i += CHUNK) {
      const { error } = await client
        .from(REMOTE_TABLE[table])
        .upsert(payload.slice(i, i + CHUNK), { onConflict: 'id' })
      if (error) throw new Error(`push ${table}: ${error.message}`)
    }
    sent += payload.length
  }
  await db.outbox.where('seq').belowOrEqual(maxSeq).delete()
  return sent
}

/** Puts a server row into the local database without adding it to the outbox. */
async function applyRemote(table: SyncedTable, row: RemoteRow): Promise<void> {
  const current = (await local(table).bulkGet([table === 'profile' ? 'me' : row.id]))[0] as
    { updatedAt: string; createdAt: string; deletedAt: string | null } | undefined
  if (!remoteWins(current, row)) return
  const next = fromRemote(table, row)
  if (table === 'bodyWeights') {
    // One weigh-in per day: a row for the same day from another device replaces ours.
    const day = (next as { day?: string }).day
    const sameDay = day ? await db.bodyWeights.where('day').equals(day).first() : undefined
    if (sameDay && sameDay.id !== next.id) {
      if (Date.parse(sameDay.updatedAt) > Date.parse(row.updated_at)) return
      await db.bodyWeights.delete(sameDay.id)
    }
  }
  await (db[table] as unknown as { put: (r: unknown) => Promise<unknown> }).put(next)
}

/** Fetches every row changed on the server since the last pull (by server time). */
export async function pull(client: SupabaseClient): Promise<number> {
  let received = 0
  for (const table of SYNCED_TABLES) {
    const remote = REMOTE_TABLE[table]
    let cursor = await getCursor(remote)
    for (;;) {
      const { data, error } = await client
        .from(remote)
        .select('id, data, created_at, updated_at, deleted_at, server_updated_at')
        .gt('server_updated_at', cursor)
        .order('server_updated_at', { ascending: true })
        .limit(PAGE)
      if (error) throw new Error(`pull ${table}: ${error.message}`)
      const rows = (data ?? []) as RemoteRow[]
      await db.transaction('rw', [db[table], db.meta], async () => {
        for (const row of rows) await applyRemote(table, row)
        if (rows.length) await setCursor(remote, rows.at(-1)!.server_updated_at!)
      })
      received += rows.length
      if (rows.length < PAGE) break
      cursor = rows.at(-1)!.server_updated_at!
    }
  }
  return received
}

/** Puts every local row in the outbox, e.g. when local-only data is moved into an account. */
export async function enqueueEverything(): Promise<void> {
  const now = new Date().toISOString()
  await db.transaction('rw', [...SYNCED_TABLES.map((t) => db[t]), db.outbox], async () => {
    for (const table of SYNCED_TABLES) {
      const keys = (await (
        db[table] as unknown as { toCollection: () => { primaryKeys: () => Promise<string[]> } }
      )
        .toCollection()
        .primaryKeys()) as string[]
      await db.outbox.bulkAdd(keys.map((rowId) => ({ table, rowId, at: now })))
    }
  })
}
