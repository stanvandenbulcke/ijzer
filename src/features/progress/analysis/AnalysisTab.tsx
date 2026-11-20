import { HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import type { TrainingData } from '../../../data/useTrainingData'
import { analyse, freshness, type Freshness, type Insight } from '../../../domain/analysis/rules'
import { MUSCLE_IDS } from '../../../domain/muscles/taxonomy'
import { t } from '../../../i18n'
import { insightText } from '../../../i18n/insightText'
import { Badge } from '../../../ui/Badge'
import { cx } from '../../../ui/cx'
import { Section } from '../Section'
import { WellbeingSection } from './WellbeingSection'

const a = t.progress.analysis
const RULES_OF_THUMB = new Set(['R6', 'R7', 'R8'])
const tone = { waarschuwing: 'pr', tip: 'info', info: 'muted' } as const

function InsightCard({
  insight,
  name,
  cutting,
}: {
  insight: Insight
  name: (id: string) => string
  cutting: boolean
}) {
  const [open, setOpen] = useState(false)
  const { title, body, why } = insightText(insight, name, cutting)
  return (
    <article className="rounded-md border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <Badge tone={tone[insight.severity]}>{a.severity[insight.severity]}</Badge>
        {RULES_OF_THUMB.has(insight.id) && <Badge tone="estimate">{a.ruleOfThumb}</Badge>}
      </div>
      <h3 className="mt-2 font-display text-2xl leading-tight font-bold uppercase">{title}</h3>
      <p className="mt-1">{body}</p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="press mt-1 flex min-h-11 items-center gap-1 text-sm font-semibold text-accent-text"
      >
        <HelpCircle aria-hidden size={16} />
        {t.common.why}
      </button>
      {open && (
        <p className="selectable text-sm text-muted">
          {why}{' '}
          {t.science.articleForRule[insight.id] && (
            <Link
              to={`/wetenschap/${t.science.articleForRule[insight.id]}`}
              className="font-semibold text-accent-text underline"
            >
              {t.science.readMore}
            </Link>
          )}
        </p>
      )}
    </article>
  )
}

const freshColor: Record<Freshness, string> = {
  fresh: 'bg-plate-green',
  recovering: 'bg-plate-yellow',
  just_trained: 'bg-plate-red',
}

export function AnalysisTab({
  data,
  today,
  cutting,
}: {
  data: TrainingData
  today: string
  cutting: boolean
}) {
  const insights = analyse({ perfs: data.perfs, byId: data.library.byId, today, cutting })
  const fresh = freshness(data.perfs, data.library.byId, new Date().toISOString())
  const name = (id: string) => data.library.byId(id)?.name ?? id
  const freshMuscles = MUSCLE_IDS.filter((m) => fresh[m])

  return (
    <>
      <p className="mt-5 text-sm text-muted">{a.intro}</p>
      <div className="mt-4 flex flex-col gap-3">
        {insights.length === 0 && <p className="rounded-md border border-line p-4">{a.none}</p>}
        {insights.map((insight, i) => (
          <InsightCard key={`${insight.id}${i}`} insight={insight} name={name} cutting={cutting} />
        ))}
      </div>
      {freshMuscles.length > 0 && (
        <Section title={a.freshnessTitle} note={a.freshnessNote}>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {freshMuscles.map((m) => (
              <li key={m} className="flex items-center gap-2 text-sm">
                <span aria-hidden className={cx('size-2.5 rounded-full', freshColor[fresh[m]!])} />
                <span className="flex-1">{t.muscles[m]}</span>
                <span className="text-muted">{a.freshness[fresh[m]!]}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <WellbeingSection data={data} />
    </>
  )
}
