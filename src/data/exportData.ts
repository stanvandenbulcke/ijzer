import { APP_VERSION } from '../app/config'
import { db } from './db'
import { supabase } from './supabase/client'

/** All local data as one JSON file (SPEC §4.11 "data-export"). */
export async function exportAll(): Promise<Blob> {
  const [profile, customExercises, routines, workouts, bodyWeights, checkIns] = await Promise.all([
    db.profile.toArray(),
    db.customExercises.toArray(),
    db.routines.toArray(),
    db.workouts.toArray(),
    db.bodyWeights.toArray(),
    db.checkIns.toArray(),
  ])
  const payload = {
    app: 'IRON',
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    customExercises,
    routines,
    workouts,
    bodyWeights,
    checkIns,
  }
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
}

/** Deletes the whole local database and signs out on this device. */
export async function wipeAll(): Promise<void> {
  await supabase()?.auth.signOut({ scope: 'local' })
  db.close()
  await db.delete()
}
