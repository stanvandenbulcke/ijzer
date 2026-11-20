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
      // Screen readers hear the value too, and whether it is only a proposal.
      aria-label={`${label}: ${value}${ghost ? ` (${w.proposal})` : ''}`}
      className={cx(
        'press flex h-12 items-center justify-center gap-0.5 rounded-sm bg-surface-2 font-display text-2xl font-bold',
        ghost && 'text-muted',
      )}
    >
      {value}
      {suffix && <span className="text-sm text-muted">{suffix}</span>}
    </button>
  )
}

/**
 * One set: label · last time · value cells · tick. Proposals are dimmed; typed values are in
 * full colour, and the tick is highlighted until the set is ticked.
 */
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
  // Typed in but not ticked yet: values in full colour, the tick invites a tap.
  const typed = !set.completed && (set.reps !== null || set.seconds !== null || set.meters !== null)
  const isPr = set.completed && prKinds.length > 0
  const name = set.type === 'warmup' ? `${t.training.setTypes.warmup} ${label}` : label

  return (
    <div className={cx(single ? SINGLE_GRID : SET_GRID, 'border-t border-line py-2')}>
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
          ghost={(type === 'time' ? set.seconds : set.meters) === null}
          onClick={() => onEdit(type === 'time' ? 'seconds' : 'meters')}
        />
      ) : (
        <>
          <Cell
            label={`${w.columns.kg} ${name}`}
            value={weight === null ? '–' : formatNumber(weight, 2)}
            ghost={set.weightKg === null}
            onClick={() => onEdit('weight')}
          />
          <Cell
            label={`${w.columns.reps} ${name}`}
            value={reps === null ? '–' : String(reps)}
            suffix={set.rir !== null ? `@${set.rir}` : undefined}
            ghost={set.reps === null}
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
          'press flex h-12 w-14 items-center justify-center rounded-sm border',
          set.completed
            ? 'set-stamp border-plate-green bg-plate-green text-on-accent'
            : typed
              ? 'border-2 border-accent-edge text-accent-text'
              : 'border-line-strong text-muted',
        )}
      >
        <Check aria-hidden size={28} strokeWidth={2.75} />
      </button>
    </div>
  )
}
