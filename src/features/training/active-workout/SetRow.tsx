import { Check } from 'lucide-react'
import type { PRKind } from '../../../domain/training/records'
import type { ExerciseType, WorkoutSet } from '../../../domain/training/types'
import type { Proposal } from '../../../domain/training/proposals'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Badge } from '../../../ui/Badge'
import { cx } from '../../../ui/cx'
import { isSingleValue, SET_GRID, SINGLE_GRID } from './setGrid'

const w = t.training.workout

function Cell({
  value,
  ghost,
  onClick,
  label,
  suffix,
}: {
  value: string
  ghost: boolean
  onClick: () => void
  label: string
  suffix?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cx(
        'press flex h-11 items-center justify-center gap-0.5 rounded-sm bg-surface-2 font-display text-2xl font-bold',
        ghost && 'text-muted',
      )}
    >
      {value}
      {suffix && <span className="text-sm text-muted">{suffix}</span>}
    </button>
  )
}

/** One set: label · last time · value cells · tick. Untouched values show the proposal dimmed. */
export function SetRow({
  set,
  label,
  type,
  previous,
  proposal,
  prKinds,
  onEdit,
  onToggle,
}: {
  set: WorkoutSet
  label: string
  type: ExerciseType
  previous: string | null
  proposal: Proposal
  prKinds: PRKind[]
  onEdit: (field: 'weight' | 'reps' | 'seconds' | 'meters') => void
  onToggle: () => void
}) {
  const single = isSingleValue(type)
  const weight = set.weightKg ?? proposal.weightKg
  const reps = set.reps ?? proposal.reps
  const ghost = !set.completed
  const isPr = set.completed && prKinds.length > 0
  const name = set.type === 'warmup' ? `${t.training.setTypes.warmup} ${label}` : label

  return (
    <div className={cx(single ? SINGLE_GRID : SET_GRID, 'border-t border-line py-1.5')}>
      <span className="flex justify-center">
        {isPr ? (
          <span className="pr-pop">
            <Badge tone="pr">{w.pr}</Badge>
          </span>
        ) : set.type === 'working' ? (
          <span className="font-display text-xl font-bold">{label}</span>
        ) : (
          <Badge tone="muted">{t.training.setTypeShort[set.type]}</Badge>
        )}
      </span>
      <span className="truncate text-sm text-muted">{previous ?? '–'}</span>
      {single ? (
        <Cell
          label={type === 'time' ? w.columns.sec : w.columns.m}
          value={formatNumber((type === 'time' ? set.seconds : set.meters) ?? 0, 0)}
          ghost={ghost}
          onClick={() => onEdit(type === 'time' ? 'seconds' : 'meters')}
        />
      ) : (
        <>
          <Cell
            label={`${w.columns.kg} ${name}`}
            value={weight === null ? '–' : formatNumber(weight, 2)}
            ghost={ghost || set.weightKg === null}
            onClick={() => onEdit('weight')}
          />
          <Cell
            label={`${w.columns.reps} ${name}`}
            value={reps === null ? '–' : String(reps)}
            suffix={set.rir !== null ? `@${set.rir}` : undefined}
            ghost={ghost || set.reps === null}
            onClick={() => onEdit('reps')}
          />
        </>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={set.completed}
        aria-label={set.completed ? w.uncheck(name) : w.check(name)}
        className={cx(
          'press flex size-11 items-center justify-center rounded-sm border',
          set.completed
            ? 'border-plate-green bg-plate-green text-on-accent'
            : 'border-line-strong text-muted',
        )}
      >
        <Check aria-hidden size={24} strokeWidth={2.5} />
      </button>
    </div>
  )
}
