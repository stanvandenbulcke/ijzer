import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { formatNumber } from '../../i18n/format'

/**
 * A number that counts up to its value (stats, totals). The final value is in the DOM from the
 * start, so screen readers and tests never see an in-between number.
 */
export function CountUp({
  value,
  decimals = 0,
  duration = 0.9,
}: {
  value: number
  decimals?: number
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const controls = animate(0, value, {
      duration,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => {
        el.textContent = formatNumber(v, decimals)
      },
      onComplete: () => {
        el.textContent = formatNumber(value, decimals)
      },
    })
    return () => controls.stop()
  }, [value, decimals, duration, reduced])
  return (
    <span ref={ref} aria-label={formatNumber(value, decimals)}>
      {formatNumber(value, decimals)}
    </span>
  )
}
