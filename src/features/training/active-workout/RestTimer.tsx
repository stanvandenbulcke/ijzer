import { SkipForward } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { restRemaining } from '../../../domain/training/workoutOps'
import type { Workout } from '../../../domain/training/types'
import { t } from '../../../i18n'
import { formatDuration } from '../../../i18n/format'
import { IconButton } from '../../../ui/Button'
import { cx } from '../../../ui/cx'
import { ProgressRing } from '../../../ui/ProgressRing'
import { useNow } from '../../../ui/useNow'
import { playRestDone } from './restSound'

const w = t.training.workout

/**
 * Rest countdown at the top (SPEC §4.4). Based on timestamps, so it is right after the
 * screen was off. At zero: a short sound and a flash, then it disappears.
 */
export function RestTimer({
  workout,
  sound,
  onAdjust,
  onClear,
}: {
  workout: Workout
  sound: boolean
  onAdjust: (deltaSec: number) => void
  onClear: () => void
}) {
  const now = useNow(250)
  const remaining = restRemaining(workout, now)
  const signalled = useRef<string | null>(null)

  useEffect(() => {
    const rest = workout.rest
    if (!rest || remaining !== 0 || signalled.current === rest.startedAt) return
    signalled.current = rest.startedAt
    if (sound && document.visibilityState === 'visible') playRestDone()
    const timer = window.setTimeout(onClear, 4000)
    return () => window.clearTimeout(timer)
  }, [remaining, workout.rest, sound, onClear])

  if (!workout.rest || remaining === null) return null
  const done = remaining === 0

  return (
    <div
      role="timer"
      aria-label={done ? w.restDone : w.restLabel(formatDuration(remaining))}
      className={cx(
        'flex items-center gap-3 border-t border-line-strong px-4 py-2 transition-colors duration-200',
        done ? 'rest-flash bg-plate-green text-on-accent' : 'bg-surface',
      )}
    >
      <ProgressRing
        value={remaining}
        max={workout.rest.durationSec}
        label=""
        size={52}
        thickness={5}
        tone={done ? 'green' : 'blue'}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-semibold tracking-widest uppercase opacity-80">
          {w.restTitle}
        </span>
        <span className="font-display text-4xl leading-none font-black">
          {done ? w.restDone : formatDuration(remaining)}
        </span>
      </div>
      {!done && (
        <>
          <button
            type="button"
            onClick={() => onAdjust(-15)}
            className="press h-12 rounded-md border border-line-strong px-2.5 font-display text-lg font-bold"
          >
            {w.restMinus}
          </button>
          <button
            type="button"
            onClick={() => onAdjust(15)}
            className="press h-12 rounded-md border border-line-strong px-2.5 font-display text-lg font-bold"
          >
            {w.restPlus}
          </button>
          <IconButton icon={SkipForward} label={w.restSkip} onClick={onClear} />
        </>
      )}
    </div>
  )
}
