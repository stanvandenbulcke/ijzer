import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, Copy, Link2, Link2Off, Trash2 } from 'lucide-react'
import {
  applyTargets,
  cycleSetType,
  setCounts,
  warmupSets,
  workingSets,
} from '../../../domain/training/routineEdit'
import type { Exercise, ProgressionModel, RoutineExercise } from '../../../domain/training/types'
import { t } from '../../../i18n'
import { formatDuration } from '../../../i18n/format'
import { IconButton } from '../../../ui/Button'
import { Chip } from '../../../ui/Chip'
import { cx } from '../../../ui/cx'
import { ExerciseThumb } from '../../../ui/ExerciseThumb'
import { Stepper } from '../../../ui/Stepper'
import { MiniNumber } from './MiniNumber'

const e = t.training.editor
const RESTS = [60, 90, 120, 150, 180, 240]
const MODELS: ProgressionModel[] = ['double', 'fixed', 'rir']

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-widest text-muted uppercase">{label}</span>
      {children}
    </div>
  )
}

/** One exercise in the routine builder. */
export function RoutineExerciseEditor({
  item,
  exercise,
  index,
  count,
  linkedToNext,
  onChange,
  onMove,
  onDuplicate,
  onToggleSuperset,
  onRemove,
}: {
  item: RoutineExercise
  exercise: Exercise | undefined
  index: number
  count: number
  linkedToNext: boolean
  onChange: (item: RoutineExercise) => void
  onMove: (delta: -1 | 1) => void
  onDuplicate: () => void
  onToggleSuperset: () => void
  onRemove: () => void
}) {
  const work = workingSets(item)
  const first = work[0]
  const name = exercise?.name ?? item.exerciseId

  return (
    <article
      className={cx(
        'rounded-md border bg-surface p-3',
        item.supersetGroup ? 'border-plate-blue' : 'border-line',
      )}
    >
      <header className="flex items-center gap-3">
        {exercise && <ExerciseThumb exercise={exercise} size="sm" />}
        <h3 className="min-w-0 flex-1 truncate font-semibold">{name}</h3>
      </header>
      <div className="mt-1 -ml-2 flex">
        <IconButton
          icon={ChevronUp}
          label={e.moveUp}
          disabled={index === 0}
          onClick={() => onMove(-1)}
        />
        <IconButton
          icon={ChevronDown}
          label={e.moveDown}
          disabled={index === count - 1}
          onClick={() => onMove(1)}
        />
        <IconButton icon={Copy} label={e.duplicate} onClick={onDuplicate} />
        {index < count - 1 && (
          <IconButton
            icon={linkedToNext ? Link2Off : Link2}
            label={linkedToNext ? e.unsuperset : e.superset}
            onClick={onToggleSuperset}
          />
        )}
        <span className="flex-1" />
        <IconButton icon={Trash2} label={e.remove} onClick={onRemove} />
      </div>

      <div className="mt-2 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Row label={t.training.setTypes.warmup}>
            <Stepper
              label={t.training.setTypes.warmup}
              value={warmupSets(item).length}
              min={0}
              max={4}
              maxDecimals={0}
              onChange={(n) => onChange(setCounts(item, n, work.length))}
            />
          </Row>
          <Row label={e.sets}>
            <Stepper
              label={e.sets}
              value={work.length}
              min={1}
              max={10}
              maxDecimals={0}
              onChange={(n) => onChange(setCounts(item, warmupSets(item).length, n))}
            />
          </Row>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <Row label={e.reps}>
            <div className="flex items-center gap-1.5">
              <MiniNumber
                label={`${e.reps} min`}
                value={first?.repMin ?? null}
                onChange={(repMin) => onChange(applyTargets(item, { repMin }))}
              />
              <span className="text-muted">–</span>
              <MiniNumber
                label={`${e.reps} max`}
                value={first?.repMax ?? null}
                onChange={(repMax) => onChange(applyTargets(item, { repMax }))}
              />
            </div>
          </Row>
          <Row label={e.rir}>
            <MiniNumber
              label={e.rir}
              value={first?.rir ?? null}
              onChange={(rir) => onChange(applyTargets(item, { rir }))}
            />
          </Row>
        </div>
        <Row label={e.setType}>
          <div className="flex flex-wrap gap-1.5">
            {item.sets.map((s, i) =>
              s.type === 'warmup' ? null : (
                <Chip
                  key={i}
                  selected={s.type !== 'working'}
                  onClick={() => onChange(cycleSetType(item, i))}
                  className="min-w-11 justify-center"
                >
                  {s.type === 'working'
                    ? i + 1 - warmupSets(item).length
                    : t.training.setTypeShort[s.type]}
                </Chip>
              ),
            )}
          </div>
          <p className="text-sm text-muted">{e.setTypeHint}</p>
        </Row>
        <Row label={e.rest}>
          <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none]">
            {RESTS.map((sec) => (
              <Chip
                key={sec}
                selected={item.restSec === sec}
                onClick={() => onChange({ ...item, restSec: sec })}
                className="shrink-0"
              >
                {formatDuration(sec)}
              </Chip>
            ))}
          </div>
        </Row>
        <Row label={e.progression}>
          <div className="flex flex-wrap gap-1.5">
            {MODELS.map((m) => (
              <Chip
                key={m}
                selected={item.progression === m}
                onClick={() => onChange({ ...item, progression: m })}
              >
                {e.progressionModels[m]}
              </Chip>
            ))}
          </div>
          <p className="text-sm text-muted">{e.progressionHints[item.progression]}</p>
        </Row>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-widest text-muted uppercase">
            {e.note}
          </span>
          <input
            value={item.note}
            placeholder={e.notePlaceholder}
            onChange={(ev) => onChange({ ...item, note: ev.target.value })}
            className="min-h-11 rounded-sm border border-line-strong bg-surface px-3 outline-none placeholder:text-muted focus:border-focus"
          />
        </label>
      </div>
    </article>
  )
}
