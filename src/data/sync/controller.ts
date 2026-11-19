import { db, type SyncedTable } from '../db'
import { getSession } from '../auth'
import { supabase } from '../supabase/client'
import { SYNCED_TABLES } from './mapping'
import { getOwner, setOwner } from './meta'
import { setSyncStatus } from './status'
import { enqueueEverything, pull, push } from './syncEngine'

let running: Promise<void> | null = null
let timer: number | undefined

/** One sync round: send local changes, then fetch changes from other devices. */
export function syncNow(): Promise<void> {
  running ??= (async () => {
    const client = supabase()
    const { data } = (await client?.auth.getSession()) ?? { data: { session: null } }
    const userId = data.session?.user.id
    if (!client || !userId) return setSyncStatus({ state: 'signed-out' })
    if ((await getOwner()) !== userId) return // first decide what happens with local data
    if (!navigator.onLine) return setSyncStatus({ state: 'offline' })
    setSyncStatus({ state: 'syncing' })
    try {
      await push(client, userId)
      await pull(client)
      setSyncStatus({ state: 'idle', lastSyncedAt: new Date().toISOString() })
    } catch {
      setSyncStatus({ state: navigator.onLine ? 'error' : 'offline' })
    }
  })().finally(() => {
    running = null
  })
  return running
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

/**
 * Called right after signing in. Data of another account is removed from this device; data
 * created without an account needs a choice from the user ('choose').
 */
export async function afterSignIn(userId: string): Promise<'ready' | 'choose'> {
  const owner = await getOwner()
  if (owner !== userId) {
    if (owner) await clearLocal()
    else if (await hasLocalData()) return 'choose'
    await setOwner(userId)
  }
  await syncNow()
  return 'ready'
}

/** Keep what was logged without an account: it becomes part of this account. */
export async function keepLocalData(userId: string): Promise<void> {
  await setOwner(userId)
  await enqueueEverything()
  await syncNow()
}

/** Start from the account's own data instead. */
export async function discardLocalData(userId: string): Promise<void> {
  await clearLocal()
  await setOwner(userId)
  await syncNow()
}

/** Signs out after a last sync and removes this account's data from the device (privacy). */
export async function signOutEverywhere(): Promise<void> {
  if (getSession()) await syncNow().catch(() => undefined)
  await clearLocal()
  await supabase()?.auth.signOut()
  setSyncStatus({ state: 'signed-out', lastSyncedAt: null })
}
