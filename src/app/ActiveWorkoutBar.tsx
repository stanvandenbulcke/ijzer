import { Dumbbell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Workout } from '../domain/training/types'
import { t } from '../i18n'
import { formatMinutes } from '../i18n/format'

/** Shown above the tab bar while a workout is running, so you can always get back to it. */
export function ActiveWorkoutBar({ workout }: { workout: Workout }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const minutes = (now - Date.parse(workout.startedAt)) / 60_000

  return (
    <Link
      to="/training"
      className="press fixed inset-x-0 z-30 mx-auto flex max-w-md items-center gap-3 border-t border-line bg-plate-yellow px-4 py-2.5 text-on-accent"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 3.5rem)' }}
    >
      <Dumbbell aria-hidden size={22} strokeWidth={2} />
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate font-semibold">{workout.name}</span>
        <span className="text-sm">
          {t.app.workoutRunning} · {formatMinutes(minutes)}
        </span>
      </span>
      <span className="font-display text-xl font-bold uppercase">{t.app.continue}</span>
    </Link>
  )
}
