import { useNavigate } from 'react-router'
import { loadProfile } from '../../data/profileRepo'
import { afterSignIn } from '../../data/sync/controller'

/** After a successful sign-in: decide about local data, sync, then go to the right screen. */
export function useFinishSignIn() {
  const navigate = useNavigate()
  return async (userId: string) => {
    const outcome = await afterSignIn(userId)
    if (outcome === 'choose') return navigate('/account/koppelen', { replace: true })
    if (outcome === 'switch') return navigate('/account/koppelen?wissel=1', { replace: true })
    const profile = await loadProfile()
    navigate(profile.onboardedAt ? '/vandaag' : '/welkom', { replace: true })
  }
}
