import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Tone = 'yellow' | 'green' | 'red' | 'blue'

const strokes: Record<Tone, string> = {
  yellow: 'var(--plate-yellow)',
  green: 'var(--plate-green)',
  red: 'var(--plate-red)',
  blue: 'var(--plate-blue)',
}

export interface ProgressRingProps {
  value: number
  max: number
  /** Spoken description, e.g. "1.640 van 2.400 kcal". Empty = decorative. */
  label: string
  size?: number
  thickness?: number
  tone?: Tone
  /** Fill up from empty when it appears (dashboards). */
  animateIn?: boolean
  children?: ReactNode
}

/** Ring for calories and the rest timer. Square line ends: machined, not bubbly. */
export function ProgressRing({
  value,
  max,
  label,
  size = 160,
  thickness = 10,
  tone = 'yellow',
  animateIn = false,
  children,
}: ProgressRingProps) {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const fraction = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0

  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={thickness}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokes[tone]}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          initial={animateIn ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: circumference * (1 - fraction) }}
          transition={{ duration: animateIn ? 0.9 : 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div aria-hidden className="absolute inset-0 grid place-items-center text-center">
        {children}
      </div>
    </div>
  )
}
