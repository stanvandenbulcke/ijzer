import { Trophy } from 'lucide-react'
import { useNavigate } from 'react-router'
import type { TrainingData } from '../../../data/useTrainingData'
import { localDay } from '../../../domain/time'
import { t } from '../../../i18n'
import { formatPeriod } from '../../../i18n/format'

const w = t.wrapped

/**
 * Ways into IRON Wrapped: this month (and last month early in a new month) and, from
 * December on, the whole year. Only periods that actually have workouts are offered.
 */
export function WrappedEntry({ data, today }: { data: TrainingData; today: string }) {
  const navigate = useNavigate()
  const months = new Set(data.workouts.map((x) => localDay(x.startedAt).slice(0, 7)))
  const thisMonth = today.slice(0, 7)
  const [y, m] = thisMonth.split('-').map(Number) as [number, number]
  const lastMonth = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
  const year = String(y)
  const periods = [
    ...(months.has(thisMonth) ? [thisMonth] : []),
    ...(Number(today.slice(8)) <= 7 && months.has(lastMonth) ? [lastMonth] : []),
    ...(m === 12 && months.size > 1 ? [year] : []),
  ]
  if (periods.length === 0) return null
  return (
    <div className="mt-4 flex flex-col gap-2">
      {periods.map((period) => {
        const label = formatPeriod(period)
        return (
          <button
            key={period}
            type="button"
            onClick={() => navigate(`/wrapped/${period}`)}
            className="press flex min-h-16 items-center gap-3 rounded-md border border-accent-edge bg-surface px-4 text-left"
          >
            <Trophy aria-hidden className="shrink-0 text-accent-text" />
            <span className="flex flex-1 flex-col">
              <span className="font-display text-2xl leading-tight font-bold uppercase">
                {period.length === 4 ? w.entryYear(label) : w.entryMonth(label)}
              </span>
              <span className="text-sm text-muted">{w.entryHint}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
