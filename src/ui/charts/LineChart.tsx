import { useMemo, useState } from 'react'
import { daysBetween } from '../../domain/time'
import { formatDayShort, formatNumber } from '../../i18n/format'

export interface ChartPoint {
  /** "YYYY-MM-DD" */
  day: string
  value: number
}

export interface ChartSeries {
  points: ChartPoint[]
  color: string
  /** Thin, light points without a line (e.g. raw weigh-ins under the trend). */
  scatter?: boolean
  width?: number
}

export interface LineChartProps {
  series: ChartSeries[]
  /** Spoken summary of what the chart shows. */
  label: string
  unit?: string
  height?: number
  decimals?: number
}

const W = 340
const PAD = { top: 12, right: 8, bottom: 22, left: 34 }

/**
 * Small SVG line chart in our own style. Lines only connect real data points: a day
 * without data is a gap in time, never a dip to zero (SPEC §4.4). Tap to read a value.
 */
export function LineChart({
  series,
  label,
  unit = '',
  height = 180,
  decimals = 1,
}: LineChartProps) {
  const [selected, setSelected] = useState<ChartPoint | null>(null)
  const all = series.flatMap((s) => s.points)

  const scale = useMemo(() => {
    if (all.length === 0) return null
    const days = all.map((p) => p.day).sort()
    const first = days[0]!
    const span = Math.max(1, daysBetween(first, days.at(-1)!))
    const values = all.map((p) => p.value)
    let min = Math.min(...values)
    let max = Math.max(...values)
    const pad = Math.max((max - min) * 0.15, max * 0.02, 1)
    min = Math.max(0, min - pad)
    max = max + pad
    const x = (day: string) =>
      PAD.left + (daysBetween(first, day) / span) * (W - PAD.left - PAD.right)
    const y = (v: number) =>
      PAD.top + (1 - (v - min) / (max - min)) * (height - PAD.top - PAD.bottom)
    return { x, y, min, max, first, last: days.at(-1)! }
  }, [all, height])

  if (!scale) return null
  const ticks = [scale.min, (scale.min + scale.max) / 2, scale.max]

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label} className="w-full">
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={scale.y(v)}
              y2={scale.y(v)}
              stroke="var(--line)"
            />
            <text
              x={PAD.left - 6}
              y={scale.y(v) + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--text-muted)"
            >
              {formatNumber(v, 0)}
            </text>
          </g>
        ))}
        <text x={PAD.left} y={height - 6} fontSize="11" fill="var(--text-muted)">
          {formatDayShort(scale.first)}
        </text>
        <text
          x={W - PAD.right}
          y={height - 6}
          fontSize="11"
          textAnchor="end"
          fill="var(--text-muted)"
        >
          {formatDayShort(scale.last)}
        </text>
        {series.map((s, i) =>
          s.scatter ? (
            s.points.map((p) => (
              <circle
                key={`${i}${p.day}`}
                cx={scale.x(p.day)}
                cy={scale.y(p.value)}
                r={2}
                fill={s.color}
                opacity={0.45}
              />
            ))
          ) : (
            <g key={i}>
              <polyline
                fill="none"
                stroke={s.color}
                strokeWidth={s.width ?? 2.5}
                strokeLinejoin="round"
                points={s.points.map((p) => `${scale.x(p.day)},${scale.y(p.value)}`).join(' ')}
              />
              {s.points.map((p) => (
                <circle
                  key={p.day}
                  cx={scale.x(p.day)}
                  cy={scale.y(p.value)}
                  r={selected === p ? 5 : 3}
                  fill={s.color}
                  stroke="var(--bg)"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          ),
        )}
        {/* Invisible tap targets per point of the first line series. */}
        {(series.find((s) => !s.scatter) ?? series[0])!.points.map((p) => (
          <rect
            key={`hit${p.day}`}
            x={scale.x(p.day) - 12}
            y={0}
            width={24}
            height={height}
            fill="transparent"
            onClick={() => setSelected((cur) => (cur === p ? null : p))}
          />
        ))}
      </svg>
      {selected && (
        <figcaption
          aria-live="polite"
          className="pointer-events-none absolute top-0 right-0 rounded-sm border border-line bg-surface-2 px-2 py-1 text-sm"
        >
          <span className="font-display text-lg font-bold">
            {formatNumber(selected.value, decimals)} {unit}
          </span>{' '}
          <span className="text-muted">{formatDayShort(selected.day)}</span>
        </figcaption>
      )}
    </figure>
  )
}
