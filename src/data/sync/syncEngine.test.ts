import 'fake-indexeddb/auto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it } from 'vitest'
import { logBodyWeight } from '../bodyRepo'
import { saveCheckIn } from '../checkInsRepo'
import { db } from '../db'
import { getCursor } from './meta'
import { pull, push } from './syncEngine'

/**
 * A tiny in-memory stand-in for the Supabase query builder: just enough of select / order /
 * limit / gte / or / upsert to run push and pull against, including our compound cursor.
 */
type Row = Record<string, unknown> & { id: string; server_updated_at: string }

function fakeClient(tables: Record<string, Row[]>, hooks: { onUpsert?: () => Promise<void> } = {}) {
  const calls = {
    upserts: [] as Array<{ table: string; rows: Row[] }>,
    failUpsert: false,
    failTables: new Set<string>(),
  }
  const from = (table: string) => {
    const rows = (tables[table] ??= [])
    let filter: (r: Row) => boolean = () => true
    let limit = Infinity
    const builder = {
      select: () => builder,
      order: () => builder,
      limit: (n: number) => ((limit = n), builder),
      gte: (_col: string, value: string) => (
        (filter = (r) => r.server_updated_at >= value),
        builder
      ),
      or: (expr: string) => {
        // server_updated_at.gt."TS",and(server_updated_at.eq."TS",id.gt.ID)
        const m = /gt\."([^"]+)",and\(server_updated_at\.eq\."([^"]+)",id\.gt\.(.+)\)$/.exec(expr)
        if (!m) throw new Error(`unexpected filter ${expr}`)
        const [, ts, , id] = m
        filter = (r) => r.server_updated_at > ts! || (r.server_updated_at === ts && r.id > id!)
        return builder
      },
      upsert: async (payload: Row[]) => {
        await hooks.onUpsert?.()
        if (calls.failUpsert) return { error: { message: 'offline' } }
        if (calls.failTables.has(table)) return { error: { message: `no table ${table}` } }
        calls.upserts.push({ table, rows: payload })
        return { error: null }
      },
      then: (resolve: (v: { data: Row[]; error: null }) => void) => {
        const data = rows
          .filter(filter)
          .sort((a, b) =>
            a.server_updated_at === b.server_updated_at
              ? a.id.localeCompare(b.id)
              : a.server_updated_at.localeCompare(b.server_updated_at),
          )
          .slice(0, limit)
        resolve({ data, error: null })
      },
    }
    return builder
  }
  return { client: { from } as unknown as SupabaseClient, calls }
}

const remoteWeight = (id: string, day: string, kg: number, ts: string, updated = ts): Row => ({
  id,
  data: { id, day, kg },
  created_at: updated,
  updated_at: updated,
  deleted_at: null,
  server_updated_at: ts,
})

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('push', () => {
  it('sends outbox rows with the user id and only then clears the outbox', async () => {
    await logBodyWeight('2026-11-19', 78.4)
    const { client, calls } = fakeClient({})
    expect(await push(client, 'user-a')).toBe(1)
    expect(calls.upserts[0]!.table).toBe('body_weights')
    expect(calls.upserts[0]!.rows[0]).toMatchObject({ user_id: 'user-a' })
    expect(await db.outbox.count()).toBe(0)
  })

  it('keeps the outbox when the server refuses, so nothing is lost', async () => {
    await logBodyWeight('2026-11-19', 78.4)
    const { client, calls } = fakeClient({})
    calls.failUpsert = true
    await expect(push(client, 'user-a')).rejects.toThrow('offline')
    expect(await db.outbox.count()).toBe(1)
  })

  it('sends the other tables when one table fails, and keeps only that outbox', async () => {
    await logBodyWeight('2026-11-19', 78.4)
    await saveCheckIn('2026-11-19', { energy: 4, sleep: 3 })
    const { client, calls } = fakeClient({})
    calls.failTables.add('check_ins')
    await expect(push(client, 'user-a')).rejects.toThrow('no table check_ins')
    expect(calls.upserts.map((u) => u.table)).toEqual(['body_weights'])
    const left = await db.outbox.toArray()
    expect(left.map((e) => e.table)).toEqual(['checkIns'])
  })

  it('keeps changes made while a push is running for the next round', async () => {
    await logBodyWeight('2026-11-19', 78.4)
    const { client } = fakeClient(
      {},
      { onUpsert: () => logBodyWeight('2026-11-20', 78.1) }, // a tap during the upload
    )
    await push(client, 'user-a')
    expect(await db.outbox.count()).toBe(1)
  })
})

describe('pull', () => {
  it('never skips rows that share a timestamp across a page boundary', async () => {
    const ts = '2026-11-20T10:00:00.000Z'
    const rows = ['a', 'b', 'c', 'd', 'e'].map((id, i) =>
      remoteWeight(id, `2026-11-1${i}`, 70 + i, ts),
    )
    const { client } = fakeClient({ body_weights: rows })
    expect(await pull(client, 2)).toBe(5)
    expect(await db.bodyWeights.count()).toBe(5)
    expect(await getCursor('body_weights')).toBe(ts)
    // Nothing goes to the outbox: pulled rows are not sent back.
    expect(await db.outbox.count()).toBe(0)
  })

  it('keeps a newer local edit (last write wins on the edit time, not arrival)', async () => {
    await logBodyWeight('2026-11-19', 80)
    const mine = (await db.bodyWeights.toArray())[0]!
    const older = remoteWeight(
      mine.id,
      '2026-11-19',
      75,
      '2026-11-20T10:00:00.000Z',
      '2000-01-01T00:00:00.000Z',
    )
    const { client } = fakeClient({ body_weights: [older] })
    await pull(client)
    expect((await db.bodyWeights.get(mine.id))!.kg).toBe(80)
  })

  it('re-reads a short overlap before the cursor, without duplicating rows', async () => {
    const first = remoteWeight('a', '2026-11-18', 70, '2026-11-20T10:00:00.000Z')
    const tables = { body_weights: [first] }
    const { client } = fakeClient(tables)
    await pull(client)
    // A row that committed late with a slightly older server time is still picked up.
    tables.body_weights.push(remoteWeight('b', '2026-11-19', 71, '2026-11-20T09:58:00.000Z'))
    await pull(client)
    expect(await db.bodyWeights.count()).toBe(2)
  })
})
