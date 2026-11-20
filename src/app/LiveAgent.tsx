import type { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useMemo, useRef } from 'react'
import { useSession } from '../data/auth'
import { useBuddies } from '../data/live/buddies'
import { clearBuddyLive, setBuddyLive, useLiveShare } from '../data/live/liveStore'
import { supabase } from '../data/supabase/client'
import { hasFeature } from '../data/supabase/config'
import { useTrainingData } from '../data/useTrainingData'
import { useActiveWorkout } from '../data/workoutsRepo'
import { liveSnapshot, pairTopic, type LiveSnapshot } from '../domain/training/liveSnapshot'

const SEND_EVERY_MS = 1200

/**
 * Samen trainen (renders nothing): one private Realtime channel per linked buddy. Sends your
 * running workout (when sharing is on) and receives theirs. Only the two linked accounts can
 * join a pair channel (policies on realtime.messages); nothing is stored for the other person.
 */
export function LiveAgent() {
  const session = useSession()
  const userId = session?.user.id
  const { buddies } = useBuddies()
  const share = useLiveShare()
  const active = useActiveWorkout()
  const data = useTrainingData()
  const channels = useRef<RealtimeChannel[]>([])

  const mine = useMemo<LiveSnapshot | null>(() => {
    if (!share || !active || !data) return null
    return liveSnapshot(active, (id) => data.library.byId(id)?.name ?? id)
  }, [share, active, data])
  const latest = useRef(mine)
  useEffect(() => {
    latest.current = mine
  }, [mine])

  const buddyKey = (buddies ?? []).map((b) => b.id).join(',')
  useEffect(() => {
    const client = supabase()
    if (!client || !userId || !buddyKey || !hasFeature('together')) return undefined
    let cancelled = false
    const ids = buddyKey.split(',')
    void (async () => {
      await client.realtime.setAuth()
      if (cancelled) return
      channels.current = ids.map((buddyId) => {
        const channel = client.channel(pairTopic(userId, buddyId), {
          config: { private: true, broadcast: { self: false } },
        })
        const send = () =>
          void channel.send({
            type: 'broadcast',
            event: 'snapshot',
            payload: { from: userId, snapshot: latest.current },
          })
        channel
          .on('broadcast', { event: 'snapshot' }, ({ payload }) => {
            if (payload?.from !== buddyId) return
            setBuddyLive(buddyId, {
              snapshot: (payload.snapshot as LiveSnapshot | null) ?? null,
              receivedAt: new Date().toISOString(),
            })
          })
          // A buddy who opens the app later asks once for the current state.
          .on('broadcast', { event: 'hello' }, ({ payload }) => {
            if (payload?.from === buddyId) send()
          })
          .subscribe((status) => {
            setBuddyLive(buddyId, { connected: status === 'SUBSCRIBED' })
            if (status === 'SUBSCRIBED') {
              void channel.send({ type: 'broadcast', event: 'hello', payload: { from: userId } })
              send()
            }
          })
        return channel
      })
    })()
    return () => {
      cancelled = true
      channels.current.forEach((c) => void client.removeChannel(c))
      channels.current = []
      clearBuddyLive()
    }
  }, [userId, buddyKey])

  // Send your workout a moment after every change (and once when it ends: null).
  const payload = JSON.stringify(mine)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const channel of channels.current)
        void channel.send({
          type: 'broadcast',
          event: 'snapshot',
          payload: { from: userId, snapshot: latest.current },
        })
    }, SEND_EVERY_MS)
    return () => window.clearTimeout(timer)
  }, [payload, userId])

  return null
}
