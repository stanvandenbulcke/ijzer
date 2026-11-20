import { CloudCheck, CloudOff, Download, LogOut, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSession } from '../../data/auth'
import { exportAll } from '../../data/exportData'
import { accountsEnabled } from '../../data/supabase/config'
import { signOut, syncNow } from '../../data/sync/controller'
import { useSyncStatus } from '../../data/sync/status'
import { t } from '../../i18n'
import { formatClock } from '../../i18n/format'
import { Button } from '../../ui/Button'
import { Sheet } from '../../ui/Sheet'
import { cx } from '../../ui/cx'
import { downloadBlob } from '../../ui/download'

const a = t.auth.account

/** Account and cloud status under Ik (SPEC §7.2: a clear sync status). */
export function AccountSection() {
  const navigate = useNavigate()
  const session = useSession()
  const status = useSyncStatus()
  const [pending, setPending] = useState(0)
  const [busy, setBusy] = useState(false)
  if (!accountsEnabled) return <p className="text-muted">{t.me.accountLocal}</p>
  if (!session) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-muted">{t.auth.banner.body}</p>
        <Button block onClick={() => navigate('/registreren')}>
          {a.create}
        </Button>
        <Button variant="secondary" block onClick={() => navigate('/login')}>
          {a.logIn}
        </Button>
      </div>
    )
  }
  const leave = async (force: boolean) => {
    setBusy(true)
    const left = await signOut(force)
    setBusy(false)
    setPending(left)
    if (left === 0) navigate('/', { replace: true })
  }
  const ok = status.state === 'idle' || status.state === 'syncing'
  const Icon = ok ? CloudCheck : CloudOff
  return (
    <div className="flex flex-col gap-3">
      <p className="selectable">{a.signedInAs(session.user.email ?? '')}</p>
      <button
        type="button"
        onClick={() => void syncNow()}
        className="press flex min-h-14 items-center gap-3 rounded-md border border-line-strong bg-surface px-3 text-left"
      >
        <Icon aria-hidden size={24} className={cx(ok ? 'text-green-text' : 'text-red-text')} />
        <span className="flex flex-1 flex-col">
          <span className="font-semibold">{a.status[status.state]}</span>
          {status.lastSyncedAt && (
            <span className="text-sm text-muted">
              {a.lastSynced(formatClock(status.lastSyncedAt))}
            </span>
          )}
        </span>
        <RefreshCw
          aria-label={a.syncNow}
          size={20}
          className={cx(status.state === 'syncing' && 'animate-spin')}
        />
      </button>
      <Button
        variant="secondary"
        icon={LogOut}
        block
        disabled={busy}
        onClick={() => void leave(false)}
      >
        {a.signOut}
      </Button>
      <p className="text-sm text-muted">{a.signOutNote}</p>
      <Sheet open={pending > 0} onOpenChange={() => setPending(0)} title={a.pendingTitle}>
        <div className="flex flex-col gap-3">
          <p>{a.pendingBody(pending)}</p>
          <Button block disabled={busy} onClick={() => void leave(false)}>
            {a.retry}
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            block
            onClick={async () =>
              downloadBlob(
                await exportAll(),
                `iron-kopie-${new Date().toISOString().slice(0, 10)}.json`,
              )
            }
          >
            {a.exportFirst}
          </Button>
          <Button variant="danger" block disabled={busy} onClick={() => void leave(true)}>
            {a.forceSignOut}
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
