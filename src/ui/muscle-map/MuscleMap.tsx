import type { MuscleId } from '../../domain/muscles/taxonomy'
import { t } from '../../i18n'
import { BACK, FRONT, type Shape } from './shapes'

/** Fill per muscle: a CSS colour (e.g. a token variable) and an opacity. */
export type MuscleFill = Partial<Record<MuscleId, { color: string; opacity?: number }>>

export interface MuscleMapProps {
  fills: MuscleFill
  /** Spoken summary, e.g. "Borst direct, triceps indirect". */
  label: string
  /** Tap a muscle (used to pick muscles for a custom exercise). */
  onToggle?: (muscle: MuscleId) => void
  size?: 'sm' | 'md' | 'lg'
}

const widths = { sm: 'w-24', md: 'w-40', lg: 'w-56' }

function Figure({
  shapes,
  fills,
  onToggle,
  title,
}: {
  shapes: Shape[]
  fills: MuscleFill
  onToggle?: (m: MuscleId) => void
  title: string
}) {
  const render = (shape: Shape, i: number, mirrored: boolean) => {
    const fill = shape.muscle ? fills[shape.muscle] : undefined
    const interactive = Boolean(onToggle && shape.muscle)
    return (
      <polygon
        key={`${mirrored ? 'm' : 'o'}${i}`}
        points={shape.points}
        transform={mirrored ? 'translate(100,0) scale(-1,1)' : undefined}
        fill={fill ? fill.color : shape.muscle ? 'var(--surface-2)' : 'var(--line)'}
        fillOpacity={fill?.opacity ?? 1}
        stroke="var(--bg)"
        strokeWidth={0.8}
        strokeLinejoin="round"
        className={interactive ? 'cursor-pointer' : undefined}
        onClick={interactive ? () => onToggle!(shape.muscle!) : undefined}
      >
        {shape.muscle && <title>{t.muscles[shape.muscle]}</title>}
      </polygon>
    )
  }
  return (
    <figure className="flex flex-1 flex-col items-center gap-1">
      <svg viewBox="20 0 60 190" className="w-full">
        {shapes.map((s, i) => render(s, i, false))}
        {shapes.map((s, i) => render(s, i, true))}
      </svg>
      <figcaption className="text-xs text-muted">{title}</figcaption>
    </figure>
  )
}

/**
 * Front and back view with muscles coloured by `fills`. Unfilled muscles are a quiet
 * surface colour, so the highlighted ones stand out.
 */
export function MuscleMap({ fills, label, onToggle, size = 'md' }: MuscleMapProps) {
  return (
    <div role="img" aria-label={label} className={`flex gap-2 ${widths[size]}`}>
      <Figure shapes={FRONT} fills={fills} onToggle={onToggle} title={t.muscleMap.front} />
      <Figure shapes={BACK} fills={fills} onToggle={onToggle} title={t.muscleMap.back} />
    </div>
  )
}
