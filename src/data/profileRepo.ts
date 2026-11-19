import { useLiveQuery } from 'dexie-react-hooks'
import { DEFAULT_PROFILE } from '../domain/profile/defaults'
import type { Profile } from '../domain/profile/types'
import { db } from './db'
import { enqueue, stamp } from './rows'

/** Merges stored data over the defaults, so new settings get a value after an update. */
function withDefaults(stored: Partial<Profile> | undefined): Profile {
  return {
    ...DEFAULT_PROFILE,
    ...stored,
    equipment: { ...DEFAULT_PROFILE.equipment, ...stored?.equipment },
    settings: { ...DEFAULT_PROFILE.settings, ...stored?.settings },
  }
}

export async function loadProfile(): Promise<Profile> {
  return withDefaults((await db.profile.get('me'))?.profile)
}

export async function saveProfile(changes: Partial<Profile>): Promise<Profile> {
  return db.transaction('rw', db.profile, db.outbox, async () => {
    const existing = await db.profile.get('me')
    const profile = withDefaults({ ...existing?.profile, ...changes })
    await db.profile.put(stamp({ ...existing, id: 'me', profile }))
    await enqueue('profile', 'me')
    return profile
  })
}

/** The profile, live. `undefined` while loading. */
export function useProfile(): Profile | undefined {
  return useLiveQuery(loadProfile)
}
