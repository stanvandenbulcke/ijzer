import type { ButtonHTMLAttributes } from 'react'
import { MUSCLE_REGION, type MuscleId } from '../domain/muscles/taxonomy'
import { t } from '../i18n'
import { cx } from './cx'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

/** Toggle chip for filters and quick choices. 44 px tall so it is easy to hit. */
export function Chip({ selected = false, className, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(
        'press inline-flex min-h-11 items-center gap-2 rounded-md border px-3.5 text-[15px] font-semibold',
        selected ? 'border-focus bg-surface-2 text-text' : 'border-line text-muted',
        className,
      )}
      {...rest}
    />
  )
}

const regionBar = {
  push: 'bg-region-push',
  pull: 'bg-region-pull',
  legs: 'bg-region-legs',
  core: 'bg-region-core',
  neck: 'bg-region-neck',
} as const

/** Static label for a muscle, with the colour bar of its body region. */
export function MuscleChip({ muscle, secondary }: { muscle: MuscleId; secondary?: boolean }) {
  return (
    <span
      className={cx(
        'inline-flex h-7 items-center gap-1.5 rounded-sm border border-line pr-2 text-sm',
        secondary ? 'text-muted' : 'text-text',
      )}
    >
      <span
        aria-hidden
        className={cx(
          'h-full w-1 rounded-l-sm',
          regionBar[MUSCLE_REGION[muscle]],
          secondary && 'opacity-50',
        )}
      />
      {t.muscles[muscle]}
    </span>
  )
}
