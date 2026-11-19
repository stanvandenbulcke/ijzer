import { useEffect } from 'react'
import { useSession } from '../data/auth'
import { startAutoSync } from '../data/sync/controller'

/** Runs automatic cloud sync while someone is signed in (renders nothing). */
export function SyncAgent() {
  const session = useSession()
  const userId = session?.user.id
  useEffect(() => (userId ? startAutoSync() : undefined), [userId])
  return null
}
