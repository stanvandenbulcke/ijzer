import { Link } from 'react-router'
import type { Insight } from '../../domain/analysis/rules'
import { t } from '../../i18n'
import { insightText } from '../../i18n/insightText'
import { Badge } from '../../ui/Badge'
import { Card } from './TodayCards'

const d = t.today

/**
 * The most important tip from your own training (SPEC §5.3), or — without enough data — a
 * fact from the science library. Every tip links to its article with sources.
 */
export function CoachCard({
  insight,
  name,
  cutting,
  dayOfYear,
}: {
  insight: Insight | null
  name: (id: string) => string
  cutting: boolean
  dayOfYear: number
}) {
  if (insight) {
    const { title, body } = insightText(insight, name, cutting)
    const article = t.science.articleForRule[insight.id]
    return (
      <Card
        title={d.coach}
        action={
          <Link
            to="/progressie/analyse"
            className="min-h-11 py-3 text-sm font-semibold text-accent-text"
          >
            {d.allTips}
          </Link>
        }
      >
        <p className="font-display text-2xl leading-tight font-bold uppercase">{title}</p>
        <p className="mt-1">{body}</p>
        {article && (
          <Link
            to={`/wetenschap/${article}`}
            className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-accent-text underline"
          >
            {d.readMore}
          </Link>
        )}
      </Card>
    )
  }
  const fact = t.science.articles[dayOfYear % t.science.articles.length]!
  return (
    <Card
      title={d.coachFact}
      action={
        <Badge tone={fact.level === 'evidentie' ? 'info' : 'estimate'}>
          {t.science.levels[fact.level]}
        </Badge>
      }
    >
      <p className="font-display text-2xl leading-tight font-bold uppercase">{fact.title}</p>
      <p className="mt-1">{fact.short}</p>
      <Link
        to={`/wetenschap/${fact.id}`}
        className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-accent-text underline"
      >
        {d.readMore}
      </Link>
    </Card>
  )
}
