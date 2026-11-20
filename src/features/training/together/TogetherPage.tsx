import { Link2, UserMinus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSession } from '../../../data/auth'
import {
  acceptInvite,
  createInvite,
  removeBuddy,
  useBuddies,
  type Buddy,
} from '../../../data/live/buddies'
import { useBuddyLive } from '../../../data/live/liveStore'
import { saveProfile, useProfile } from '../../../data/profileRepo'
import { hasFeature } from '../../../data/supabase/config'
import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'
import { Chip } from '../../../ui/Chip'
import { LoadingState } from '../../../ui/LoadingState'
import { Page, PageHeader } from '../../../ui/PageHeader'
import { Sheet } from '../../../ui/Sheet'
import { TextField } from '../../../ui/TextField'
import { Quiet } from '../../../ui/Quiet'
import { LiveCard } from './LiveCard'

const g = t.together

/** /train/samen — link with a buddy and follow each other's workouts live. */
export function TogetherPage() {
  const navigate = useNavigate()
  const session = useSession()
  const { buddies, refresh } = useBuddies()
  const live = useBuddyLive()
  const profile = useProfile()
  const share = profile?.settings.liveShare ?? false
  const [code, setCode] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState<Buddy | null>(null)

  if (session === undefined) return <LoadingState />
  if (!hasFeature('together') || !session) {
    return (
      <Page>
        <PageHeader title={g.title} back="/train" />
        <p className="text-muted">{g.intro}</p>
        <p className="mt-4">{g.needsAccount}</p>
        <Button className="mt-3" onClick={() => navigate('/registreren')}>
          {g.makeAccount}
        </Button>
      </Page>
    )
  }

  const accept = async () => {
    setBusy(true)
    const result = await acceptInvite(typed)
    setBusy(false)
    if (result.status === 'ok') {
      setTyped('')
      setMessage(g.linked(result.name))
      refresh()
    } else setMessage(g.errors[result.status])
  }

  return (
    <Page>
      <PageHeader title={g.title} back="/train" />
      <p className="text-muted">{g.intro}</p>

      <section className="mt-6 flex flex-col gap-3">
        <h2 className="border-b border-line pb-1.5 font-display text-2xl font-bold uppercase">
          {g.buddies}
        </h2>
        {buddies === undefined ? (
          <LoadingState />
        ) : buddies.length === 0 ? (
          <p className="text-muted">{g.none}</p>
        ) : (
          buddies.map((b) => (
            <div key={b.id} className="flex flex-col gap-1">
              <Quiet>
                <LiveCard name={b.name || g.unnamed} live={live[b.id]} />
              </Quiet>
              <Button
                variant="ghost"
                icon={UserMinus}
                className="self-end"
                aria-label={`${g.remove}: ${b.name || g.unnamed}`}
                onClick={() => setRemoving(b)}
              >
                {g.remove}
              </Button>
            </div>
          ))
        )}
        {buddies && buddies.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Chip
              selected={share}
              onClick={() =>
                profile &&
                void saveProfile({ settings: { ...profile.settings, liveShare: !share } })
              }
              className="self-start"
            >
              {g.share}
            </Chip>
            <p className="text-sm text-muted">{g.shareHint}</p>
          </div>
        )}
      </section>

      <section className="mt-8 flex flex-col gap-3">
        <h2 className="border-b border-line pb-1.5 font-display text-2xl font-bold uppercase">
          {g.link}
        </h2>
        {code ? (
          <div className="rounded-md border border-accent-edge bg-surface p-4 text-center">
            <p className="text-xs font-semibold tracking-widest text-muted uppercase">
              {g.codeTitle}
            </p>
            <p className="selectable font-display text-6xl font-black tracking-[0.2em]">{code}</p>
            <p className="mt-1 text-sm text-muted">{g.codeHint}</p>
          </div>
        ) : (
          <Button
            icon={Link2}
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              const made = await createInvite()
              setBusy(false)
              if (made) setCode(made)
              else setMessage(g.errors.error)
            }}
          >
            {g.makeCode}
          </Button>
        )}
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void accept()
          }}
        >
          <p className="font-semibold">{g.haveCode}</p>
          <TextField
            label={g.codeLabel}
            value={typed}
            maxLength={8}
            autoCapitalize="characters"
            autoComplete="off"
            onChange={(e) => setTyped(e.target.value.toUpperCase())}
          />
          <Button type="submit" variant="secondary" disabled={busy || typed.trim().length !== 8}>
            {g.accept}
          </Button>
        </form>
        {message && (
          <p role="status" className="rounded-md border border-line p-3">
            {message}
          </p>
        )}
      </section>

      <Sheet
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={g.remove}
      >
        {removing && (
          <div className="flex flex-col gap-3">
            <p>{g.removeSure(removing.name)}</p>
            <Button
              variant="danger"
              block
              onClick={async () => {
                await removeBuddy(removing.id)
                setRemoving(null)
                refresh()
              }}
            >
              {g.removeYes}
            </Button>
          </div>
        )}
      </Sheet>
    </Page>
  )
}
