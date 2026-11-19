import { useSyncExternalStore } from 'react'

export type SyncState = 'idle' | 'syncing' | 'offline' | 'error' | 'signed-out'

export interface SyncStatus {
  state: SyncState
  lastSyncedAt: string | null
}

let status: SyncStatus = { state: 'signed-out', lastSyncedAt: null }
const listeners = new Set<() => void>()

export function setSyncStatus(changes: Partial<SyncStatus>): void {
  status = { ...status, ...changes }
  listeners.forEach((l) => l())
}

/** "Alles opgeslagen" / "Wacht op netwerk" / "Fout — tik om opnieuw te proberen" (SPEC §7.2). */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => status,
  )
}
