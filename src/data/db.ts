import Dexie, { type Table } from 'dexie'
import type { Profile } from '../domain/profile/types'
import type { Exercise, Routine, Workout } from '../domain/training/types'

/** Sync bookkeeping on every row (SPEC §7.1). Deleted rows stay as tombstones for sync. */
export interface RowMeta {
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ExerciseRow = Exercise & RowMeta
export type RoutineRow = Routine & RowMeta & { sortOrder: number }
export type WorkoutRow = Workout & RowMeta
export interface BodyWeightRow extends RowMeta {
  id: string
  /** "YYYY-MM-DD", one entry per day. */
  day: string
  kg: number
}
export interface ProfileRow extends RowMeta {
  id: 'me'
  profile: Profile
}

/** Pending change to send to the server once accounts are connected (SPEC §7.2). */
export interface OutboxEntry {
  seq?: number
  table: SyncedTable
  rowId: string
  at: string
}

export type SyncedTable = 'profile' | 'customExercises' | 'routines' | 'workouts' | 'bodyWeights'

/** Small key-value store for sync bookkeeping: owner of the local data, pull cursors. */
export interface MetaRow {
  key: string
  value: unknown
}

/**
 * Local database (IndexedDB via Dexie). Every change is written here first, so nothing is
 * lost without network or when the app is closed mid-workout (SPEC §4.4 "Robuustheid").
 */
export class IjzerDb extends Dexie {
  profile!: Table<ProfileRow, string>
  customExercises!: Table<ExerciseRow, string>
  routines!: Table<RoutineRow, string>
  workouts!: Table<WorkoutRow, string>
  bodyWeights!: Table<BodyWeightRow, string>
  outbox!: Table<OutboxEntry, number>
  meta!: Table<MetaRow, string>

  constructor(name = 'ijzer') {
    super(name)
    this.version(1).stores({
      profile: 'id',
      customExercises: 'id, updatedAt',
      routines: 'id, sortOrder, updatedAt',
      workouts: 'id, startedAt, finishedAt, updatedAt',
      bodyWeights: 'id, &day, updatedAt',
      outbox: '++seq, table, rowId',
    })
    // v2: accounts. `meta` holds which user owns the local data and the pull cursors.
    this.version(2).stores({ meta: 'key' })
  }
}

export const db = new IjzerDb()

/** Asks the browser to keep our data even when storage runs low (SPEC §7.2). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}
