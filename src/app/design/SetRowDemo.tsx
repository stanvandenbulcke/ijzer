import { Check } from 'lucide-react'
import { useState } from 'react'
import { t } from '../../i18n'
import { Badge } from '../../ui/Badge'
import { cx } from '../../ui/cx'

const s = t.design.setRow

interface DemoSet {
  label: string
  warmup?: boolean
  pr?: boolean
  previous: string
  kg: string
  reps: string
  done: boolean
}

const initial: DemoSet[] = [
  { label: s.warmup, warmup: true, previous: '40 × 10', kg: '40', reps: '10', done: true },
  { label: '1', pr: true, previous: '80 × 8 @2', kg: '82,5', reps: '8', done: true },
  { label: '2', previous: '80 × 8 @1', kg: '82,5', reps: '8', done: false },
  { label: '3', previous: '80 × 7 @0', kg: '82,5', reps: '7', done: false },
]

const grid = 'grid grid-cols-[2.5rem_1fr_4.75rem_3.5rem_2.75rem] items-center gap-2'

/**
 * Preview of the heart of the app (phase 3): one tap on ✓ logs a set with the shown values.
 * Not-yet-done sets show their values dimmed: they are a proposal, not a performance.
 */
export function SetRowDemo() {
  const [sets, setSets] = useState(initial)
  const toggle = (i: number) =>
    setSets((all) => all.map((set, j) => (j === i ? { ...set, done: !set.done } : set)))

  return (
    <div>
      <div className={cx(grid, 'pb-1 text-xs font-semibold tracking-widest text-muted uppercase')}>
        <span>{s.columns.set}</span>
        <span>{s.columns.previous}</span>
        <span className="text-center">{s.columns.kg}</span>
        <span className="text-center">{s.columns.reps}</span>
        <span />
      </div>
      {sets.map((set, i) => (
        <div key={set.label} className={cx(grid, 'border-t border-line py-1.5')}>
          <span className="flex justify-center">
            {set.pr && set.done ? (
              <Badge tone="pr">{t.design.badges.pr}</Badge>
            ) : set.warmup ? (
              <Badge tone="muted">{set.label}</Badge>
            ) : (
              <span className="font-display text-xl font-bold">{set.label}</span>
            )}
          </span>
          <span className="truncate text-sm text-muted">{set.previous}</span>
          {[set.kg, set.reps].map((value, k) => (
            <span
              key={k}
              className={cx(
                'flex h-11 items-center justify-center rounded-sm bg-surface-2 font-display text-2xl font-bold',
                !set.done && 'text-muted',
              )}
            >
              {value}
            </span>
          ))}
          <button
            type="button"
            onClick={() => toggle(i)}
            aria-pressed={set.done}
            aria-label={(set.done ? s.checked : s.check)(set.warmup ? s.warmupName : set.label)}
            className={cx(
              'press flex size-11 items-center justify-center rounded-sm border',
              set.done
                ? 'border-plate-green bg-plate-green text-on-accent'
                : 'border-line-strong text-muted',
            )}
          >
            <Check aria-hidden size={24} strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  )
}
