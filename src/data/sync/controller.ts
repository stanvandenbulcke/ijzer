import { db, type SyncedTable } from '../db'
import { getSession } from '../auth'
import { supabase } from '../supabase/client'
import { SYNCED_TABLES } from './mapping'
import { getOwner, setOwner } from './meta'
import { setSyncStatus } from './status'
import { enqueueEverything, pull, push } from './syncEngine'

let current: Promise<void> | null = null
let queued: Promise<void> | null = null
let timer: number | undefined

async function syncRound(): Promise<void> {
  const client = supabase()
  const { data } = (await client?.auth.getSession()) ?? { data: { session: null } }
  const userId = data.session?.user.id
  if (!client || !userId) return setSyncStatus({ state: 'signed-out' })
  if ((await getOwner()) !== userId) return setSyncStatus({ state: 'needs-choice' })
  if (!navigator.onLine) return setSyncStatus({ state: 'offline' })
  setSyncStatus({ state: 'syncing' })
  try {
    await push(client, userId)
    await pull(client)
    setSyncStatus({ state: 'idle', lastSyncedAt: new Date().toISOString() })
  } catch {
    setSyncStatus({ state: navigator.onLine ? 'error' : 'offline' })
  }
}

/**
 * One sync round: send local changes, then fetch changes from other devices. A call while a
 * round runs gets the NEXT round (one shared by all such calls), so changes made during a sync
 * are never left behind, and nobody waits longer than the round that includes their change.
 */
export function syncNow(): Promise<void> {
  if (!current) {
    current = syncRound().finally(() => {
      current = null
    })
    return current
  }
  queued ??= current.then(() => {
    queued = null
    return syncNow()
  })
  return queued
}

/** Number of local changes that are not in the cloud yet. */
export function pendingChanges(): Promise<number> {
  return db.outbox.count()
}

/** Sync shortly after a change, so quick taps are sent together. */
export function scheduleSync(delayMs = 1500): void {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => void syncNow(), delayMs)
}

/** Keeps the cloud copy current: after changes, on focus, when back online, every minute. */
export function startAutoSync(): () => void {
  const onVisible = () => document.visibilityState === 'visible' && void syncNow()
  const onOnline = () => void syncNow()
  const onChange = () => scheduleSync()
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('online', onOnline)
  db.outbox.hook('creating', onChange)
  const interval = window.setInterval(() => void syncNow(), 60_000)
  void syncNow()
  return () => {
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('online', onOnline)
    db.outbox.hook('creating').unsubscribe(onChange)
    window.clearInterval(interval)
  }
}

async function clearLocal(): Promise<void> {
  await db.transaction(
    'rw',
    [...SYNCED_TABLES.map((t: SyncedTable) => db[t]), db.outbox, db.meta],
    async () => {
      await Promise.all([
        ...SYNCED_TABLES.map((t) => db[t].clear()),
        db.outbox.clear(),
        db.meta.clear(),
      ])
    },
  )
}

/** Did someone already use the app on this device without an account? */
export async function hasLocalData(): Promise<boolean> {
  const [profile, workouts, routines, weights] = await Promise.all([
    db.profile.get('me'),
    db.workouts.count(),
    db.routines.count(),
    db.bodyWeights.count(),
  ])
  return Boolean(profile?.profile.onboardedAt) || workouts + routines + weights > 0
}

export type Ownership = 'ok' | 'choose' | 'switch'

/**
 * Ties the data on this device to the signed-in account. Never removes anything that is not in
 * the cloud yet: data made without an account needs a choice ('choose'), unsynced changes of
 * another account need a confirmation ('switch'). Safe to call more than once.
 */
export async function resolveOwnership(userId: string): Promise<Ownership> {
  const owner = await getOwner()
  if (owner === userId) return 'ok'
  if (owner) {
    if ((await pendingChanges()) > 0) return 'switch'
    await clearLocal()
  } else if (await hasLocalData()) return 'choose'
  await setOwner(userId)
  return 'ok'
}

/** Called right after signing in: resolve ownership, then fetch the account's data. */
export async function afterSignIn(userId: string): Promise<Ownership> {
  const outcome = await resolveOwnership(userId)
  if (outcome === 'ok') await syncNow()
  return outcome
}

/** Confirmed: remove another account's data from this device and continue with this one. */
export async function switchAccount(userId: string): Promise<void> {
  await clearLocal()
  await setOwner(userId)
  await syncNow()
}

/** Signs out on this device only and keeps the local data as it is (cancelled sign-in). */
export async function signOutKeepingData(): Promise<void> {
  await supabase()?.auth.signOut({ scope: 'local' })
  setSyncStatus({ state: 'signed-out', lastSyncedAt: null })
}

/** Keep what was logged without an account: it becomes part of this account. */
export async function keepLocalData(userId: string): Promise<void> {
  await setOwner(userId)
  const client = supabase()
  // An existing account keeps its own profile (name, goal, settings); the rest is merged.
  const { data } = (await client?.from('profiles').select('id').eq('id', userId).maybeSingle()) ?? {
    data: null,
  }
  await enqueueEverything({ skipProfile: Boolean(data) })
  if (data) await db.profile.delete('me')
  await syncNow()
}

/** Start from the account's own data instead. */
export async function discardLocalData(userId: string): Promise<void> {
  await clearLocal()
  await setOwner(userId)
  await syncNow()
}

/**
 * Signs out after a last sync and removes this account's data from this device (privacy).
 * Returns the number of changes that could not be sent: then nothing is removed unless
 * `force` is set after the user explicitly confirmed losing them.
 */
export async function signOut(force = false): Promise<number> {
  if (getSession()) await syncNow().catch(() => undefined)
  const pending = await pendingChanges()
  if (pending > 0 && !force) return pending
  await clearLocal()
  await supabase()?.auth.signOut({ scope: 'local' })
  setSyncStatus({ state: 'signed-out', lastSyncedAt: null })
  return 0
}
