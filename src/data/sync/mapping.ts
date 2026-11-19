import type { RowMeta, SyncedTable } from '../db'

/** Local Dexie table → Postgres table (supabase/migrations). */
export const REMOTE_TABLE: Record<SyncedTable, string> = {
  profile: 'profiles',
  customExercises: 'custom_exercises',
  routines: 'routines',
  workouts: 'workouts',
  bodyWeights: 'body_weights',
}

export const SYNCED_TABLES = Object.keys(REMOTE_TABLE) as SyncedTable[]

export interface RemoteRow {
  id: string
  data: unknown
  created_at: string
  updated_at: string
  deleted_at: string | null
  server_updated_at?: string
}

type LocalRow = RowMeta & { id: string } & Record<string, unknown>

/**
 * Local row → server row. Sync metadata goes into columns, everything else into `data`.
 * The single local profile row ("me") becomes the row with the user's id.
 */
export function toRemote(table: SyncedTable, row: LocalRow, userId: string): RemoteRow {
  const { createdAt, updatedAt, deletedAt, id, ...rest } = row
  return {
    id: table === 'profile' ? userId : id,
    data: table === 'profile' ? rest.profile : rest,
    created_at: createdAt,
    updated_at: updatedAt,
    deleted_at: deletedAt,
  }
}

/** Server row → local row (inverse of `toRemote`). */
export function fromRemote(table: SyncedTable, row: RemoteRow): LocalRow {
  const meta = { createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at }
  if (table === 'profile') return { id: 'me', profile: row.data, ...meta }
  return { ...(row.data as Record<string, unknown>), id: row.id, ...meta }
}

/** Last-write-wins: take the server row when we have none or ours is not newer. */
export function remoteWins(local: RowMeta | undefined, remote: RemoteRow): boolean {
  return !local || Date.parse(local.updatedAt) <= Date.parse(remote.updated_at)
}
