import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useSession } from '../../data/auth'
import { loadProfile } from '../../data/profileRepo'
import { discardLocalData, keepLocalData } from '../../data/sync/controller'
import { t } from '../../i18n'
import { Button } from '../../ui/Button'
import { LoadingState } from '../../ui/LoadingState'
import { Page, PageHeader } from '../../ui/PageHeader'

const c = t.auth.claim

/** /account/koppelen — what to do with data that was logged before having an account. */
export function ClaimDataPage() {
  const navigate = useNavigate()
  const session = useSession()
  const [busy, setBusy] = useState(false)
  if (session === undefined) return <LoadingState />
  if (!session) return <Navigate to="/login" replace />
  const userId = session.user.id

  const choose = async (keep: boolean) => {
    setBusy(true)
    await (keep ? keepLocalData(userId) : discardLocalData(userId))
    const profile = await loadProfile()
    navigate(profile.onboardedAt ? '/vandaag' : '/welkom', { replace: true })
  }

  return (
    <Page tabBar={false}>
      <PageHeader title={c.title} />
      <p className="text-muted">{c.body}</p>
      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" block disabled={busy} onClick={() => void choose(true)}>
          {c.keep}
        </Button>
        <Button variant="secondary" block disabled={busy} onClick={() => void choose(false)}>
          {c.discard}
        </Button>
        <p className="text-sm text-muted">{c.discardNote}</p>
      </div>
    </Page>
  )
}
