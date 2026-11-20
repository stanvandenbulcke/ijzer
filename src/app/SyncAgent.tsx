import { useEffect } from 'react'
import { useSession } from '../data/auth'
import { resolveOwnership, startAutoSync } from '../data/sync/controller'
import { router } from './router'

const CLAIM = '/account/koppelen'

/**
 * Runs automatic cloud sync while someone is signed in (renders nothing). If the data on this
 * device is not tied to the account yet (e.g. the app was closed on the choice screen), the
 * user is sent back to that choice instead of silently never syncing.
 */
export function SyncAgent() {
  const session = useSession()
  const userId = session?.user.id
  useEffect(() => {
    if (!userId) return undefined
    void resolveOwnership(userId).then((outcome) => {
      if (outcome !== 'ok' && router.state.location.pathname !== CLAIM)
        void router.navigate(outcome === 'switch' ? `${CLAIM}?wissel=1` : CLAIM)
    })
    return startAutoSync()
  }, [userId])
  return null
}
