import { useState } from 'react'
import { formatNumber, parseDecimal } from '../../../i18n/format'

/** Small numeric input (≥ 44 px tall) used in the routine builder. */
export function MiniNumber({
  label,
  value,
  onChange,
  placeholder,
  decimals = 0,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  placeholder?: string
  decimals?: number
}) {
  const show = (v: number | null) => (v === null ? '' : formatNumber(v, decimals))
  const [text, setText] = useState(show(value))
  const [shown, setShown] = useState(value)
  if (value !== shown) {
    // The value changed from outside: show it (React's "adjust state on prop change").
    setShown(value)
    setText(show(value))
  }
  return (
    <input
      aria-label={label}
      inputMode={decimals > 0 ? 'decimal' : 'numeric'}
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onChange(parseDecimal(text))}
      onFocus={(e) => e.target.select()}
      className="h-11 w-14 rounded-sm border border-line-strong bg-surface text-center font-display text-xl font-bold text-text outline-none focus:border-focus"
    />
  )
}
