import { useEffect, useState, useSyncExternalStore } from 'react'
import { useSession } from '../auth'
import { supabase } from '../supabase/client'
import { hasFeature } from '../supabase/config'

export interface Buddy {
  id: string
  name: string
}

/** Your linked buddies (online only: links live on the server, never on another device). */
// Shared refresh signal: linking on one screen updates every user of useBuddies (live agent too).
let version = 0
const listeners = new Set<() => void>()
export function refreshBuddies(): void {
  version++
  listeners.forEach((l) => l())
}

export function useBuddies(): { buddies: Buddy[] | undefined; refresh: () => void } {
  const session = useSession()
  const userId = session?.user.id
  const [rows, setRows] = useState<{ owner: string; list: Buddy[] } | null>(null)
  const current = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => version,
  )
  useEffect(() => {
    const client = supabase()
    if (!client || !userId || !hasFeature('together')) return undefined
    let cancelled = false
    void client
      .from('buddy_links')
      .select('buddy_id, buddy_name')
      .then(({ data }) => {
        if (cancelled) return
        setRows({
          owner: userId,
          list: (data ?? []).map((r) => ({
            id: r.buddy_id as string,
            name: r.buddy_name as string,
          })),
        })
      })
    return () => {
      cancelled = true
    }
  }, [userId, current])
  const buddies = !userId ? [] : rows?.owner === userId ? rows.list : undefined
  return { buddies, refresh: refreshBuddies }
}

export async function createInvite(): Promise<string | null> {
  const { data, error } = (await supabase()?.rpc('create_buddy_invite')) ?? {
    data: null,
    error: true,
  }
  return error ? null : (data as string)
}

export type AcceptResult =
  { status: 'ok'; name: string } | { status: 'invalid' | 'own' | 'limit' | 'error' }

export async function acceptInvite(code: string): Promise<AcceptResult> {
  const { data, error } = (await supabase()?.rpc('accept_buddy_invite', { p_code: code })) ?? {
    data: null,
    error: true,
  }
  if (error || !data) return { status: 'error' }
  return data as AcceptResult
}

export async function removeBuddy(id: string): Promise<boolean> {
  const { error } = (await supabase()?.rpc('remove_buddy', { p_buddy: id })) ?? { error: true }
  return !error
}
