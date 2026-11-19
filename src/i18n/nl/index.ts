import { body } from './body'
import { common } from './common'
import { design } from './design'
import { landing } from './landing'
import { me } from './me'
import { nutrition } from './nutrition'
import { onboarding } from './onboarding'
import { insights, progress } from './progress'
import { ARTICLE_FOR_RULE, articles, scienceUi } from './science'
import { today } from './today'
import { training } from './training'

/**
 * Dutch (Flemish-friendly, informal "je") UI strings, one file per tab or area so texts
 * are easy to find. English can be added later as `en/` with the same shape (`Messages`).
 */
export const nl = {
  ...common,
  ...body,
  landing,
  onboarding,
  training,
  today,
  nutrition,
  progress,
  insights,
  me,
  science: { ...scienceUi, articles, articleForRule: ARTICLE_FOR_RULE },
  design,
}

export type Messages = typeof nl
