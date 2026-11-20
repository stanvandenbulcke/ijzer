import { useSyncExternalStore } from 'react'
import type { LiveSnapshot } from '../../domain/training/liveSnapshot'

/** What each linked buddy is doing right now, as received over their pair channel. */
export interface BuddyLive {
  /** The pair channel is open (you will see updates). */
  connected: boolean
  /** null = not training. */
  snapshot: LiveSnapshot | null
  receivedAt: string | null
}

let state: Record<string, BuddyLive> = {}
const listeners = new Set<() => void>()

export function setBuddyLive(buddyId: string, change: Partial<BuddyLive>): void {
  const current = state[buddyId] ?? { connected: false, snapshot: null, receivedAt: null }
  state = { ...state, [buddyId]: { ...current, ...change } }
  listeners.forEach((l) => l())
}

export function clearBuddyLive(): void {
  state = {}
  listeners.forEach((l) => l())
}

export function useBuddyLive(): Record<string, BuddyLive> {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}
