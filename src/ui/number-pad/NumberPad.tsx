import { Delete } from 'lucide-react'
import { useReducer, type ReactNode } from 'react'
import { t } from '../../i18n'
import { formatNumber } from '../../i18n/format'
import { cx } from '../cx'
import {
  initialInput,
  parseInput,
  reduceInput,
  type NumberInputAction,
  type NumberInputOptions,
} from './numberInput'

export interface QuickValue {
  label: string
  value: number
}

export interface NumberPadProps {
  /** What is being edited, e.g. "Gewicht". */
  label: string
  value: number | null
  onChange: (value: number | null) => void
  onDone: () => void
  unit?: string
  /** Size of the −/+ keys (e.g. 2,5 kg from the equipment settings). */
  step: number
  /** 0 for whole numbers such as reps. */
  maxDecimals?: number
  maxIntegerDigits?: number
  /** Shortcuts like "Zelfde als vorige set". */
  quickValues?: QuickValue[]
}

/**
 * Our own large keypad (SPEC §4.4): no iOS keyboard, thumb-sized keys, step keys and
 * shortcuts. The display shows the value highlighted when the next digit replaces it.
 */
export function NumberPad({
  label,
  value,
  onChange,
  onDone,
  unit,
  step,
  maxDecimals = 2,
  maxIntegerDigits = 4,
  quickValues = [],
}: NumberPadProps) {
  const options: NumberInputOptions = { maxDecimals, maxIntegerDigits }
  const [state, dispatch] = useReducer(
    (s: ReturnType<typeof initialInput>, a: NumberInputAction) => reduceInput(s, a, options),
    initialInput(value, maxDecimals),
  )

  const send = (action: NumberInputAction) => {
    const next = reduceInput(state, action, options)
    dispatch(action)
    onChange(parseInput(next.text))
  }

  const stepLabel = formatNumber(step, maxDecimals)
  const key = 'press flex h-14 items-center justify-center bg-surface-2 active:bg-line'

  const digit = (d: string) => (
    <button
      key={d}
      type="button"
      onClick={() => send({ type: 'digit', digit: d })}
      className={cx(key, 'font-display text-3xl font-bold')}
    >
      {d}
    </button>
  )

  const stepKey = (delta: number, aria: string): ReactNode => (
    <button
      type="button"
      onClick={() => send({ type: 'step', delta })}
      aria-label={aria}
      className={cx(key, 'font-display text-xl font-bold text-accent-text')}
    >
      {delta < 0 ? '−' : '+'}
      {stepLabel}
    </button>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold text-muted">{label}</span>
        <output
          aria-live="polite"
          aria-label={label}
          className="flex h-20 items-baseline gap-2 font-display text-7xl leading-none font-black"
        >
          <span
            className={cx(
              'min-w-8 border-b-4 px-1',
              state.fresh ? 'border-focus' : 'border-transparent',
            )}
          >
            {state.text || '–'}
          </span>
          {unit && <span className="font-sans text-xl font-semibold text-muted">{unit}</span>}
        </output>
      </div>

      {quickValues.length > 0 && (
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {quickValues.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => send({ type: 'set', value: q.value })}
              className="press flex min-h-11 shrink-0 flex-col items-start justify-center rounded-md border border-line px-3 py-1 text-left"
            >
              <span className="text-xs text-muted">{q.label}</span>
              <span className="font-display text-lg leading-tight font-bold">
                {formatNumber(q.value, maxDecimals)} {unit}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-md border border-line bg-line">
        {digit('1')}
        {digit('2')}
        {digit('3')}
        <button
          type="button"
          onClick={() => send({ type: 'backspace' })}
          aria-label={t.numberPad.backspace}
          className={key}
        >
          <Delete aria-hidden size={26} strokeWidth={1.75} />
        </button>
        {digit('4')}
        {digit('5')}
        {digit('6')}
        {stepKey(-step, t.numberPad.decrease(stepLabel))}
        {digit('7')}
        {digit('8')}
        {digit('9')}
        {stepKey(step, t.numberPad.increase(stepLabel))}
        <button
          type="button"
          onClick={() => send({ type: 'comma' })}
          disabled={maxDecimals === 0}
          aria-label={t.numberPad.comma}
          className={cx(key, 'font-display text-3xl font-bold disabled:text-line')}
        >
          ,
        </button>
        {digit('0')}
        <button
          type="button"
          onClick={onDone}
          className="press col-span-2 flex h-14 items-center justify-center bg-plate-yellow font-display text-2xl font-bold tracking-wide text-on-accent uppercase"
        >
          {t.common.done}
        </button>
      </div>
    </div>
  )
}
