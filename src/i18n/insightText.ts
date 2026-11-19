import type { Insight } from '../domain/analysis/rules'
import { t } from './index'
import { formatNumber } from './format'

const i18n = t.insights

/** Title, message and "Waarom?" text for an analysis insight (SPEC §5.3). */
export function insightText(
  insight: Insight,
  name: (id: string) => string,
  cutting: boolean,
): { title: string; body: string; why: string } {
  const n = (x: number) => formatNumber(x, 1)
  const list = (ms: Array<{ muscle: keyof typeof t.muscles; sets: number }>) =>
    ms.map((m) => `${t.muscles[m.muscle]} ${n(m.sets)}`).join(', ')
  switch (insight.id) {
    case 'R1_low':
      return { ...i18n.R1_low, body: i18n.R1_low.body(list(insight.muscles)) }
    case 'R1_high':
      return { ...i18n.R1_high, body: i18n.R1_high.body(list(insight.muscles)) }
    case 'R2':
      return { ...i18n.R2, body: i18n.R2.body(t.muscles[insight.muscle], n(insight.sets)) }
    case 'R3':
      return { ...i18n.R3, body: i18n.R3.body(n(insight.averageRir)) }
    case 'R4':
      return { ...i18n.R4, body: i18n.R4.body(formatNumber(insight.medianSec, 0)) }
    case 'R5':
      return { ...i18n.R5, body: i18n.R5.body(t.muscles[insight.muscle], name(insight.suggestion)) }
    case 'R6': {
      const [first, second] = t.progress.balancePairs[insight.pair]
      const strongIsFirst = ['push', 'quads', 'front_delts'].includes(insight.strong)
      return {
        ...i18n.R6,
        body: i18n.R6.body(
          strongIsFirst ? first : second,
          strongIsFirst ? second : first,
          n(insight.ratio),
        ),
      }
    }
    case 'R7':
      return {
        ...i18n.R7,
        body: (cutting ? i18n.R7.bodyCut : i18n.R7.body)(name(insight.exerciseId)),
      }
    case 'R8':
      return { ...i18n.R8, body: i18n.R8.body(insight.declining) }
    case 'R9':
      return { ...i18n.R9, body: i18n.R9.body(t.muscles[insight.muscle], n(insight.sets)) }
  }
}
