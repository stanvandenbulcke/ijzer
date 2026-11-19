import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useSession } from '../data/auth'
import { useProfile } from '../data/profileRepo'
import { accountsEnabled } from '../data/supabase/config'
import { LoadingState } from '../ui/LoadingState'

/** App screens need a finished onboarding; otherwise go to /welkom first. */
export function RequireProfile({ children }: { children?: ReactNode }) {
  const profile = useProfile()
  const session = useSession()
  if (profile === undefined || session === undefined) return <LoadingState />
  if (!profile.onboardedAt) {
    // New visitors choose between an account and trying without one on the landing page.
    return <Navigate to={accountsEnabled && !session ? '/' : '/welkom'} replace />
  }
  return children ?? <Outlet />
}

/** "/": the landing page for new visitors, straight to Vandaag for known ones (SPEC §4.1). */
export function RootGate({ children }: { children: ReactNode }) {
  const profile = useProfile()
  if (profile === undefined) return null
  if (profile.onboardedAt) return <Navigate to="/vandaag" replace />
  return children
}
