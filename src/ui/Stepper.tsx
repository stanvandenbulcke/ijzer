import { formatNumber } from '../i18n/format'
import { t } from '../i18n'
import { cx } from './cx'

export interface StepperProps {
  label: string
  value: number
  onChange: (value: number) => void
  /** Step sizes, smallest first, e.g. [1, 10] renders −10 −1 value +1 +10. */
  steps?: number[]
  unit?: string
  min?: number
  max?: number
  maxDecimals?: number
}

/** Big value with − and + buttons on both sides. */
export function Stepper({
  label,
  value,
  onChange,
  steps = [1],
  unit,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  maxDecimals = 1,
}: StepperProps) {
  const factor = 10 ** maxDecimals
  const apply = (delta: number) =>
    onChange(Math.min(max, Math.max(min, Math.round((value + delta) * factor) / factor)))

  const stepButton = (delta: number) => {
    const shown = formatNumber(Math.abs(delta), maxDecimals)
    const disabled = delta < 0 ? value <= min : value >= max
    return (
      <button
        key={delta}
        type="button"
        disabled={disabled}
        onClick={() => apply(delta)}
        aria-label={delta < 0 ? t.stepper.decrease(shown) : t.stepper.increase(shown)}
        className={cx(
          'press flex size-11 items-center justify-center rounded-md border border-line bg-surface-2',
          'font-display text-lg font-bold disabled:opacity-40',
        )}
      >
        {delta < 0 ? '−' : '+'}
        {shown}
      </button>
    )
  }

  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      {[...steps].reverse().map((s) => stepButton(-s))}
      <output
        aria-live="polite"
        className="flex min-w-0 flex-1 items-baseline justify-center gap-1 font-display text-4xl font-black"
      >
        {formatNumber(value, maxDecimals)}
        {unit && <span className="font-sans text-base font-semibold text-muted">{unit}</span>}
      </output>
      {steps.map((s) => stepButton(s))}
    </div>
  )
}
