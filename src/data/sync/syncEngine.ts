import type { SupabaseClient } from '@supabase/supabase-js'
import { db, type SyncedTable } from '../db'
import { supabaseProject } from '../supabase/config'
import {
  fromRemote,
  REMOTE_TABLE,
  remoteWins,
  SYNCED_TABLES,
  syncableTables,
  toRemote,
  type RemoteRow,
} from './mapping'

const active = () => syncableTables(supabaseProject?.notMigrated)
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
  // Tables are independent: send them at the same time (one round trip instead of nine).
  const results = await Promise.allSettled(
    active().map((table) => pushTable(client, userId, table, entries, maxSeq)),
  )
  const failures = results.flatMap((r) => (r.status === 'rejected' ? [String(r.reason)] : []))
  // One table failing (e.g. not migrated yet) never blocks the others; its outbox stays.
  if (failures.length) throw new Error(failures.join('; '))
  return results.reduce((n, r) => n + (r.status === 'fulfilled' ? r.value : 0), 0)
}

async function pushTable(
  client: SupabaseClient,
  userId: string,
  table: SyncedTable,
  entries: Array<{ table: SyncedTable; rowId: string }>,
  maxSeq: number,
): Promise<number> {
  const ids = [...new Set(entries.filter((e) => e.table === table).map((e) => e.rowId))]
  if (ids.length === 0) return 0
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
  await db.outbox
    .where('seq')
    .belowOrEqual(maxSeq)
    .and((e) => e.table === table)
    .delete()
  return payload.length
}

/** Puts a server row into the local database without adding it to the outbox. */
async function applyRemote(table: SyncedTable, row: RemoteRow): Promise<void> {
  const current = (await local(table).bulkGet([table === 'profile' ? 'me' : row.id]))[0] as
    { updatedAt: string; createdAt: string; deletedAt: string | null } | undefined
  if (!remoteWins(current, row)) return
  const next = fromRemote(table, row)
  if (table === 'bodyWeights' || table === 'checkIns' || table === 'nutritionDays') {
    // One row per day: a row for the same day from another device replaces ours (newest wins).
    const perDay = db[table] as unknown as typeof db.bodyWeights
    const day = (next as { day?: string }).day
    const sameDay = day ? await perDay.where('day').equals(day).first() : undefined
    if (sameDay && sameDay.id !== next.id) {
      if (Date.parse(sameDay.updatedAt) > Date.parse(row.updated_at)) return
      await perDay.delete(sameDay.id)
    }
  }
  await (db[table] as unknown as { put: (r: unknown) => Promise<unknown> }).put(next)
}

/**
 * Re-read this much before the cursor on every pull. Rows from transactions that committed
 * slightly out of order are then still picked up; applying a row twice is harmless.
 */
export const OVERLAP_MS = 5 * 60_000

/**
 * Fetches every row changed on the server since the last pull (by server time). Pages are
 * ordered by (server_updated_at, id), so rows with the same timestamp are never skipped at a
 * page boundary (data-loss review).
 */
export async function pull(client: SupabaseClient, pageSize = PAGE): Promise<number> {
  const results = await Promise.allSettled(
    active().map((table) => pullTable(client, table, pageSize)),
  )
  const failures = results.flatMap((r) => (r.status === 'rejected' ? [String(r.reason)] : []))
  if (failures.length) throw new Error(failures.join('; '))
  return results.reduce((n, r) => n + (r.status === 'fulfilled' ? r.value : 0), 0)
}

async function pullTable(client: SupabaseClient, table: SyncedTable, pageSize: number) {
  let received = 0
  const remote = REMOTE_TABLE[table]
  const stored = await getCursor(remote)
  const since = new Date(Math.max(0, Date.parse(stored) - OVERLAP_MS)).toISOString()
  let after: { ts: string; id: string } | null = null
  let newest = stored
  for (;;) {
    let query = client
      .from(remote)
      .select('id, data, created_at, updated_at, deleted_at, server_updated_at')
      .order('server_updated_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(pageSize)
    query = after
      ? query.or(
          `server_updated_at.gt."${after.ts}",and(server_updated_at.eq."${after.ts}",id.gt.${after.id})`,
        )
      : query.gte('server_updated_at', since)
    const { data, error } = await query
    if (error) throw new Error(`pull ${table}: ${error.message}`)
    const rows = (data ?? []) as RemoteRow[]
    await db.transaction('rw', [db[table], db.meta], async () => {
      for (const row of rows) await applyRemote(table, row)
    })
    received += rows.length
    const last = rows.at(-1)
    if (last?.server_updated_at) {
      after = { ts: last.server_updated_at, id: last.id }
      if (Date.parse(last.server_updated_at) > Date.parse(newest)) newest = last.server_updated_at
    }
    if (rows.length < pageSize) break
  }
  if (newest !== stored) await setCursor(remote, newest)
  return received
}

/** Puts every local row in the outbox, e.g. when local-only data is moved into an account. */
export async function enqueueEverything(options: { skipProfile?: boolean } = {}): Promise<void> {
  const now = new Date().toISOString()
  await db.transaction('rw', [...SYNCED_TABLES.map((t) => db[t]), db.outbox], async () => {
    for (const table of SYNCED_TABLES) {
      if (table === 'profile' && options.skipProfile) continue
      const keys = (await (
        db[table] as unknown as { toCollection: () => { primaryKeys: () => Promise<string[]> } }
      )
        .toCollection()
        .primaryKeys()) as string[]
      await db.outbox.bulkAdd(keys.map((rowId) => ({ table, rowId, at: now })))
    }
  })
}
