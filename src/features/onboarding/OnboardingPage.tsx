import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useEffect, useState, type ComponentType } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { logBodyWeight } from '../../data/bodyRepo'
import { requestPersistentStorage } from '../../data/db'
import { loadProfile, saveProfile } from '../../data/profileRepo'
import type { Profile } from '../../domain/profile/types'
import { localDay } from '../../domain/time'
import { t } from '../../i18n'
import { Button } from '../../ui/Button'
import { cx } from '../../ui/cx'
import { LoadingState } from '../../ui/LoadingState'
import { AboutStep } from './steps/AboutStep'
import { ActivityStep } from './steps/ActivityStep'
import { GoalStep } from './steps/GoalStep'
import { InstallStep } from './steps/InstallStep'
import { ScheduleStep } from './steps/ScheduleStep'

type StepProps = { draft: Profile; update: (p: Partial<Profile>) => void }

const o = t.onboarding
const STEPS: Array<{ title: string; body?: string; Component: ComponentType<StepProps> }> = [
  { title: o.about.title, body: o.about.body, Component: AboutStep },
  { title: o.goal.title, body: o.goal.body, Component: GoalStep },
  { title: o.activity.title, Component: ActivityStep },
  { title: o.schedule.title, body: o.schedule.body, Component: ScheduleStep },
  { title: o.install.title, body: o.install.body, Component: InstallStep },
]

/** /welkom — one question group per screen, skippable, everything changeable later. */
export function OnboardingPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('terug') === '/ik' ? '/ik' : '/vandaag'
  const [draft, setDraft] = useState<Profile | null>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    loadProfile().then(setDraft)
  }, [])

  if (!draft) return <LoadingState />

  const update = (changes: Partial<Profile>) => setDraft((d) => (d ? { ...d, ...changes } : d))
  const last = step === STEPS.length - 1
  const { title, body, Component } = STEPS[step]!

  const finish = async () => {
    const now = new Date().toISOString()
    await saveProfile({ ...draft, onboardedAt: draft.onboardedAt ?? now })
    if (draft.weightKg) await logBodyWeight(localDay(now), draft.weightKg)
    void requestPersistentStorage()
    navigate(returnTo, { replace: true })
  }
  const next = () => (last ? void finish() : setStep((s) => s + 1))

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex gap-1" aria-hidden>
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={cx('h-1 flex-1 rounded-full', i <= step ? 'bg-focus' : 'bg-line')}
          />
        ))}
      </div>
      <p className="mt-3 text-xs font-semibold tracking-widest text-muted uppercase">
        {o.progress(step + 1, STEPS.length)}
      </p>
      <h1 className="mt-1 font-display text-5xl leading-none font-black uppercase">{title}</h1>
      {body && <p className="mt-3 text-muted">{body}</p>}

      <div className="mt-7 flex-1">
        <Component draft={draft} update={update} />
      </div>

      <p className="mt-8 text-center text-sm text-muted">{o.laterNote}</p>
      <div className="mt-3 flex gap-3">
        {step > 0 && (
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => setStep((s) => s - 1)}
            aria-label={o.back}
          />
        )}
        {!last && (
          <Button variant="ghost" onClick={next} className="flex-1">
            {o.skip}
          </Button>
        )}
        <Button icon={last ? Check : ArrowRight} onClick={next} className="flex-[2]">
          {last ? o.finish : o.next}
        </Button>
      </div>
    </main>
  )
}
