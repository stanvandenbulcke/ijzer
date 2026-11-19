import { Play } from 'lucide-react'
import type { Routine } from '../../../domain/training/types'
import { totalWorkingSets } from '../../../domain/training/routineEdit'
import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'
import { cx } from '../../../ui/cx'
import { routineColor } from './routineColors'

/** A routine in the list: plate-coloured edge, name, size, last done, Start. */
export function RoutineCard({
  routine,
  lastDone,
  onOpen,
  onStart,
  startLabel = t.training.startRoutine,
}: {
  routine: Routine
  lastDone: string | null
  onOpen: () => void
  onStart: () => void
  startLabel?: string
}) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-md border border-line bg-surface">
      <span aria-hidden className={cx('w-1.5 shrink-0', routineColor[routine.color])} />
      <button
        type="button"
        onClick={onOpen}
        className="press flex min-w-0 flex-1 flex-col items-start px-3 py-3 text-left"
      >
        <span className="w-full truncate font-display text-2xl leading-tight font-bold uppercase">
          {routine.name}
        </span>
        <span className="text-sm text-muted">
          {t.training.exercisesCount(routine.exercises.length)} ·{' '}
          {t.training.setsCount(totalWorkingSets(routine))}
        </span>
        <span className="text-sm text-muted">
          {lastDone ? t.training.lastDone(lastDone) : t.training.neverDone}
        </span>
      </button>
      <div className="flex items-center pr-3">
        <Button icon={Play} variant="primary" onClick={onStart} className="px-4">
          {startLabel}
        </Button>
      </div>
    </div>
  )
}
