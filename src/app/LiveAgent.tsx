import type { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useMemo, useRef } from 'react'
import { useSession } from '../data/auth'
import { useBuddies } from '../data/live/buddies'
import { refreshBuddies } from '../data/live/buddies'
import { clearBuddyLive, setBuddyLive } from '../data/live/liveStore'
import { useProfile } from '../data/profileRepo'
import { supabase } from '../data/supabase/client'
import { hasFeature } from '../data/supabase/config'
import { useTrainingData } from '../data/useTrainingData'
import { useActiveWorkout } from '../data/workoutsRepo'
import { parseLiveSnapshot } from '../domain/training/liveParse'
import {
  LIVE_VERSION,
  liveSnapshot,
  pairTopic,
  type LiveSnapshot,
} from '../domain/training/liveSnapshot'

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
  const share = useProfile()?.settings.liveShare ?? false
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
          latest.current &&
          void channel.send({
            type: 'broadcast',
            event: 'snapshot',
            payload: { from: userId, v: LIVE_VERSION, snapshot: latest.current },
          })
        channel
          .on('broadcast', { event: 'snapshot' }, ({ payload }) => {
            if (payload?.from !== buddyId) return
            setBuddyLive(buddyId, {
              snapshot: parseLiveSnapshot(payload),
              receivedAt: new Date().toISOString(),
            })
          })
          // The link was removed (by either side): stop at once.
          .on('broadcast', { event: 'unlinked' }, () => refreshBuddies())
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

  // Links can change on another device: check again on focus and every few minutes.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && refreshBuddies()
    document.addEventListener('visibilitychange', onVisible)
    const interval = window.setInterval(refreshBuddies, 5 * 60_000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(interval)
    }
  }, [])

  // Send your workout a moment after every change. "Stopped" (null) is sent only by a device
  // that was sharing a workout, so another device of yours never wipes the live view.
  const payload = JSON.stringify(mine)
  const wasSharing = useRef(false)
  useEffect(() => {
    if (!mine && !wasSharing.current) return undefined
    wasSharing.current = mine !== null
    const timer = window.setTimeout(() => {
      for (const channel of channels.current)
        void channel.send({
          type: 'broadcast',
          event: 'snapshot',
          payload: { from: userId, v: LIVE_VERSION, snapshot: latest.current },
        })
    }, SEND_EVERY_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `payload` is the change signal
  }, [payload, userId])

  return null
}
