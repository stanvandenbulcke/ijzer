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

const SHARE_KEY = 'iron.liveShare'

/** "Deel mijn training live": on by default once you link with someone, per device. */
export function getLiveShare(): boolean {
  try {
    return localStorage.getItem(SHARE_KEY) !== 'off'
  } catch {
    return true
  }
}

export function setLiveShare(on: boolean): void {
  try {
    localStorage.setItem(SHARE_KEY, on ? 'on' : 'off')
  } catch {
    // Storage blocked: the choice holds for this visit only.
  }
  shareListeners.forEach((l) => l())
}

const shareListeners = new Set<() => void>()
export function useLiveShare(): boolean {
  return useSyncExternalStore((l) => {
    shareListeners.add(l)
    return () => shareListeners.delete(l)
  }, getLiveShare)
}
