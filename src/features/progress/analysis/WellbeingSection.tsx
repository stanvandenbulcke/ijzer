import { useCheckIns } from '../../../data/checkInsRepo'
import type { TrainingData } from '../../../data/useTrainingData'
import {
  MIN_PAIRED,
  pairedDays,
  wellbeingInsights,
  type WellbeingInsight,
} from '../../../domain/insights/wellbeing'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Badge } from '../../../ui/Badge'
import { Section } from '../Section'

const w = t.progress.wellbeing

function strength(r: number): keyof typeof w.strength {
  const a = Math.abs(r)
  return a >= 0.5 ? 'strong' : a >= 0.3 ? 'moderate' : 'weak'
}

function InsightRow({ insight }: { insight: WellbeingInsight }) {
  const pct = formatNumber(Math.abs(insight.differencePct), 1)
  return (
    <article className="rounded-md border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <Badge tone="estimate">{w.strength[strength(insight.correlation)]}</Badge>
      </div>
      <p className="mt-2 font-display text-2xl leading-tight font-bold uppercase">
        {insight.differencePct >= 0
          ? w.stronger(w.factor[insight.factor], pct)
          : w.weaker(w.factor[insight.factor], pct)}
      </p>
      <p className="mt-1 text-sm text-muted">
        {w.basis(insight.paired, insight.goodDays, insight.poorDays)}
      </p>
    </article>
  )
}

/**
 * Energy and sleep versus how strong you were (Stan's idea #6). Shows nothing until there is
 * enough data, and always says that a link is not proof of a cause.
 */
export function WellbeingSection({ data }: { data: TrainingData }) {
  const checkIns = useCheckIns()
  if (!checkIns) return null
  const insights = wellbeingInsights(checkIns, data.perfs)
  const paired = pairedDays(checkIns, data.perfs)
  return (
    <Section title={w.title} note={w.note}>
      {insights.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p>{w.notYet(Math.min(paired, MIN_PAIRED), MIN_PAIRED)}</p>
          <div
            role="progressbar"
            aria-label={w.title}
            aria-valuemin={0}
            aria-valuemax={MIN_PAIRED}
            aria-valuenow={Math.min(paired, MIN_PAIRED)}
            className="h-2 overflow-hidden rounded-full bg-line"
          >
            <div
              className="h-full bg-plate-yellow"
              style={{ width: `${(Math.min(paired, MIN_PAIRED) / MIN_PAIRED) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted">{w.howTo}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {insights.map((insight) => (
            <InsightRow key={insight.factor} insight={insight} />
          ))}
        </div>
      )}
      <p className="mt-3 text-sm text-muted">{w.causation}</p>
    </Section>
  )
}
