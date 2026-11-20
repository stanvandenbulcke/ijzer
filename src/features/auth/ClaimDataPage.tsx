import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { useSession } from '../../data/auth'
import { exportAll } from '../../data/exportData'
import { loadProfile } from '../../data/profileRepo'
import {
  discardLocalData,
  keepLocalData,
  pendingChanges,
  signOutKeepingData,
  switchAccount,
} from '../../data/sync/controller'
import { t } from '../../i18n'
import { Button } from '../../ui/Button'
import { LoadingState } from '../../ui/LoadingState'
import { Page, PageHeader } from '../../ui/PageHeader'
import { Sheet } from '../../ui/Sheet'
import { downloadBlob } from '../../ui/download'

const c = t.auth.claim
const w = t.auth.switch

/**
 * /account/koppelen — what to do with data on this device that is not tied to this account:
 * data logged without an account, or (?wissel=1) unsynced changes of another account.
 * Nothing is ever removed without an explicit second confirmation.
 */
export function ClaimDataPage() {
  const navigate = useNavigate()
  const session = useSession()
  const [params] = useSearchParams()
  const switching = params.has('wissel')
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(0)
  useEffect(() => {
    if (switching) void pendingChanges().then(setPending)
  }, [switching])
  if (session === undefined) return <LoadingState />
  if (!session) return <Navigate to="/login" replace />
  const userId = session.user.id

  const finish = async (action: () => Promise<void>) => {
    setBusy(true)
    await action()
    const profile = await loadProfile()
    navigate(profile.onboardedAt ? '/vandaag' : '/welkom', { replace: true })
  }
  const download = async () =>
    downloadBlob(await exportAll(), `iron-kopie-${new Date().toISOString().slice(0, 10)}.json`)
  const discard = () => finish(() => (switching ? switchAccount(userId) : discardLocalData(userId)))

  return (
    <Page tabBar={false}>
      <PageHeader title={switching ? w.title : c.title} />
      <p className="text-muted">{switching ? w.body(pending) : c.body}</p>
      <div className="mt-6 flex flex-col gap-3">
        {switching ? (
          <>
            <Button
              size="lg"
              block
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                await signOutKeepingData()
                navigate('/', { replace: true })
              }}
            >
              {w.back}
            </Button>
            <p className="text-sm text-muted">{w.backNote}</p>
            <Button variant="secondary" block disabled={busy} onClick={() => void download()}>
              {w.export}
            </Button>
          </>
        ) : (
          <Button
            size="lg"
            block
            disabled={busy}
            onClick={() => void finish(() => keepLocalData(userId))}
          >
            {c.keep}
          </Button>
        )}
        <Button variant="secondary" block disabled={busy} onClick={() => setConfirming(true)}>
          {switching ? w.discard : c.discard}
        </Button>
        {!switching && <p className="text-sm text-muted">{c.discardNote}</p>}
      </div>
      <Sheet
        open={confirming}
        onOpenChange={setConfirming}
        title={switching ? w.discard : c.discard}
      >
        <div className="flex flex-col gap-3">
          <p>{switching ? w.discardConfirm : c.discardConfirm}</p>
          <Button variant="danger" block disabled={busy} onClick={() => void discard()}>
            {switching ? w.discardYes : c.discardYes}
          </Button>
          <Button variant="secondary" block onClick={() => setConfirming(false)}>
            {c.cancel}
          </Button>
        </div>
      </Sheet>
    </Page>
  )
}
